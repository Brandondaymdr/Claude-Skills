import { z } from "zod";

export const ListCommentsSchema = z.object({
  media_id: z.string()
    .describe("The Instagram media ID to list comments for"),
  limit: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of comments to return (default: 25)"),
  after: z.string().optional()
    .describe("Pagination cursor to get next page of results"),
}).strict();

export const ReplyToCommentSchema = z.object({
  comment_id: z.string()
    .describe("The comment ID to reply to"),
  message: z.string().min(1).max(2200)
    .describe("The reply text (max 2,200 characters)"),
}).strict();

export const HideCommentSchema = z.object({
  comment_id: z.string()
    .describe("The comment ID to hide or unhide"),
  hide: z.boolean().default(true)
    .describe("True to hide the comment, false to unhide it (default: true)"),
}).strict();

export const DeleteCommentSchema = z.object({
  comment_id: z.string()
    .describe("The comment ID to permanently delete"),
}).strict();

export type ListCommentsInput = z.infer<typeof ListCommentsSchema>;
export type ReplyToCommentInput = z.infer<typeof ReplyToCommentSchema>;
export type HideCommentInput = z.infer<typeof HideCommentSchema>;
export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>;
