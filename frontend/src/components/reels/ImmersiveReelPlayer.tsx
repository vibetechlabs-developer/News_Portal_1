import { useEffect, useState, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, X, Share2, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUrl, type ReelContentItem, type CommentItem, toggleReelLike, getReelComments, postReelComment } from '@/lib/api';
import { getReelUrl as getReelUrlUtil, isYouTubeUrl } from '@/lib/videoUtils';
import { CommentModal } from '../shared/CommentModal';

function getReelUrl(reel: ReelContentItem): string | null {
  return getReelUrlUtil(reel.youtube_url, reel.file, getMediaUrl);
}

interface ImmersiveReelPlayerProps {
  reels: ReelContentItem[];
  initialIndex: number;
  onClose: () => void;
}

function formatCount(count?: number): string {
  if (!count) return '0';
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getTitle(reel: ReelContentItem, lang: string): string {
  return lang === 'en' ? reel.title_en : (reel.title_gu || reel.title_hi || reel.title_en);
}

export function ImmersiveReelPlayer({ reels, initialIndex, onClose }: ImmersiveReelPlayerProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  // Likes State
  const [localLikeCounts, setLocalLikeCounts] = useState<Record<number, number>>({});
  const [likedReels, setLikedReels] = useState<number[]>([]);

  // Comments State
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reels[currentIndex];
  const reelUrl = currentReel ? getReelUrl(currentReel) : null;

  // Handle video play/pause
  useEffect(() => {
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
  }, [isPlaying, currentIndex]);

  // Auto-play when reel changes
  useEffect(() => {
    if (videoRef.current && reelUrl) {
      videoRef.current.load();
      setIsPlaying(true);
    }
  }, [currentIndex, reelUrl]);

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
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Close when reaching the end
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleLike = async (id: number) => {

    const isLiked = likedReels.includes(id);
    const newLikedState = !isLiked;

    // Optimistic UI update
    setLikedReels(prev =>
      newLikedState ? [...prev, id] : prev.filter(r => r !== id)
    );
    setLocalLikeCounts(prev => ({
      ...prev,
      [id]: (prev[id] ?? reels.find(r => r.id === id)?.likes_count ?? 0) + (newLikedState ? 1 : -1)
    }));

    try {
      await toggleReelLike(id, newLikedState);
    } catch (err) {
      console.error('Failed to toggle sequence like', err);
      // Revert on error
      setLikedReels(prev => isLiked ? [...prev, id] : prev.filter(r => r !== id));
      setLocalLikeCounts(prev => ({
        ...prev,
        [id]: (prev[id] ?? reels.find(r => r.id === id)?.likes_count ?? 0) + (isLiked ? 1 : -1)
      }));
    }
  };

  const handleOpenComments = async (id: number) => {
    setCommentsOpen(true);
    setCommentsLoading(true);
    try {
      const fetchedComments = await getReelComments(id);
      setCommentsList(fetchedComments);
    } catch (err) {
      console.error('Failed to fetch reel comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async (content: string) => {
    if (!currentReel) return;
    try {
      const newComment = await postReelComment(currentReel.id, content);
      setCommentsList([newComment, ...commentsList]);
    } catch (err) {
      console.error('Failed to post reel comment', err);
      throw err;
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentReel) {
      try {
        await navigator.share({
          title: getTitle(currentReel, language),
          text: getTitle(currentReel, language),
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

  if (!currentReel || !reelUrl) {
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

      {currentIndex < reels.length - 1 && (
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
        {isYouTubeUrl(reelUrl) ? (
          <div className="w-full h-full max-w-[100vh] aspect-[9/16] mx-auto pb-24 md:pb-16 pt-16">
            <iframe
              className="w-full h-full md:rounded-2xl"
              src={`https://www.youtube.com/embed/${reelUrl.split('v=')[1] ?? reelUrl.split('/').pop()}?autoplay=1&rel=0&modestbranding=1`}
              title={getTitle(currentReel, language)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={reelUrl}
            autoPlay
            playsInline
            loop={false}
            muted={false}
            className="w-full h-full object-contain"
            onEnded={goToNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Play/Pause Overlay */}
        {!isYouTubeUrl(reelUrl) && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-40"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {!isPlaying && (
              <div className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            )}
          </button>
        )}

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-8 px-6 z-50 pointer-events-none">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4 pointer-events-auto">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="text-white font-medium">
              {language === 'en' ? 'Kanam Express' : 'કણમ એક્સપ્રેસ'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl font-bold leading-tight mb-6">
            {getTitle(currentReel, language)}
          </h2>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLike(currentReel.id);
              }}
              className="flex flex-col items-center gap-1 pointer-events-auto"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${likedReels.includes(currentReel.id) ? 'bg-red-500' : 'bg-white/10 backdrop-blur-md'
                }`}>
                <Heart className={`w-6 h-6 ${likedReels.includes(currentReel.id) ? 'text-white fill-white' : 'text-white'
                  }`} />
              </div>
              <span className="text-white text-xs">
                {formatCount(localLikeCounts[currentReel.id] ?? currentReel.likes_count)}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenComments(currentReel.id);
              }}
              className="flex flex-col items-center gap-1 pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">
                {language === 'en' ? 'Comment' : 'ટિપ્પણી'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="flex flex-col items-center gap-1 pointer-events-auto"
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[45] flex gap-1">
          {reels.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${index === currentIndex
                ? 'bg-white w-8'
                : index < currentIndex
                  ? 'bg-white/50 w-2'
                  : 'bg-white/20 w-2'
                }`}
            />
          ))}
        </div>
      </div>

      <CommentModal
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={commentsList}
        onSubmitComment={handlePostComment}
        isLoading={commentsLoading}
      />
    </div>
  );
}
