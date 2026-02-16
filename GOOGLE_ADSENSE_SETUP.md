# Google AdSense Setup Guide

This guide will help you set up Google AdSense for your news portal.

## Prerequisites

1. **Google Account**: You need a Google account to sign up for AdSense
2. **Website**: Your website must be live and accessible
3. **Content**: Your site should have original, quality content
4. **Age Requirement**: You must be at least 18 years old (or have parental consent)

## Step 1: Sign Up for Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Click **"Get Started"** or **"Sign In"** if you already have an account
3. Enter your website URL (e.g., `https://yournewsportal.com`)
4. Select your country/region
5. Choose how you want to get paid (AdSense will send payments to your bank account)
6. Review and accept the AdSense Program Policies
7. Click **"Create Account"**

## Step 2: Add Your Site to AdSense

1. After signing up, you'll need to verify your website ownership
2. Google will provide you with an HTML code snippet to add to your website
3. Add this code to your website's `<head>` section (you may need to add it to your site's HTML template)
4. Click **"Verify"** in AdSense dashboard
5. Wait for Google to review your site (this can take a few days to a few weeks)

## Step 3: Get Your Publisher ID (Client ID)

Once your AdSense account is approved:

1. Log in to your [AdSense account](https://www.google.com/adsense/)
2. Click on **"Account"** in the left sidebar
3. Look for **"Account information"**
4. You'll see your **Publisher ID** (also called **Client ID**)
   - Format: `ca-pub-1234567890123456`
   - This is a unique identifier for your AdSense account

## Step 4: Create Ad Units and Get Slot IDs

1. In your AdSense dashboard, go to **"Ads"** → **"By ad unit"**
2. Click **"Create ad unit"** or **"New ad unit"**
3. Choose the type of ad you want:
   - **Display ads**: Standard banner ads
   - **In-article ads**: Ads that appear within article content
   - **In-feed ads**: Ads in feed/listings
   - **Multiplex ads**: Multiple ads in one unit
4. Configure your ad unit:
   - **Name**: Give it a descriptive name (e.g., "Footer Ad", "Sidebar Ad")
   - **Ad size**: Choose "Responsive" for automatic sizing, or select specific dimensions
   - **Ad type**: Display ads (recommended for most cases)
5. Click **"Create"**
6. After creating, you'll see the ad code. Look for:
   - `data-ad-client="ca-pub-XXXXX"` - This is your Publisher ID (Client ID)
   - `data-ad-slot="1234567890"` - This is your **Slot ID** (Ad Unit ID)
7. Copy both values

## Step 5: Configure AdSense in Your Admin Dashboard

1. Log in to your news portal admin dashboard
2. Navigate to the **"Ads"** tab
3. Click **"Add"** button in the **"Ad slots (AdSense)"** section
4. Fill in the form:
   - **Name**: A descriptive name (e.g., "Footer Banner Ad")
   - **Placement**: Choose where the ad should appear:
     - `FOOTER` - At the bottom of pages
     - `TOP` - At the top of pages
     - `SIDEBAR_LEFT` - Left sidebar
     - `SIDEBAR_RIGHT` - Right sidebar
     - `IN_ARTICLE` - Within article content
     - `POPUP` - Popup ads
   - **Client ID**: Paste your Publisher ID (e.g., `ca-pub-1234567890123456`)
   - **Slot ID**: Paste your Ad Unit ID (e.g., `1234567890`)
   - **Format**: Usually `auto` (for responsive ads) or leave empty
   - **Responsive**: Enable this for ads that adapt to screen size (recommended)
   - **Active**: Make sure this is enabled
   - **Order**: Use 0 for first ad, higher numbers for multiple ads in same placement
5. Click **"Create"**

## Step 6: Verify Ads Are Displaying

1. Visit your website (make sure you're not using an ad blocker)
2. Check the placement where you configured the ad
3. You should see Google ads appearing
4. Note: It may take a few minutes to hours for ads to start showing after configuration

## Common Issues and Solutions

### Ads Not Showing

1. **Ad Blocker**: Disable ad blockers in your browser
2. **AdSense Approval**: Make sure your AdSense account is fully approved
3. **Active Status**: Check that the ad slot is marked as "Active" in admin
4. **Client ID & Slot ID**: Verify both are correct (no extra spaces)
5. **Placement**: Make sure the placement matches where you're looking
6. **Time Delay**: Ads may take 24-48 hours to start showing after setup

### Finding Slot ID in Ad Code

If you have the full AdSense code snippet, look for:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXX"  <!-- This is Client ID -->
     data-ad-slot="1234567890"            <!-- This is Slot ID -->
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

### Multiple Ads in Same Placement

You can create multiple ad slots for the same placement:
- Create multiple ad units in AdSense (each with different Slot IDs)
- Create multiple ad slots in admin with the same placement
- Use different "Order" values (0, 1, 2, etc.) to control display order

## Best Practices

1. **Don't Click Your Own Ads**: This violates AdSense policies
2. **Placement**: Place ads where they won't interfere with content readability
3. **Responsive Ads**: Use responsive ads for better mobile experience
4. **Testing**: Use AdSense's "Test ads" feature to verify placement
5. **Performance**: Too many ads can slow down your site - use them strategically

## Need Help?

- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- Check your AdSense dashboard for account status and earnings

## Quick Reference

- **Publisher ID (Client ID)**: Found in AdSense → Account → Account information
- **Slot ID (Ad Unit ID)**: Found when creating an ad unit in AdSense
- **Format**: Usually `auto` for responsive ads
- **Placement Options**: FOOTER, TOP, SIDEBAR_LEFT, SIDEBAR_RIGHT, IN_ARTICLE, POPUP
