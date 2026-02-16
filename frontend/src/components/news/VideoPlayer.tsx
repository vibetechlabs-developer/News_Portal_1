import ReactPlayer from "react-player";
import { getMediaUrl } from "@/lib/api";
import type { MediaItem } from "@/lib/api";

interface VideoPlayerProps {
  media: MediaItem;
  className?: string;
  controls?: boolean;
  playing?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

/** Extracts a playable video URL from media (YouTube or uploaded file/image). */
function getVideoUrl(media: MediaItem, getMediaUrlFn: (path: string | null | undefined) => string): string | null {
  if (media.youtube_url) return media.youtube_url;
  if (media.file) return getMediaUrlFn(media.file);
  // Some backends use image field for video file URL
  if (media.image && (media.media_type === "VIDEO" || media.media_type === "REEL")) return getMediaUrlFn(media.image);
  return null;
}

export function VideoPlayer({
  media,
  className = "",
  controls = true,
  playing = false,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const url = getVideoUrl(media, getMediaUrl);

  if (!url) return null;

  return (
    <div className={`aspect-video w-full overflow-hidden rounded-xl bg-black ${className}`}>
      <ReactPlayer
        url={url}
        controls={controls}
        playing={playing}
        width="100%"
        height="100%"
        onPlay={onPlay}
        onPause={onPause}
        config={{
          youtube: { playerVars: { modestbranding: 1 } },
        }}
      />
    </div>
  );
}
