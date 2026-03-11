/**
 * Instagram comment management tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListCommentsSchema,
  ReplyToCommentSchema,
  HideCommentSchema,
  DeleteCommentSchema,
} from "../schemas/comments.js";
import type {
  ListCommentsInput,
  ReplyToCommentInput,
  HideCommentInput,
  DeleteCommentInput,
} from "../schemas/comments.js";
import {
  listComments,
  replyToComment,
  hideComment,
  deleteComment,
  handleApiError,
} from "../services/instagram-api.js";

export function registerCommentTools(server: McpServer): void {
  // ─── List Comments ───
  server.registerTool(
    "instagram_list_comments",
    {
      title: "List Comments on Media",
      description: `List comments on a specific Instagram post, reel, or other media.

Returns comments with usernames, timestamps, like counts, and any replies. Use the 'after' cursor for pagination through large comment threads.

Args:
  - media_id (string, required): The media ID to list comments for
  - limit (number, optional): Max comments to return (default: 25, max: 100)
  - after (string, optional): Pagination cursor for next page

Returns: List of comments with metadata and any nested replies.`,
      inputSchema: ListCommentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListCommentsInput) => {
      try {
        const result = await listComments(params.media_id, params.limit, params.after);

        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No comments found on this media." }],
          };
        }

        const lines: string[] = [`# Comments (${result.data.length} shown)\n`];

        for (const comment of result.data) {
          const hidden = comment.hidden ? " [HIDDEN]" : "";
          lines.push(`**@${comment.username}**${hidden} — ${new Date(comment.timestamp).toLocaleString()}`);
          lines.push(`${comment.text}`);
          if (comment.like_count) lines.push(`Likes: ${comment.like_count}`);
          lines.push(`Comment ID: \`${comment.id}\``);

          if (comment.replies?.data) {
            for (const reply of comment.replies.data) {
              lines.push(`  > **@${reply.username}**: ${reply.text}`);
              lines.push(`  > Reply ID: \`${reply.id}\``);
            }
          }
          lines.push("");
        }

        if (result.paging?.cursors?.after) {
          lines.push(`\n---\nMore comments available. Use after: "${result.paging.cursors.after}" to get the next page.`);
        }

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Reply to Comment ───
  server.registerTool(
    "instagram_reply_to_comment",
    {
      title: "Reply to Comment",
      description: `Reply to a comment on an Instagram post.

The reply will appear as a nested response under the original comment. Useful for community engagement and responding to questions.

Args:
  - comment_id (string, required): The comment ID to reply to
  - message (string, required): Reply text (max 2,200 chars)

Returns: The reply comment ID.`,
      inputSchema: ReplyToCommentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: ReplyToCommentInput) => {
      try {
        const result = await replyToComment(params.comment_id, params.message);
        return {
          content: [{
            type: "text" as const,
            text: `Reply posted successfully!\n\nReply ID: ${result.id}`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Hide Comment ───
  server.registerTool(
    "instagram_hide_comment",
    {
      title: "Hide/Unhide Comment",
      description: `Hide or unhide a comment on an Instagram post.

Hidden comments are still visible to the commenter but not to other users. This is less severe than deleting and can be reversed.

Args:
  - comment_id (string, required): The comment ID
  - hide (boolean, optional): True to hide, false to unhide (default: true)

Returns: Success confirmation.`,
      inputSchema: HideCommentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: HideCommentInput) => {
      try {
        await hideComment(params.comment_id, params.hide);
        const action = params.hide ? "hidden" : "unhidden";
        return {
          content: [{
            type: "text" as const,
            text: `Comment ${params.comment_id} has been ${action} successfully.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Delete Comment ───
  server.registerTool(
    "instagram_delete_comment",
    {
      title: "Delete Comment",
      description: `Permanently delete a comment from an Instagram post.

This action cannot be undone. Consider using instagram_hide_comment first if you might want to restore the comment later.

Args:
  - comment_id (string, required): The comment ID to delete

Returns: Success confirmation.`,
      inputSchema: DeleteCommentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: DeleteCommentInput) => {
      try {
        await deleteComment(params.comment_id);
        return {
          content: [{
            type: "text" as const,
            text: `Comment ${params.comment_id} has been permanently deleted.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
