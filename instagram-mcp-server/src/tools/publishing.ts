/**
 * Instagram content publishing tools.
 * Handles creating and publishing photos, videos, reels, stories, and carousels.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  PublishPhotoSchema,
  PublishVideoSchema,
  PublishReelSchema,
  PublishStorySchema,
  PublishCarouselSchema,
  CheckContainerStatusSchema,
  PublishContainerSchema,
} from "../schemas/publishing.js";
import type {
  PublishPhotoInput,
  PublishVideoInput,
  PublishReelInput,
  PublishStoryInput,
  PublishCarouselInput,
  CheckContainerStatusInput,
  PublishContainerInput,
} from "../schemas/publishing.js";
import {
  createMediaContainer,
  publishMedia,
  checkContainerStatus,
  handleApiError,
} from "../services/instagram-api.js";

export function registerPublishingTools(server: McpServer): void {
  // ─── Publish Photo ───
  server.registerTool(
    "instagram_publish_photo",
    {
      title: "Publish Instagram Photo",
      description: `Publish a single photo to Instagram feed.

Requires a publicly accessible image URL (JPEG recommended). The image must be hosted on a server that Instagram can access — local files won't work.

Args:
  - image_url (string, required): Public URL to the image
  - caption (string, optional): Post caption (max 2,200 chars, up to 30 hashtags)
  - location_id (string, optional): Facebook Page location ID
  - user_tags (array, optional): Users to tag with x,y positions (0-1 range)
  - account_id (string, optional): IG Business Account ID

Returns: Published media ID and permalink.

Note: Limited to 25 API-published posts per 24 hours.`,
      inputSchema: PublishPhotoSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishPhotoInput) => {
      try {
        const containerParams: Record<string, unknown> = {
          image_url: params.image_url,
        };
        if (params.caption) containerParams.caption = params.caption;
        if (params.location_id) containerParams.location_id = params.location_id;
        if (params.user_tags) containerParams.user_tags = JSON.stringify(params.user_tags);

        const container = await createMediaContainer(params.account_id, containerParams);
        const result = await publishMedia(params.account_id, container.id);

        return {
          content: [{
            type: "text" as const,
            text: `Photo published successfully!\n\nMedia ID: ${result.id}\nContainer ID: ${container.id}\n\nThe post is now live on Instagram.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Publish Reel ───
  server.registerTool(
    "instagram_publish_reel",
    {
      title: "Publish Instagram Reel",
      description: `Publish a Reel (short-form video) to Instagram.

Reels that are 5-90 seconds with 9:16 aspect ratio are eligible for the Reels tab. The video must be hosted at a publicly accessible URL.

This is a two-step process: first a container is created and the video is processed by Instagram (may take 30-60 seconds), then it's published.

Args:
  - video_url (string, required): Public URL to video (MP4, 9:16 aspect ratio)
  - caption (string, optional): Reel caption (max 2,200 chars)
  - share_to_feed (boolean, optional): Also share to main feed (default: true)
  - thumb_offset (number, optional): Thumbnail frame offset in ms
  - cover_url (string, optional): Custom cover image URL
  - audio_name (string, optional): Name for original audio
  - location_id (string, optional): Location tag
  - collaborators (array, optional): Up to 3 collaborator usernames
  - account_id (string, optional): IG Business Account ID

Returns: Container ID. Use instagram_check_container_status to poll until FINISHED, then instagram_publish_container to publish.`,
      inputSchema: PublishReelSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishReelInput) => {
      try {
        const containerParams: Record<string, unknown> = {
          media_type: "REELS",
          video_url: params.video_url,
          share_to_feed: params.share_to_feed,
        };
        if (params.caption) containerParams.caption = params.caption;
        if (params.thumb_offset !== undefined) containerParams.thumb_offset = params.thumb_offset;
        if (params.cover_url) containerParams.cover_url = params.cover_url;
        if (params.audio_name) containerParams.audio_name = params.audio_name;
        if (params.location_id) containerParams.location_id = params.location_id;
        if (params.collaborators) containerParams.collaborators = params.collaborators;

        const container = await createMediaContainer(params.account_id, containerParams);

        return {
          content: [{
            type: "text" as const,
            text: `Reel container created! Container ID: ${container.id}\n\nInstagram is processing the video. Use instagram_check_container_status with container_id "${container.id}" to check when it's ready (status: FINISHED), then use instagram_publish_container to publish it.\n\nProcessing typically takes 30-60 seconds for short videos.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Publish Story ───
  server.registerTool(
    "instagram_publish_story",
    {
      title: "Publish Instagram Story",
      description: `Publish a Story (image or video) to Instagram.

Stories disappear after 24 hours. Provide either an image_url OR video_url, not both.

Args:
  - image_url (string, optional): Public URL to story image
  - video_url (string, optional): Public URL to story video
  - account_id (string, optional): IG Business Account ID

Returns: Container ID for stories with video. For image stories, publishes immediately.`,
      inputSchema: PublishStorySchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishStoryInput) => {
      try {
        if (!params.image_url && !params.video_url) {
          return {
            content: [{
              type: "text" as const,
              text: "Error: You must provide either image_url or video_url for the story.",
            }],
          };
        }

        const containerParams: Record<string, unknown> = {
          media_type: "STORIES",
        };
        if (params.image_url) containerParams.image_url = params.image_url;
        if (params.video_url) containerParams.video_url = params.video_url;

        const container = await createMediaContainer(params.account_id, containerParams);

        if (params.image_url) {
          // Image stories can be published immediately
          const result = await publishMedia(params.account_id, container.id);
          return {
            content: [{
              type: "text" as const,
              text: `Story published successfully!\n\nMedia ID: ${result.id}\n\nThe story is now live and will be visible for 24 hours.`,
            }],
          };
        }

        // Video stories need processing time
        return {
          content: [{
            type: "text" as const,
            text: `Story container created! Container ID: ${container.id}\n\nVideo is being processed. Use instagram_check_container_status to check when ready, then instagram_publish_container to publish.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Publish Video ───
  server.registerTool(
    "instagram_publish_video",
    {
      title: "Publish Instagram Video",
      description: `Publish a video post to the Instagram feed.

Args:
  - video_url (string, required): Public URL to video (MP4)
  - caption (string, optional): Post caption (max 2,200 chars)
  - thumb_offset (number, optional): Thumbnail frame offset in ms
  - location_id (string, optional): Location tag
  - account_id (string, optional): IG Business Account ID

Returns: Container ID. Poll with instagram_check_container_status, then publish with instagram_publish_container.`,
      inputSchema: PublishVideoSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishVideoInput) => {
      try {
        const containerParams: Record<string, unknown> = {
          media_type: "VIDEO",
          video_url: params.video_url,
        };
        if (params.caption) containerParams.caption = params.caption;
        if (params.thumb_offset !== undefined) containerParams.thumb_offset = params.thumb_offset;
        if (params.location_id) containerParams.location_id = params.location_id;

        const container = await createMediaContainer(params.account_id, containerParams);

        return {
          content: [{
            type: "text" as const,
            text: `Video container created! Container ID: ${container.id}\n\nInstagram is processing the video. Use instagram_check_container_status to check when ready, then instagram_publish_container to publish.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Publish Carousel ───
  server.registerTool(
    "instagram_publish_carousel",
    {
      title: "Publish Instagram Carousel",
      description: `Publish a carousel post (2-10 slides of images and/or videos) to Instagram.

This is a multi-step process:
1. Create individual containers for each carousel item
2. Create the parent carousel container referencing all child containers
3. Publish the carousel

The tool handles steps 1-2 automatically. For videos, you may need to wait for processing before step 3.

Args:
  - children (array, required): 2-10 media items, each with image_url or video_url
  - caption (string, optional): Carousel caption (max 2,200 chars)
  - location_id (string, optional): Location tag
  - collaborators (array, optional): Up to 3 collaborator usernames
  - account_id (string, optional): IG Business Account ID

Returns: Carousel container ID. If all items are images, publishes immediately. If videos are included, use instagram_check_container_status then instagram_publish_container.`,
      inputSchema: PublishCarouselSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishCarouselInput) => {
      try {
        // Step 1: Create child containers
        const childIds: string[] = [];
        let hasVideo = false;

        for (const child of params.children) {
          const childParams: Record<string, unknown> = {
            is_carousel_item: true,
          };
          if (child.image_url) {
            childParams.image_url = child.image_url;
          } else if (child.video_url) {
            childParams.video_url = child.video_url;
            childParams.media_type = "VIDEO";
            hasVideo = true;
          } else {
            return {
              content: [{
                type: "text" as const,
                text: "Error: Each carousel item must have either image_url or video_url.",
              }],
            };
          }

          const container = await createMediaContainer(params.account_id, childParams);
          childIds.push(container.id);
        }

        // Step 2: Create carousel container
        const carouselParams: Record<string, unknown> = {
          media_type: "CAROUSEL",
          children: childIds.join(","),
        };
        if (params.caption) carouselParams.caption = params.caption;
        if (params.location_id) carouselParams.location_id = params.location_id;
        if (params.collaborators) carouselParams.collaborators = params.collaborators;

        const carousel = await createMediaContainer(params.account_id, carouselParams);

        if (!hasVideo) {
          // All images — publish immediately
          const result = await publishMedia(params.account_id, carousel.id);
          return {
            content: [{
              type: "text" as const,
              text: `Carousel published successfully!\n\nMedia ID: ${result.id}\nItems: ${params.children.length} slides\n\nThe carousel post is now live.`,
            }],
          };
        }

        return {
          content: [{
            type: "text" as const,
            text: `Carousel container created with ${params.children.length} items! Container ID: ${carousel.id}\n\nSome items contain video and need processing time. Use instagram_check_container_status to check when ready, then instagram_publish_container to publish.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Check Container Status ───
  server.registerTool(
    "instagram_check_container_status",
    {
      title: "Check Media Container Status",
      description: `Check the processing status of a media container.

After creating a container for video, reel, or story content, Instagram needs time to process it. Use this tool to poll the status.

Statuses: IN_PROGRESS (still processing), FINISHED (ready to publish), ERROR (failed), EXPIRED (too old).

Args:
  - container_id (string, required): The container ID to check

Returns: Current status of the container.`,
      inputSchema: CheckContainerStatusSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: CheckContainerStatusInput) => {
      try {
        const status = await checkContainerStatus(params.container_id);
        const statusEmoji = status.status_code === "FINISHED" ? "Ready" :
          status.status_code === "IN_PROGRESS" ? "Processing" :
          status.status_code === "ERROR" ? "Failed" : status.status_code;

        let message = `Container ${params.container_id}\nStatus: ${statusEmoji} (${status.status_code})`;
        if (status.status_code === "FINISHED") {
          message += "\n\nThe container is ready to publish. Use instagram_publish_container to publish it.";
        } else if (status.status_code === "IN_PROGRESS") {
          message += "\n\nStill processing. Wait 10-30 seconds and check again.";
        } else if (status.status_code === "ERROR") {
          message += `\n\nProcessing failed. Error: ${status.status || "Unknown error"}. Try creating a new container.`;
        }

        return { content: [{ type: "text" as const, text: message }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  // ─── Publish Container ───
  server.registerTool(
    "instagram_publish_container",
    {
      title: "Publish Media Container",
      description: `Publish a previously created media container.

Use this after creating a container for video, reel, story, or carousel content and confirming its status is FINISHED.

Args:
  - container_id (string, required): The container ID to publish
  - account_id (string, optional): IG Business Account ID

Returns: Published media ID.`,
      inputSchema: PublishContainerSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: PublishContainerInput) => {
      try {
        const result = await publishMedia(params.account_id, params.container_id);
        return {
          content: [{
            type: "text" as const,
            text: `Media published successfully!\n\nMedia ID: ${result.id}\n\nThe content is now live on Instagram.`,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
