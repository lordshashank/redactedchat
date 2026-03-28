export type Gender = "male" | "female" | "other";

export type FeedType = "latest" | "following" | "trending" | "replies" | "media";

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
  type:
    | "like"
    | "reply"
    | "repost"
    | "follow"
    | "poll_ended"
    | "mention"
    | "dm"
    | "group_invite";
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
