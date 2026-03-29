import type { IncomingMessage } from "node:http";
import type { DbAdapter } from "../db/pool.js";

export function parseQueryParams(req: IncomingMessage): URLSearchParams {
  const url = new URL(req.url ?? "/", "http://localhost");
  return url.searchParams;
}

export function parseCursor(params: URLSearchParams, defaultLimit = 20, maxLimit = 50) {
  const cursor = params.get("cursor") || null;
  let limit = parseInt(params.get("limit") || String(defaultLimit), 10);
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { cursor, limit };
}

export function cursorResponse<T>(
  rows: T[],
  limit: number,
  getCursor: (row: T) => string
): { data: T[]; next_cursor: string | null } {
  if (rows.length > limit) {
    const data = rows.slice(0, limit);
    return { data, next_cursor: getCursor(data[data.length - 1]) };
  }
  return { data: rows, next_cursor: null };
}

export async function attachAttachmentsToRows(
  db: DbAdapter,
  rows: Array<Record<string, unknown>>
): Promise<void> {
  const postIds = rows.map((r) => r.id as string).filter(Boolean);
  if (postIds.length === 0) return;

  const placeholders = postIds.map((_, i) => `$${i + 1}`).join(",");
  const result = await db.query(
    `SELECT id, post_id, upload_key, position FROM post_attachments
     WHERE post_id IN (${placeholders})
     ORDER BY position ASC`,
    postIds
  );

  const byPost = new Map<string, Array<Record<string, unknown>>>();
  for (const row of result.rows) {
    const pid = row.post_id as string;
    if (!byPost.has(pid)) byPost.set(pid, []);
    byPost.get(pid)!.push(row);
  }

  for (const row of rows) {
    row.attachments = byPost.get(row.id as string) ?? [];
  }
}

/**
 * Fire-and-forget notification insert. Never throws, never blocks the caller.
 * When `dedup` is true, skips if an identical notification already exists.
 */
export function notify(
  db: DbAdapter,
  opts: {
    recipient: string;
    type: string;
    actor: string;
    postId?: string;
    conversationId?: string;
    dedup?: boolean;
  },
): void {
  const { recipient, type, actor, postId, conversationId, dedup } = opts;

  if (recipient === actor) return;

  if (dedup) {
    const conditions = [
      "recipient_nullifier = $1",
      "type = $2",
      "actor_nullifier = $3",
    ];
    const params: unknown[] = [recipient, type, actor];
    if (postId) {
      conditions.push(`post_id = $${params.length + 1}`);
      params.push(postId);
    }
    if (conversationId) {
      conditions.push(`conversation_id = $${params.length + 1}`);
      params.push(conversationId);
    }
    db.query(
      `INSERT INTO notifications (id, recipient_nullifier, type, actor_nullifier${postId ? ", post_id" : ""}${conversationId ? ", conversation_id" : ""})
       SELECT gen_random_uuid(), ${params.map((_, i) => `$${i + 1}`).join(", ")}
       WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE ${conditions.join(" AND ")})`,
      params,
    ).catch(() => {});
  } else {
    const columns = ["id", "recipient_nullifier", "type", "actor_nullifier"];
    const params: unknown[] = [recipient, type, actor];
    if (postId) {
      columns.push("post_id");
      params.push(postId);
    }
    if (conversationId) {
      columns.push("conversation_id");
      params.push(conversationId);
    }
    const placeholders = ["gen_random_uuid()", ...params.map((_, i) => `$${i + 1}`)];
    db.query(
      `INSERT INTO notifications (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
      params,
    ).catch(() => {});
  }
}

/**
 * Builds a cursor WHERE clause for pagination.
 * Mutates queryParams by pushing the cursor value if present.
 * Returns the SQL fragment (e.g. "AND n.created_at < $3") or empty string.
 */
export function buildCursorClause(
  cursor: string | null,
  queryParams: unknown[],
  column: string,
): string {
  if (!cursor) return "";
  queryParams.push(cursor);
  return `AND ${column} < $${queryParams.length}`;
}

/**
 * Builds viewer_liked / viewer_bookmarked LEFT JOINs and SELECT fragment.
 * Mutates queryParams by pushing the user's nullifier twice (if authenticated).
 */
export function viewerFlagsSql(
  me: string | null,
  queryParams: unknown[],
  postAlias: string,
): { joins: string; select: string } {
  if (!me) return { joins: "", select: "" };

  queryParams.push(me);
  const likeParam = queryParams.length;
  queryParams.push(me);
  const bookmarkParam = queryParams.length;

  return {
    joins: `LEFT JOIN likes vl ON vl.post_id = ${postAlias}.id AND vl.nullifier = $${likeParam}
           LEFT JOIN bookmarks vb ON vb.post_id = ${postAlias}.id AND vb.nullifier = $${bookmarkParam}`,
    select: ", (vl.nullifier IS NOT NULL) AS viewer_liked, (vb.nullifier IS NOT NULL) AS viewer_bookmarked",
  };
}

export function blockFilterSql(
  nullifier: string,
  startParamIndex: number
): { clause: string; params: string[] } {
  const i = startParamIndex;
  return {
    clause: `AND p.author_nullifier NOT IN (
      SELECT blocked_nullifier FROM blocks WHERE blocker_nullifier = $${i}
      UNION
      SELECT blocker_nullifier FROM blocks WHERE blocked_nullifier = $${i}
    )`,
    params: [nullifier],
  };
}
