import { z } from "zod";

export const GetAccountInfoSchema = z.object({
  account_id: z.string().optional()
    .describe("Instagram Business Account ID (defaults to INSTAGRAM_ACCOUNT_ID env var)"),
}).strict();

export const GetPublishingLimitSchema = z.object({
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const ListMediaSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of media items to return (default: 25)"),
  after: z.string().optional()
    .describe("Pagination cursor to get next page of results"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const GetMediaDetailsSchema = z.object({
  media_id: z.string()
    .describe("The Instagram media ID to get details for"),
}).strict();

export const RefreshTokenSchema = z.object({}).strict();

export const SearchHashtagSchema = z.object({
  query: z.string().min(1).max(100)
    .describe("Hashtag to search for (without the # symbol)"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const GetHashtagMediaSchema = z.object({
  hashtag_id: z.string()
    .describe("Hashtag ID (from instagram_search_hashtag)"),
  type: z.enum(["top", "recent"]).default("top")
    .describe("Get top media or recent media for the hashtag"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const GetMentionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of mentions to return"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export type GetAccountInfoInput = z.infer<typeof GetAccountInfoSchema>;
export type GetPublishingLimitInput = z.infer<typeof GetPublishingLimitSchema>;
export type ListMediaInput = z.infer<typeof ListMediaSchema>;
export type GetMediaDetailsInput = z.infer<typeof GetMediaDetailsSchema>;
export type SearchHashtagInput = z.infer<typeof SearchHashtagSchema>;
export type GetHashtagMediaInput = z.infer<typeof GetHashtagMediaSchema>;
export type GetMentionsInput = z.infer<typeof GetMentionsSchema>;
