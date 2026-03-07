/**
 * Instagram Graph API client service.
 * Handles all HTTP communication with the Instagram/Facebook Graph API.
 */

import axios, { AxiosError } from "axios";
import {
  GRAPH_API_URL,
  FB_GRAPH_API_URL,
  OAUTH_TOKEN_URL,
  OAUTH_REFRESH_URL,
  CHARACTER_LIMIT,
} from "../constants.js";
import type {
  InstagramAccount,
  MediaContainer,
  MediaObject,
  Comment,
  InsightsResponse,
  MediaListResponse,
  CommentListResponse,
  ContentPublishingLimit,
  TokenInfo,
  ApiError,
  PaginationCursor,
} from "../types.js";

// Access token from environment
function getAccessToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "INSTAGRAM_ACCESS_TOKEN environment variable is required. " +
        "Set it to your long-lived Instagram access token. " +
        "See the Meta App setup guide for instructions on obtaining one."
    );
  }
  return token;
}

// Get the Instagram Business Account ID
function getAccountId(accountId?: string): string {
  const id = accountId || process.env.INSTAGRAM_ACCOUNT_ID;
  if (!id) {
    throw new Error(
      "Instagram Account ID is required. Either pass it as a parameter " +
        "or set INSTAGRAM_ACCOUNT_ID environment variable."
    );
  }
  return id;
}

/**
 * Handle API errors and return actionable error messages.
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as ApiError | undefined;
      const fbError = data?.error;

      if (fbError) {
        const suggestions = getErrorSuggestion(fbError.code, fbError.error_subcode);
        return (
          `Instagram API Error (${fbError.code}): ${fbError.message}` +
          (suggestions ? `\n\nSuggestion: ${suggestions}` : "")
        );
      }

      switch (error.response.status) {
        case 400:
          return "Error: Bad request. Check your parameters and try again.";
        case 401:
          return "Error: Authentication failed. Your access token may have expired. Refresh it using the instagram_refresh_token tool.";
        case 403:
          return "Error: Permission denied. Ensure your app has the required permissions (instagram_business_content_publish, instagram_business_manage_comments, etc.).";
        case 429:
          return "Error: Rate limit exceeded. Instagram limits API calls based on request complexity. Wait a few minutes and try again.";
        case 404:
          return "Error: Resource not found. Check the media ID, comment ID, or account ID.";
        default:
          return `Error: API request failed with status ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Instagram may be experiencing issues. Try again shortly.";
    } else if (error.code === "ENOTFOUND") {
      return "Error: Could not reach Instagram API. Check your network connection.";
    }
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Error: An unexpected error occurred: ${String(error)}`;
}

function getErrorSuggestion(code: number, subcode?: number): string | null {
  switch (code) {
    case 190:
      return "Your access token is invalid or expired. Use instagram_refresh_token to get a new one, or re-authenticate through the OAuth flow.";
    case 10:
      return "Your app doesn't have permission for this action. Check that you've requested the correct scopes (instagram_business_content_publish, instagram_business_manage_comments, instagram_business_manage_insights).";
    case 4:
      return "You've hit the API rate limit. Wait a few minutes before making more requests.";
    case 9:
      return "Too many calls from this account. Reduce frequency of API calls.";
    case 100:
      if (subcode === 33) {
        return "The media container has expired or is invalid. Create a new container and try again.";
      }
      return "Invalid parameter. Double-check all required fields and their formats.";
    case 36003:
      return "You've reached the 25-post-per-day publishing limit. Wait 24 hours before posting again.";
    default:
      return null;
  }
}

/**
 * Make an authenticated request to the Instagram/Facebook Graph API.
 */
export async function makeGraphRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  params?: Record<string, unknown>,
  data?: Record<string, unknown>,
  useFbApi: boolean = false
): Promise<T> {
  const baseUrl = useFbApi ? FB_GRAPH_API_URL : GRAPH_API_URL;
  const token = getAccessToken();

  const response = await axios({
    method,
    url: `${baseUrl}/${endpoint}`,
    params: {
      access_token: token,
      ...params,
    },
    data,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data as T;
}

// ─── Account Operations ───

export async function getAccountInfo(accountId?: string): Promise<InstagramAccount> {
  const id = getAccountId(accountId);
  return makeGraphRequest<InstagramAccount>(id, "GET", {
    fields: "id,username,name,profile_picture_url,followers_count,follows_count,media_count,account_type,biography,website",
  });
}

export async function getPublishingLimit(accountId?: string): Promise<ContentPublishingLimit> {
  const id = getAccountId(accountId);
  return makeGraphRequest<ContentPublishingLimit>(
    `${id}/content_publishing_limit`,
    "GET",
    { fields: "config,quota_usage" }
  );
}

// ─── Media Operations ───

export async function listMedia(
  accountId?: string,
  limit: number = 25,
  after?: string
): Promise<MediaListResponse> {
  const id = getAccountId(accountId);
  const params: Record<string, unknown> = {
    fields: "id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,is_shared_to_feed",
    limit,
  };
  if (after) params.after = after;

  return makeGraphRequest<MediaListResponse>(`${id}/media`, "GET", params);
}

export async function getMediaDetails(mediaId: string): Promise<MediaObject> {
  return makeGraphRequest<MediaObject>(mediaId, "GET", {
    fields: "id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,is_shared_to_feed,children{id,media_type,media_url,thumbnail_url}",
  });
}

// ─── Publishing Operations ───

export async function createMediaContainer(
  accountId: string | undefined,
  params: Record<string, unknown>
): Promise<MediaContainer> {
  const id = getAccountId(accountId);
  return makeGraphRequest<MediaContainer>(`${id}/media`, "POST", params);
}

export async function publishMedia(
  accountId: string | undefined,
  containerId: string
): Promise<{ id: string }> {
  const id = getAccountId(accountId);
  return makeGraphRequest<{ id: string }>(`${id}/media_publish`, "POST", {
    creation_id: containerId,
  });
}

export async function checkContainerStatus(containerId: string): Promise<MediaContainer> {
  return makeGraphRequest<MediaContainer>(containerId, "GET", {
    fields: "id,status_code,status",
  });
}

// ─── Comment Operations ───

export async function listComments(
  mediaId: string,
  limit: number = 25,
  after?: string
): Promise<CommentListResponse> {
  const params: Record<string, unknown> = {
    fields: "id,text,timestamp,username,like_count,replies{id,text,timestamp,username,like_count},hidden",
    limit,
  };
  if (after) params.after = after;

  return makeGraphRequest<CommentListResponse>(`${mediaId}/comments`, "GET", params);
}

export async function replyToComment(
  commentId: string,
  message: string
): Promise<{ id: string }> {
  return makeGraphRequest<{ id: string }>(`${commentId}/replies`, "POST", {
    message,
  });
}

export async function hideComment(commentId: string, hide: boolean = true): Promise<{ success: boolean }> {
  return makeGraphRequest<{ success: boolean }>(commentId, "POST", {
    hide,
  });
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return makeGraphRequest<{ success: boolean }>(commentId, "DELETE");
}

// ─── Insights Operations ───

export async function getAccountInsights(
  accountId: string | undefined,
  metrics: string[],
  period: string,
  since?: string,
  until?: string
): Promise<InsightsResponse> {
  const id = getAccountId(accountId);
  const params: Record<string, unknown> = {
    metric: metrics.join(","),
    period,
  };
  if (since) params.since = since;
  if (until) params.until = until;

  return makeGraphRequest<InsightsResponse>(`${id}/insights`, "GET", params);
}

export async function getMediaInsights(
  mediaId: string,
  metrics: string[]
): Promise<InsightsResponse> {
  return makeGraphRequest<InsightsResponse>(`${mediaId}/insights`, "GET", {
    metric: metrics.join(","),
  });
}

// ─── Hashtag Operations ───

export async function searchHashtag(
  accountId: string | undefined,
  query: string
): Promise<{ data: Array<{ id: string }> }> {
  const id = getAccountId(accountId);
  return makeGraphRequest<{ data: Array<{ id: string }> }>(
    "ig_hashtag_search",
    "GET",
    { user_id: id, q: query }
  );
}

export async function getHashtagTopMedia(
  hashtagId: string,
  accountId?: string
): Promise<MediaListResponse> {
  const id = getAccountId(accountId);
  return makeGraphRequest<MediaListResponse>(
    `${hashtagId}/top_media`,
    "GET",
    {
      user_id: id,
      fields: "id,media_type,permalink,timestamp,caption,like_count,comments_count",
    }
  );
}

export async function getHashtagRecentMedia(
  hashtagId: string,
  accountId?: string
): Promise<MediaListResponse> {
  const id = getAccountId(accountId);
  return makeGraphRequest<MediaListResponse>(
    `${hashtagId}/recent_media`,
    "GET",
    {
      user_id: id,
      fields: "id,media_type,permalink,timestamp,caption,like_count,comments_count",
    }
  );
}

// ─── Token Operations ───

export async function refreshAccessToken(): Promise<TokenInfo> {
  const token = getAccessToken();
  return makeGraphRequest<TokenInfo>("refresh_access_token", "GET", {
    grant_type: "ig_refresh_token",
    access_token: token,
  });
}

// ─── Mentions & Tags ───

export async function getMentionedMedia(
  accountId: string | undefined,
  limit: number = 25
): Promise<MediaListResponse> {
  const id = getAccountId(accountId);
  return makeGraphRequest<MediaListResponse>(`${id}/tags`, "GET", {
    fields: "id,media_type,permalink,timestamp,caption,username",
    limit,
  });
}
