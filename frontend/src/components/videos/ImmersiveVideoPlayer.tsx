import { useEffect, useState, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, X, Share2, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMediaUrl, type VideoContentItem } from '@/lib/api';
import { getUploadedVideoUrl, isYouTubeUrl, getVideoUrl as getVideoUrlUtil } from '@/lib/videoUtils';
import ReactPlayer from 'react-player';

interface ImmersiveVideoPlayerProps {
  videos: VideoContentItem[];
  initialIndex: number;
  onClose: () => void;
}

function formatCount(count?: number): string {
  if (!count) return '0';
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getTitle(video: VideoContentItem, lang: string): string {
  return lang === 'en' ? video.title_en : (video.title_gu || video.title_hi || video.title_en);
}

function getVideoUrl(video: VideoContentItem): string | null {
  // Check for YouTube URL first
  if (video.youtube_url) {
    const youtubeUrl = getVideoUrlUtil(video.youtube_url, null, getMediaUrl);
    if (youtubeUrl) {
      console.log('ImmersiveVideoPlayer - YouTube URL found:', youtubeUrl);
      return youtubeUrl;
    }
  }
  
  // Check for uploaded video
  const uploadedUrl = getUploadedVideoUrl(video.youtube_url, video.file, getMediaUrl);
  if (uploadedUrl) {
    console.log('ImmersiveVideoPlayer - Uploaded video URL found:', uploadedUrl);
    return uploadedUrl;
  }
  
  console.warn('ImmersiveVideoPlayer - No video URL found for video:', video);
  return null;
}

export function ImmersiveVideoPlayer({ videos, initialIndex, onClose }: ImmersiveVideoPlayerProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentIndex];
  const videoUrl = currentVideo ? getVideoUrl(currentVideo) : null;
  const isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false;

  console.log('ImmersiveVideoPlayer - Current video:', currentVideo, 'URL:', videoUrl, 'isYouTube:', isYouTube);

  // Handle video play/pause
  useEffect(() => {
    if (isYouTube) {
      // YouTube player is handled by ReactPlayer
      return;
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.log('Autoplay blocked:', err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, isYouTube]);

  // Auto-play when video changes
  useEffect(() => {
    if (isYouTube) {
      // For YouTube, ReactPlayer handles autoplay
      setIsPlaying(true);
      return;
    }
    
    if (videoRef.current && videoUrl) {
      console.log('ImmersiveVideoPlayer - Loading video:', videoUrl);
      videoRef.current.load();
      // Try to play after a short delay to ensure video is loaded
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => {
            console.log('ImmersiveVideoPlayer - Autoplay blocked, user interaction required:', err);
            setIsPlaying(false);
          });
        }
      }, 100);
      setIsPlaying(true);
    }
  }, [currentIndex, videoUrl, isYouTube]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  // Touch/swipe navigation
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Close when reaching the end
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = (id: number) => {
    setLikedVideos(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (navigator.share && currentVideo) {
      try {
        await navigator.share({
          title: getTitle(currentVideo, language),
          text: getTitle(currentVideo, language),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'en' ? 'Link copied to clipboard!' : 'લિંક કોપી કરવામાં આવી!');
    }
  };

  if (!currentVideo || !videoUrl) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < videos.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Video Player */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isYouTube ? (
          <div className="w-full h-full">
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              controls
              width="100%"
              height="100%"
              config={{
                youtube: { 
                  playerVars: { 
                    modestbranding: 1,
                    autoplay: 1,
                    playsinline: 1,
                    rel: 0,
                    showinfo: 0,
                  } 
                },
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              loop={false}
              muted={false}
              controls={true}
              preload="auto"
              className="w-full h-full object-contain"
              onEnded={goToNext}
              onPlay={() => {
                console.log('ImmersiveVideoPlayer - Video started playing');
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log('ImmersiveVideoPlayer - Video paused');
                setIsPlaying(false);
              }}
              onLoadedData={() => {
                console.log('ImmersiveVideoPlayer - Video loaded, attempting to play');
                if (videoRef.current && isPlaying) {
                  videoRef.current.play().catch(err => {
                    console.log('ImmersiveVideoPlayer - Play failed, showing controls:', err);
                    setIsPlaying(false);
                  });
                }
              }}
              onError={(e) => {
                console.error('ImmersiveVideoPlayer - Video error:', e, 'URL:', videoUrl);
                const target = e.target as HTMLVideoElement;
                console.error('Video error details:', {
                  error: target.error,
                  networkState: target.networkState,
                  readyState: target.readyState,
                  src: target.src
                });
              }}
              onCanPlay={() => {
                console.log('ImmersiveVideoPlayer - Video can play');
                if (videoRef.current && isPlaying && videoRef.current.paused) {
                  videoRef.current.play().catch(err => {
                    console.log('ImmersiveVideoPlayer - CanPlay play failed:', err);
                  });
                }
              }}
              onLoadedMetadata={() => {
                console.log('ImmersiveVideoPlayer - Video metadata loaded');
              }}
            />

            {/* Play/Pause Overlay - Only show when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-40"
                aria-label="Play"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
              </button>
            )}
            
            {/* Pause button overlay - show when playing (optional, can click video to pause) */}
            {isPlaying && (
              <div 
                onClick={togglePlayPause}
                className="absolute inset-0 z-40 cursor-pointer"
                aria-label="Pause"
              />
            )}
          </>
        )}

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-8 px-6 z-30">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="text-white font-medium">
              {language === 'en' ? 'Kanam Express' : 'કણમ એક્સપ્રેસ'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl font-bold leading-tight mb-6">
            {getTitle(currentVideo, language)}
          </h2>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => toggleLike(currentVideo.id)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                likedVideos.includes(currentVideo.id) ? 'bg-red-500' : 'bg-white/10 backdrop-blur-md'
              }`}>
                <Heart className={`w-6 h-6 ${
                  likedVideos.includes(currentVideo.id) ? 'text-white fill-white' : 'text-white'
                }`} />
              </div>
              <span className="text-white text-xs">
                {formatCount(currentVideo.likes_count)}
              </span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">
                {formatCount(currentVideo.view_count)}
              </span>
            </button>

            <button 
              onClick={handleShare}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">
                {language === 'en' ? 'Share' : 'શેર કરો'}
              </span>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1">
          {videos.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : index < currentIndex 
                    ? 'bg-white/50 w-2' 
                    : 'bg-white/20 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
