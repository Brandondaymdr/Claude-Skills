import { z } from "zod";

export const PublishPhotoSchema = z.object({
  image_url: z.string().url("Must be a valid public URL to a JPEG image")
    .describe("Public URL to the image file (JPEG format recommended)"),
  caption: z.string().max(2200, "Caption cannot exceed 2,200 characters").optional()
    .describe("Post caption text (max 2,200 characters, up to 30 hashtags)"),
  location_id: z.string().optional()
    .describe("Facebook Page ID of the location to tag"),
  user_tags: z.array(z.object({
    username: z.string().describe("Instagram username to tag"),
    x: z.number().min(0).max(1).describe("Horizontal position (0.0 to 1.0)"),
    y: z.number().min(0).max(1).describe("Vertical position (0.0 to 1.0)"),
  })).optional()
    .describe("Array of users to tag in the photo with their positions"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID (defaults to INSTAGRAM_ACCOUNT_ID env var)"),
}).strict();

export const PublishVideoSchema = z.object({
  video_url: z.string().url("Must be a valid public URL to a video file")
    .describe("Public URL to the video file (MP4 format)"),
  caption: z.string().max(2200).optional()
    .describe("Post caption text (max 2,200 characters)"),
  thumb_offset: z.number().int().min(0).optional()
    .describe("Thumbnail frame offset in milliseconds"),
  location_id: z.string().optional()
    .describe("Facebook Page ID of the location to tag"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const PublishReelSchema = z.object({
  video_url: z.string().url("Must be a valid public URL to a video file")
    .describe("Public URL to the Reel video (MP4, 9:16 aspect ratio, 5-90 seconds)"),
  caption: z.string().max(2200).optional()
    .describe("Reel caption text (max 2,200 characters)"),
  share_to_feed: z.boolean().default(true)
    .describe("Whether to also share the Reel to the main feed (default: true)"),
  thumb_offset: z.number().int().min(0).optional()
    .describe("Thumbnail frame offset in milliseconds"),
  cover_url: z.string().url().optional()
    .describe("Public URL to a custom cover image for the Reel"),
  audio_name: z.string().optional()
    .describe("Name for the original audio in the Reel"),
  location_id: z.string().optional()
    .describe("Facebook Page ID of the location to tag"),
  collaborators: z.array(z.string()).max(3).optional()
    .describe("Instagram usernames to invite as collaborators (max 3)"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const PublishStorySchema = z.object({
  image_url: z.string().url().optional()
    .describe("Public URL to story image (use this OR video_url, not both)"),
  video_url: z.string().url().optional()
    .describe("Public URL to story video (use this OR image_url, not both)"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const PublishCarouselSchema = z.object({
  children: z.array(z.object({
    image_url: z.string().url().optional()
      .describe("Public URL to image (use this OR video_url)"),
    video_url: z.string().url().optional()
      .describe("Public URL to video (use this OR image_url)"),
    is_carousel_item: z.literal(true).default(true),
  })).min(2, "Carousel must have at least 2 items").max(10, "Carousel can have at most 10 items")
    .describe("Array of 2-10 media items (images and/or videos) for the carousel"),
  caption: z.string().max(2200).optional()
    .describe("Carousel caption text (max 2,200 characters)"),
  location_id: z.string().optional()
    .describe("Facebook Page ID of the location to tag"),
  collaborators: z.array(z.string()).max(3).optional()
    .describe("Instagram usernames to invite as collaborators (max 3)"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export const CheckContainerStatusSchema = z.object({
  container_id: z.string()
    .describe("The media container ID to check status of"),
}).strict();

export const PublishContainerSchema = z.object({
  container_id: z.string()
    .describe("The media container ID to publish (must have status FINISHED)"),
  account_id: z.string().optional()
    .describe("Instagram Business Account ID"),
}).strict();

export type PublishPhotoInput = z.infer<typeof PublishPhotoSchema>;
export type PublishVideoInput = z.infer<typeof PublishVideoSchema>;
export type PublishReelInput = z.infer<typeof PublishReelSchema>;
export type PublishStoryInput = z.infer<typeof PublishStorySchema>;
export type PublishCarouselInput = z.infer<typeof PublishCarouselSchema>;
export type CheckContainerStatusInput = z.infer<typeof CheckContainerStatusSchema>;
export type PublishContainerInput = z.infer<typeof PublishContainerSchema>;
