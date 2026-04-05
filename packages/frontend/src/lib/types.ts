export type Gender = "male" | "female" | "other";

export type FeedType = "latest" | "following" | "trending" | "replies" | "media";

export type NotificationType =
  | "like"
  | "reply"
  | "repost"
  | "follow"
  | "poll_ended"
  | "mention"
  | "dm"
  | "group_invite";

export interface Profile {
  nullifier: string;
  bio: string | null;
  gender: Gender | null;
  age: number | null;
  avatar_key: string | null;
  banner_key: string | null;
  public_balance: string;
  initial_balance?: string;
  block_number: number;
  block_hash: string;
  post_count: number;
  follower_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
  viewer_following?: boolean;
}

export interface Post {
  id: string;
  author_nullifier: string;
  body: string | null;
  parent_id: string | null;
  root_id: string | null;
  repost_of_id: string | null;
  poll_id: string | null;
  like_count: number;
  repost_count: number;
  reply_count: number;
  view_count: number;
  created_at: string;
  public_balance: string;
  avatar_key: string | null;
  viewer_liked?: boolean;
  viewer_bookmarked?: boolean;
  attachments?: PostAttachment[];
  poll?: PollData;
}

export interface PostAttachment {
  id: string;
  upload_key: string;
  position: number;
}

export interface PollData {
  id: string;
  expires_at: string;
  created_at: string;
  is_expired: boolean;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  label: string;
  position: number;
  vote_count: number;
  total_balance: string;
}

export interface ThreadPost extends Post {
  depth: number;
}

export interface Notification {
  id: string;
  recipient_nullifier: string;
  type: NotificationType;
  actor_nullifier: string;
  post_id: string | null;
  conversation_id: string | null;
  read: boolean;
  created_at: string;
  actor_balance: string;
  actor_avatar: string | null;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  name: string | null;
  last_message_at: string | null;
  created_at: string;
  last_message_body: string | null;
  last_message_sender: string | null;
  unread_count: number;
  members: ConversationMember[];
}

export interface ConversationMember {
  nullifier: string;
  public_balance: string;
  avatar_key: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_nullifier: string;
  body: string | null;
  attachment_key: string | null;
  created_at: string;
  public_balance: string;
  avatar_key: string | null;
}

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
}

export interface TrendingPage<T> {
  data: T[];
  page: number;
  has_more: boolean;
}

export interface VerifyResult {
  valid: boolean;
  blockNumber?: number;
  publicBalance?: string;
  blockHash?: string;
  nullifier?: string;
  profileExists?: boolean;
  expiresAt?: string;
  error?: string;
}

export type LeaderboardProfile = Omit<Profile, "updated_at">;

export interface UserRank {
  rank: number;
  total_users: number;
}

// ── Toggle response types ───────────────────────────────────────

export interface LikeToggleResult {
  liked: boolean;
  like_count: number;
}

export interface FollowToggleResult {
  following: boolean;
  follower_count: number;
}

export interface BookmarkToggleResult {
  bookmarked: boolean;
}

export interface BlockToggleResult {
  blocked: boolean;
}

export interface UploadInitResult {
  key: string;
  uploadUrl: string;
}

// ── Request body types ──────────────────────────────────────────

export interface CreatePostRequest {
  body?: string;
  parent_id?: string;
  repost_of_id?: string;
  attachments?: string[];
  poll?: {
    options: string[];
    expires_in_hours: number;
  };
}

export interface CreateConversationRequest {
  participant?: string;
  participants?: string[];
  is_group?: boolean;
  name?: string;
}

export interface SendMessageRequest {
  body?: string;
  attachment_key?: string;
}

// ── Feedback types ─────────────────────────────────────────────

export type FeedbackType = "bug" | "feature" | "improvement" | "question";

export type FeedbackStatus =
  | "open"
  | "under_review"
  | "planned"
  | "in_progress"
  | "done"
  | "rejected"
  | "duplicate";

export interface FeedbackPost {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  description: string;
  vote_count: number;
  status: FeedbackStatus;
  priority: string | null;
  admin_note: string | null;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
  user_has_voted: boolean;
  attachments?: { key: string; url: string; position: number }[];
}

export interface FeedbackComment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackPostDetail extends FeedbackPost {
  comments: FeedbackComment[];
}

export interface FeedbackListResponse {
  posts: FeedbackPost[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedbackVoteResult {
  voted: boolean;
  vote_count: number;
}

export interface CreateFeedbackRequest {
  type: FeedbackType;
  title: string;
  description: string;
  attachment_keys?: string[];
}
