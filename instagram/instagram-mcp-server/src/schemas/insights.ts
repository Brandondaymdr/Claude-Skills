import { z } from "zod";

export const AccountInsightsSchema = z.object({
  metrics: z.array(z.enum([
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
  ])).min(1, "At least one metric is required")
    .describe("Metrics to retrieve (e.g., impressions, reach, follower_count)"),
  period: z.enum(["day", "week", "days_28", "month", "lifetime"])
    .describe("Time period for the metrics"),
  since: z.string().optional()
    .describe("Start date in UNIX timestamp or ISO 8601 format"),
  until: z.string().optional()
    .describe("End date in UNIX timestamp or ISO 8601 format"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const MediaInsightsSchema = z.object({
  media_id: z.string()
    .describe("The Instagram media ID to get insights for"),
  metrics: z.array(z.enum([
    "impressions",
    "reach",
    "engagement",
    "saved",
    "likes",
    "comments",
    "shares",
    "plays",
    "total_interactions",
    "ig_reels_avg_watch_time",
    "ig_reels_video_view_total_time",
    "video_views",
    "exits",
    "replies",
    "taps_forward",
    "taps_back",
  ])).min(1, "At least one metric is required")
    .describe("Metrics to retrieve for this media object"),
}).strict();

export const FollowerDemographicsSchema = z.object({
  metric: z.enum([
    "audience_gender_age",
    "audience_locale",
    "audience_country",
    "audience_city",
    "online_followers",
  ]).describe("Demographic metric to retrieve"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export type AccountInsightsInput = z.infer<typeof AccountInsightsSchema>;
export type MediaInsightsInput = z.infer<typeof MediaInsightsSchema>;
export type FollowerDemographicsInput = z.infer<typeof FollowerDemographicsSchema>;
