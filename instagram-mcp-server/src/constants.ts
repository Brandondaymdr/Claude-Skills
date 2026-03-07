// Instagram Graph API base URL
export const GRAPH_API_BASE = "https://graph.instagram.com";
export const GRAPH_API_VERSION = "v21.0";
export const GRAPH_API_URL = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}`;

// Facebook Graph API (used for some Instagram endpoints)
export const FB_GRAPH_API_BASE = "https://graph.facebook.com";
export const FB_GRAPH_API_URL = `${FB_GRAPH_API_BASE}/${GRAPH_API_VERSION}`;

// OAuth endpoints
export const OAUTH_AUTHORIZE_URL = "https://api.instagram.com/oauth/authorize";
export const OAUTH_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
export const OAUTH_REFRESH_URL = `${GRAPH_API_BASE}/refresh_access_token`;

// Rate limits
export const MAX_POSTS_PER_DAY = 25;
export const MAX_CAPTION_LENGTH = 2200;
export const MAX_HASHTAGS = 30;
export const MAX_MENTIONS = 30;

// Reels constraints
export const REELS_MIN_DURATION_SEC = 5;
export const REELS_MAX_DURATION_SEC = 90;
export const REELS_ASPECT_RATIO = "9:16";

// Response limits
export const CHARACTER_LIMIT = 25000;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = ["image/jpeg", "image/png"];

// Media types
export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  CAROUSEL_ALBUM = "CAROUSEL_ALBUM",
  REELS = "REELS",
  STORIES = "STORIES",
}

// Insight periods
export enum InsightPeriod {
  DAY = "day",
  WEEK = "week",
  DAYS_28 = "days_28",
  MONTH = "month",
  LIFETIME = "lifetime",
}

// Account-level metrics
export const ACCOUNT_METRICS = [
  "impressions",
  "reach",
  "follower_count",
  "profile_views",
  "accounts_engaged",
  "total_interactions",
  "likes",
  "comments",
  "shares",
  "saves",
  "replies",
] as const;

// Media-level metrics
export const MEDIA_METRICS = [
  "impressions",
  "reach",
  "engagement",
  "saved",
  "likes",
  "comments",
  "shares",
  "plays",
  "total_interactions",
] as const;

// Reels-specific metrics
export const REELS_METRICS = [
  "comments",
  "ig_reels_avg_watch_time",
  "ig_reels_video_view_total_time",
  "likes",
  "plays",
  "reach",
  "saved",
  "shares",
  "total_interactions",
] as const;

// Story-specific metrics
export const STORY_METRICS = [
  "exits",
  "impressions",
  "reach",
  "replies",
  "taps_forward",
  "taps_back",
] as const;
