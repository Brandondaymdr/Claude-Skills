/**
 * Instagram account management and discovery tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetAccountInfoSchema,
  GetPublishingLimitSchema,
  ListMediaSchema,
  GetMediaDetailsSchema,
  RefreshTokenSchema,
  SearchHashtagSchema,
  GetHashtagMediaSchema,
  GetMentionsSchema,
} from "../schemas/account.js";
import type {
  GetAccountInfoInput,
  GetPublishingLimitInput,
  ListMediaInput,
  GetMediaDetailsInput,
  SearchHashtagInput,
  GetHashtagMediaInput,
  GetMentionsInput,
} from "../schemas/account.js";
import {
  getAccountInfo,
  getPublishingLimit,
  listMedia,
  getMediaDetails,
  refreshAccessToken,
  searchHashtag,
  getHashtagTopMedia,
  getHashtagRecentMedia,
  getMentionedMedia,
  handleApiError,
} from "../services/instagram-api.js";

export function registerAccountTools(server: McpServer): void {
  // ─── Get Account Info ───
  server.registerTool(
    "instagram_get_account_info",
    {
      title: "Get Account Info",
      description: `Get profile information for an Instagram Business or Creator account.

Returns username, display name, bio, profile picture, follower/following counts, and total media count.

Args:
  - account_id (string, optional): IG Business Account ID (defaults to env var)

Returns: Account profile data.`,
      inputSchema: GetAccountInfoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetAccountInfoInput) => {
      try {
        const account = await getAccountInfo(params.account_id);
        const lines = [
          `# @${account.username}`,
          account.name ? `**${account.name}**` : "",
          "",
          account.biography ? `*${account.biography}*\n` : "",
          `- **Followers**: ${account.followers_count?.toLocaleString() || "N/A"}`,
          `- **Following**: ${account.follows_count?.toLocaleString() || "N/A"}`,
          `- **Posts**: ${account.media_count?.toLocaleString() || "N/A"}`,
          `- **Account Type**: ${account.account_type || "N/A"}`,
          account.website ? `- **Website**: ${account.website}` : "",
          `- **Account ID**: \`${account.id}\``,
        ].filter(Boolean);

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Get Publishing Limit ───
  server.registerTool(
    "instagram_get_publishing_limit",
    {
      title: "Check Publishing Limit",
      description: `Check how many of the 25 daily API-published posts you've used.

Instagram limits API-published content to 25 posts per 24-hour rolling window. Use this to check remaining capacity before publishing.

Args:
  - account_id (string, optional): IG Business Account ID

Returns: Current usage and total quota.`,
      inputSchema: GetPublishingLimitSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetPublishingLimitInput) => {
      try {
        const limit = await getPublishingLimit(params.account_id);
        const remaining = limit.config.quota_total - limit.quota_usage;
        return {
          content: [{
            type: "text" as const,
            text: `# Publishing Limit Status\n\n- **Used**: ${limit.quota_usage} / ${limit.config.quota_total}\n- **Remaining**: ${remaining}\n- **Window**: ${limit.config.quota_duration / 3600} hours\n\n${remaining <= 3 ? "Warning: Approaching daily limit. Space out your posts." : "You have plenty of publishing capacity remaining."}`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── List Media ───
  server.registerTool(
    "instagram_list_media",
    {
      title: "List Account Media",
      description: `List recent media posts from an Instagram account.

Returns posts with their type, caption, engagement metrics, and permalink. Use the 'after' cursor for pagination.

Args:
  - limit (number, optional): Max items to return (default: 25, max: 100)
  - after (string, optional): Pagination cursor
  - account_id (string, optional): IG Business Account ID

Returns: List of media objects with metadata.`,
      inputSchema: ListMediaSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListMediaInput) => {
      try {
        const result = await listMedia(params.account_id, params.limit, params.after);

        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No media found for this account." }],
          };
        }

        const lines: string[] = [`# Recent Media (${result.data.length} items)\n`];

        for (const media of result.data) {
          const date = new Date(media.timestamp).toLocaleDateString();
          const caption = media.caption
            ? media.caption.substring(0, 100) + (media.caption.length > 100 ? "..." : "")
            : "(no caption)";
          lines.push(`### ${media.media_type} — ${date}`);
          lines.push(`${caption}`);
          lines.push(`Likes: ${media.like_count || 0} | Comments: ${media.comments_count || 0}`);
          lines.push(`ID: \`${media.id}\` | [View on Instagram](${media.permalink})`);
          lines.push("");
        }

        if (result.paging?.cursors?.after) {
          lines.push(`---\nMore items available. Use after: "${result.paging.cursors.after}" for next page.`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Get Media Details ───
  server.registerTool(
    "instagram_get_media_details",
    {
      title: "Get Media Details",
      description: `Get detailed information about a specific Instagram post, reel, or story.

Returns full caption, media URLs, timestamps, engagement counts, and for carousels, all child items.

Args:
  - media_id (string, required): The media ID

Returns: Complete media object with all metadata.`,
      inputSchema: GetMediaDetailsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetMediaDetailsInput) => {
      try {
        const media = await getMediaDetails(params.media_id);
        const lines = [
          `# ${media.media_type} — ${new Date(media.timestamp).toLocaleString()}`,
          "",
          media.caption || "(no caption)",
          "",
          `- **Likes**: ${media.like_count || 0}`,
          `- **Comments**: ${media.comments_count || 0}`,
          `- **Media ID**: \`${media.id}\``,
          media.permalink ? `- **Permalink**: ${media.permalink}` : "",
          media.media_url ? `- **Media URL**: ${media.media_url}` : "",
        ].filter(Boolean);

        if (media.children?.data) {
          lines.push("", "## Carousel Items");
          for (const child of media.children.data) {
            lines.push(`- ${child.media_type}: \`${child.id}\``);
          }
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Refresh Token ───
  server.registerTool(
    "instagram_refresh_token",
    {
      title: "Refresh Access Token",
      description: `Refresh the long-lived Instagram access token.

Long-lived tokens expire after 60 days. Refresh before expiry to maintain API access. The new token replaces the old one.

Important: After refreshing, update your INSTAGRAM_ACCESS_TOKEN environment variable with the new token.

Returns: New access token and expiry info.`,
      inputSchema: RefreshTokenSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const result = await refreshAccessToken();
        return {
          content: [{
            type: "text" as const,
            text: `Token refreshed successfully!\n\n- **New Token**: ${result.access_token.substring(0, 20)}...${result.access_token.substring(result.access_token.length - 10)}\n- **Expires In**: ${result.expires_in ? Math.floor(result.expires_in / 86400) + " days" : "~60 days"}\n\nIMPORTANT: Update your INSTAGRAM_ACCESS_TOKEN environment variable with the full new token.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Search Hashtag ───
  server.registerTool(
    "instagram_search_hashtag",
    {
      title: "Search Hashtag",
      description: `Search for a hashtag and get its ID for further queries.

You can search up to 30 unique hashtags per 7-day rolling window. Use the returned hashtag ID with instagram_get_hashtag_media to find top or recent posts.

Args:
  - query (string, required): Hashtag to search (without # symbol)
  - account_id (string, optional): IG Business Account ID

Returns: Hashtag ID.`,
      inputSchema: SearchHashtagSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: SearchHashtagInput) => {
      try {
        const result = await searchHashtag(params.account_id, params.query);
        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: `No results found for hashtag "${params.query}".` }],
          };
        }
        return {
          content: [{
            type: "text" as const,
            text: `Hashtag #${params.query}\nHashtag ID: \`${result.data[0].id}\`\n\nUse this ID with instagram_get_hashtag_media to see top or recent posts.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Get Hashtag Media ───
  server.registerTool(
    "instagram_get_hashtag_media",
    {
      title: "Get Hashtag Media",
      description: `Get top or recent media for a hashtag.

Useful for competitive research, trend spotting, and content inspiration. Use instagram_search_hashtag first to get the hashtag ID.

Args:
  - hashtag_id (string, required): Hashtag ID from instagram_search_hashtag
  - type (string, optional): "top" or "recent" (default: "top")
  - account_id (string, optional): IG Business Account ID

Returns: List of media posts using this hashtag.`,
      inputSchema: GetHashtagMediaSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetHashtagMediaInput) => {
      try {
        const result = params.type === "recent"
          ? await getHashtagRecentMedia(params.hashtag_id, params.account_id)
          : await getHashtagTopMedia(params.hashtag_id, params.account_id);

        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No media found for this hashtag." }],
          };
        }

        const lines: string[] = [`# Hashtag ${params.type === "recent" ? "Recent" : "Top"} Media\n`];

        for (const media of result.data) {
          const caption = media.caption
            ? media.caption.substring(0, 120) + (media.caption.length > 120 ? "..." : "")
            : "(no caption)";
          lines.push(`- **${media.media_type}** — ${caption}`);
          lines.push(`  Likes: ${media.like_count || 0} | Comments: ${media.comments_count || 0} | [View](${media.permalink})`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Get Mentions ───
  server.registerTool(
    "instagram_get_mentions",
    {
      title: "Get Tagged/Mentioned Media",
      description: `Get media where the account has been tagged or mentioned.

Useful for community monitoring and finding user-generated content about your brand.

Args:
  - limit (number, optional): Max items to return (default: 25)
  - account_id (string, optional): IG Business Account ID

Returns: List of media where the account is tagged.`,
      inputSchema: GetMentionsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetMentionsInput) => {
      try {
        const result = await getMentionedMedia(params.account_id, params.limit);

        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No tagged/mentioned media found." }],
          };
        }

        const lines: string[] = [`# Tagged/Mentioned Media (${result.data.length} items)\n`];

        for (const media of result.data) {
          const caption = media.caption
            ? media.caption.substring(0, 100) + (media.caption.length > 100 ? "..." : "")
            : "(no caption)";
          lines.push(`- **${media.media_type}** — ${caption}`);
          if (media.permalink) lines.push(`  [View on Instagram](${media.permalink})`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
