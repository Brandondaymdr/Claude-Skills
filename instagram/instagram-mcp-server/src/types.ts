// Instagram API response types

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  account_type?: string;
  biography?: string;
  website?: string;
}

export interface MediaContainer {
  id: string;
  status_code?: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  status?: string;
}

export interface MediaObject {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  caption?: string;
  like_count?: number;
  comments_count?: number;
  is_shared_to_feed?: boolean;
  children?: { data: MediaObject[] };
}

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  from?: { id: string; username: string };
  like_count?: number;
  replies?: { data: Comment[] };
  hidden?: boolean;
}

export interface InsightValue {
  value: number | Record<string, number>;
  end_time?: string;
}

export interface InsightMetric {
  name: string;
  period: string;
  values: InsightValue[];
  title: string;
  description: string;
  id: string;
}

export interface InsightsResponse {
  data: InsightMetric[];
  paging?: PaginationCursor;
}

export interface PaginationCursor {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  previous?: string;
}

export interface MediaListResponse {
  data: MediaObject[];
  paging?: PaginationCursor;
}

export interface CommentListResponse {
  data: Comment[];
  paging?: PaginationCursor;
}

export interface HashtagSearchResult {
  id: string;
  name?: string;
}

export interface HashtagMediaResponse {
  data: MediaObject[];
  paging?: PaginationCursor;
}

export interface ContentPublishingLimit {
  config: {
    quota_total: number;
    quota_duration: number;
  };
  quota_usage: number;
}

export interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface ApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}
