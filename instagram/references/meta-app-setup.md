# Meta App Setup Guide for Instagram Graph API

This guide walks you through setting up a Meta Developer App with Instagram Graph API
access. You need this to get the access tokens that power the instagram-mcp-server.

## Prerequisites

- An Instagram Business or Creator account (not a personal account)
- A Facebook Page connected to your Instagram account
- A Meta (Facebook) developer account

## Step 1: Convert to Business/Creator Account

If your Instagram accounts aren't already Business or Creator accounts:

1. Open Instagram app → Settings → Account → Switch to Professional Account
2. Choose "Business" or "Creator"
3. Connect to a Facebook Page (create one if needed)

Do this for both @carlagentileyoga and @carlagentileday.

## Step 2: Create a Meta App

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Name it something like "Carla Gentile Instagram Manager"
5. Select your Business account (or create one)

## Step 3: Add Instagram Product

1. In your app dashboard, click "Add Product"
2. Find "Instagram" and click "Set Up"
3. This adds the Instagram Graph API to your app

## Step 4: Configure Instagram Settings

1. Go to Instagram → Basic Display (or Instagram Graph API settings)
2. Add your OAuth redirect URI (can be `https://localhost/callback` for testing)
3. Note your **Instagram App ID** and **Instagram App Secret**

## Step 5: Required Permissions (Scopes)

Your app needs these permissions approved:

| Permission | Purpose |
|-----------|---------|
| `instagram_business_basic` | Read profile info and media |
| `instagram_business_content_publish` | Publish posts, reels, stories |
| `instagram_business_manage_comments` | Read, reply, hide, delete comments |
| `instagram_business_manage_insights` | Access analytics and audience data |
| `instagram_business_manage_messages` | Read and send DMs (optional) |

For development/testing, you can use these with your own account before
submitting for App Review.

## Step 6: Generate Access Token

### Quick Method (Graph API Explorer)
1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app
3. Click "Generate Access Token"
4. Grant the required permissions
5. Copy the token

### OAuth Flow (Production)
1. Direct users to:
   ```
   https://api.instagram.com/oauth/authorize
     ?client_id={APP_ID}
     &redirect_uri={REDIRECT_URI}
     &scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_insights
     &response_type=code
   ```
2. User authorizes and you receive a `code` at your redirect URI
3. Exchange code for short-lived token:
   ```
   POST https://api.instagram.com/oauth/access_token
   Content-Type: application/x-www-form-urlencoded

   client_id={APP_ID}
   &client_secret={APP_SECRET}
   &grant_type=authorization_code
   &redirect_uri={REDIRECT_URI}
   &code={CODE}
   ```
4. Exchange short-lived token for long-lived token:
   ```
   GET https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret={APP_SECRET}
     &access_token={SHORT_LIVED_TOKEN}
   ```

The long-lived token lasts 60 days. Refresh it before expiry using the
`instagram_refresh_token` MCP tool.

## Step 7: Get Your Instagram Business Account ID

```
GET https://graph.instagram.com/me?fields=id,username&access_token={TOKEN}
```

The `id` field is your Instagram Business Account ID. You'll need this for
the `INSTAGRAM_ACCOUNT_ID` environment variable.

For multiple accounts, you may need to go through the Facebook Page →
Instagram Business Account connection:
```
GET https://graph.facebook.com/v21.0/{page-id}?fields=instagram_business_account&access_token={TOKEN}
```

## Step 8: Configure Environment Variables

Set these in your shell or `.env` file:

```bash
export INSTAGRAM_ACCESS_TOKEN="your-long-lived-token-here"
export INSTAGRAM_ACCOUNT_ID="your-default-account-id"
```

For managing multiple accounts (carlagentileyoga + carlagentileday), set
the default to your primary account and pass the other account's ID
explicitly when needed using the `account_id` parameter on any tool.

## Step 9: App Review (for Production)

For development with your own accounts, you can skip App Review.
For production use with other users' accounts:

1. Go to App Review in your Meta App dashboard
2. Submit for review for each permission you need
3. Provide clear use case descriptions
4. Meta typically reviews within 1-5 business days

## Troubleshooting

### "Invalid OAuth access token"
- Token may have expired (60-day limit)
- Use `instagram_refresh_token` to get a new one
- If refresh fails, generate a new token from Step 6

### "Requires business or creator account"
- Make sure the Instagram account is converted to Business/Creator
- Verify it's connected to a Facebook Page

### "Application does not have permission"
- Check that you've requested the correct scopes
- For development, add your Instagram account as a test user in the app settings
- For production, complete App Review

### Rate Limiting
- Instagram uses a sliding-window rate limit based on request complexity
- Publishing is limited to 25 posts per 24-hour rolling window
- If you hit limits, wait and try again later
