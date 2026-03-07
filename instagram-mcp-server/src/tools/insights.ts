/**
 * Instagram insights and analytics tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  AccountInsightsSchema,
  MediaInsightsSchema,
  FollowerDemographicsSchema,
} from "../schemas/insights.js";
import type {
  AccountInsightsInput,
  MediaInsightsInput,
  FollowerDemographicsInput,
} from "../schemas/insights.js";
import {
  getAccountInsights,
  getMediaInsights,
  handleApiError,
} from "../services/instagram-api.js";

function formatInsightsMarkdown(data: Array<{ name: string; period: string; values: Array<{ value: number | Record<string, number>; end_time?: string }>; title: string; description: string }>): string {
  const lines: string[] = ["# Instagram Insights\n"];

  for (const metric of data) {
    lines.push(`## ${metric.title}`);
    lines.push(`*${metric.description}*\n`);
    lines.push(`Period: ${metric.period}\n`);

    for (const val of metric.values) {
      if (typeof val.value === "object") {
        for (const [key, num] of Object.entries(val.value)) {
          lines.push(`- **${key}**: ${num.toLocaleString()}`);
        }
      } else {
        const timeStr = val.end_time ? ` (${new Date(val.end_time).toLocaleDateString()})` : "";
        lines.push(`- **Value**: ${val.value.toLocaleString()}${timeStr}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function registerInsightsTools(server: McpServer): void {
  // ─── Account Insights ───
  server.registerTool(
    "instagram_get_account_insights",
    {
      title: "Get Account Insights",
      description: `Get analytics metrics for an Instagram Business or Creator account.

Available metrics: impressions, reach, follower_count, profile_views, accounts_engaged, total_interactions, likes, comments, shares, saves, replies.

Available periods: day, week, days_28, month, lifetime.

Some metrics are only available with certain periods. If a metric/period combination is invalid, Instagram will return an error.

Args:
  - metrics (array, required): Metrics to retrieve
  - period (string, required): Time period (day, week, days_28, month, lifetime)
  - since (string, optional): Start date (UNIX timestamp or ISO 8601)
  - until (string, optional): End date (UNIX timestamp or ISO 8601)
  - account_id (string, optional): IG Business Account ID

Returns: Insight data for each requested metric.`,
      inputSchema: AccountInsightsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: AccountInsightsInput) => {
      try {
        const result = await getAccountInsights(
          params.account_id,
          params.metrics,
          params.period,
          params.since,
          params.until
        );

        const text = formatInsightsMarkdown(result.data);
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Media Insights ───
  server.registerTool(
    "instagram_get_media_insights",
    {
      title: "Get Media Insights",
      description: `Get performance metrics for a specific Instagram post, reel, or story.

Available metrics vary by media type:
- Posts: impressions, reach, engagement, saved, likes, comments, shares, total_interactions
- Reels: plays, reach, likes, comments, shares, saved, ig_reels_avg_watch_time, ig_reels_video_view_total_time, total_interactions
- Stories: impressions, reach, exits, replies, taps_forward, taps_back

Args:
  - media_id (string, required): The media ID to get insights for
  - metrics (array, required): Metrics to retrieve

Returns: Insight data for each requested metric on this media.`,
      inputSchema: MediaInsightsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: MediaInsightsInput) => {
      try {
        const result = await getMediaInsights(params.media_id, params.metrics);
        const text = formatInsightsMarkdown(result.data);
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Follower Demographics ───
  server.registerTool(
    "instagram_get_follower_demographics",
    {
      title: "Get Follower Demographics",
      description: `Get audience demographic data for an Instagram Business account.

Requires at least 100 followers.

Available metrics:
- audience_gender_age: Gender and age range breakdown
- audience_locale: Locale/language breakdown
- audience_country: Country breakdown
- audience_city: City breakdown
- online_followers: When followers are online (by hour)

Args:
  - metric (string, required): Which demographic metric to retrieve
  - account_id (string, optional): IG Business Account ID

Returns: Demographic breakdown data.`,
      inputSchema: FollowerDemographicsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: FollowerDemographicsInput) => {
      try {
        const result = await getAccountInsights(
          params.account_id,
          [params.metric],
          "lifetime"
        );

        const text = formatInsightsMarkdown(result.data);
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
