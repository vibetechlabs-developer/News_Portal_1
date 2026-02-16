/**
 * Utility functions for video URL handling and YouTube video ID extraction
 */

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Just the video ID itself
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Remove whitespace
  const cleanUrl = url.trim();

  // If it's already just a video ID (11 characters, alphanumeric, dashes, underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Pattern 1: youtube.com/watch?v=VIDEO_ID or youtube.com/watch?feature=...&v=VIDEO_ID
  const watchMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Pattern 2: youtu.be/VIDEO_ID
  const beMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (beMatch) return beMatch[1];

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Pattern 4: youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Pattern 5: m.youtube.com/watch?v=VIDEO_ID
  const mobileMatch = cleanUrl.match(/m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (mobileMatch) return mobileMatch[1];

  return null;
}

/**
 * Normalizes YouTube URL to standard watch format
 * Returns null if not a valid YouTube URL
 */
export function normalizeYouTubeUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // Extract video ID
  const videoId = extractYouTubeVideoId(cleanUrl);
  if (!videoId) return null;

  // Return normalized URL
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url.trim());
}

/**
 * Gets the best video URL from a video/reel item
 * Priority: YouTube URL > File URL
 */
export function getVideoUrl(
  youtubeUrl: string | null | undefined,
  fileUrl: string | null | undefined,
  getMediaUrlFn?: (path: string | null | undefined) => string | null
): string | null {
  // Check YouTube URL first
  if (youtubeUrl) {
    const normalized = normalizeYouTubeUrl(youtubeUrl);
    if (normalized) return normalized;
  }

  // Check file URL
  if (fileUrl) {
    // If it's already a full URL, use it directly
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, convert it using getMediaUrl if provided
    if (getMediaUrlFn) {
      const convertedUrl = getMediaUrlFn(fileUrl);
      if (convertedUrl) return convertedUrl;
    }
  }

  return null;
}

/**
 * Gets video URL for reels - ONLY uploaded files, NO YouTube URLs
 * Reels should only show uploaded video files
 */
export function getReelUrl(
  youtubeUrl: string | null | undefined,
  fileUrl: string | null | undefined,
  getMediaUrlFn?: (path: string | null | undefined) => string | null
): string | null {
  // For reels, ONLY return file URLs, ignore YouTube URLs
  if (fileUrl) {
    // If it's already a full URL, use it directly
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, convert it using getMediaUrl if provided
    if (getMediaUrlFn) {
      const convertedUrl = getMediaUrlFn(fileUrl);
      if (convertedUrl) return convertedUrl;
    }
  }

  return null;
}

/**
 * Gets video URL for videos - ONLY uploaded files, NO YouTube URLs
 * Videos section should only show uploaded video files
 */
export function getUploadedVideoUrl(
  youtubeUrl: string | null | undefined,
  fileUrl: string | null | undefined,
  getMediaUrlFn?: (path: string | null | undefined) => string | null
): string | null {
  // For videos section, ONLY return file URLs, ignore YouTube URLs
  if (fileUrl) {
    // If it's already a full URL, use it directly
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, convert it using getMediaUrl if provided
    if (getMediaUrlFn) {
      const convertedUrl = getMediaUrlFn(fileUrl);
      if (convertedUrl) return convertedUrl;
    }
  }

  return null;
}
