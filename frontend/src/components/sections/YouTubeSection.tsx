import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { VideoCard } from '@/components/news/VideoCard';
import { getReels, getVideos, getMediaUrl, type ReelContentItem, type VideoContentItem } from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ReactPlayer from 'react-player';
import { getVideoUrl, isYouTubeUrl } from '@/lib/videoUtils';

function formatViews(count?: number): string | undefined {
  if (!count) return undefined;
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

type YouTubeItem = (ReelContentItem | VideoContentItem) & { source: 'reel' | 'video' };

function getYouTubeUrl(item: ReelContentItem | VideoContentItem): string | null {
  // Only return YouTube URLs, ignore uploaded files
  if (item.youtube_url) {
    return getVideoUrl(item.youtube_url, null, getMediaUrl);
  }
  return null;
}

export function YouTubeSection() {
  const { t, language } = useLanguage();
  const [youtubeItems, setYoutubeItems] = useState<YouTubeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<YouTubeItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Fetch both reels and videos
        const [reelsRes, videosRes] = await Promise.all([
          getReels(),
          getVideos()
        ]);
        if (cancelled) return;
        
        console.log('YouTube Section - Reels:', reelsRes.results?.length, reelsRes.results);
        console.log('YouTube Section - Videos:', videosRes.results?.length, videosRes.results);
        
        // Combine and filter to only show items with YouTube URLs
        const reels = (reelsRes.results ?? []).map(r => ({ ...r, source: 'reel' as const }));
        const videos = (videosRes.results ?? []).map(v => ({ ...v, source: 'video' as const }));
        const allItems = [...reels, ...videos] as YouTubeItem[];
        
        console.log('YouTube Section - All items:', allItems.length, allItems);
        
        const youtubeOnly = allItems.filter((item) => {
          const url = getYouTubeUrl(item);
          console.log('YouTube Section - Checking item:', item.id, 'youtube_url:', item.youtube_url, 'result:', url);
          return url !== null;
        });
        
        console.log('YouTube Section - Filtered YouTube items:', youtubeOnly.length, youtubeOnly);
        setYoutubeItems(youtubeOnly);
      } catch (err) {
        console.error('Failed to fetch YouTube section:', err);
        if (!cancelled) setYoutubeItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = (item: YouTubeItem) => {
    if (language === 'en') return item.title_en;
    return item.title_gu || item.title_hi || item.title_en;
  };

  const activeVideoUrl = activeVideo ? getYouTubeUrl(activeVideo) : null;

  // Don't show section if there are no YouTube videos
  if (!loading && youtubeItems.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-8 mt-8 bg-secondary/50 -mx-4 px-4 lg:-mx-8 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-red-600 rounded-full">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
              <h2 className="section-title">{language === 'gu' ? 'યુટ્યુબ વિડિયો' : 'YouTube Videos'}</h2>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('loading')}
            </div>
          ) : youtubeItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {language === 'gu' ? 'કોઈ યુટ્યુબ વિડિયો મળ્યા નથી' : 'No YouTube videos available'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {youtubeItems.slice(0, 4).map((item) => {
                const videoUrl = getYouTubeUrl(item);
                return (
                  <VideoCard
                    key={`${item.source}-${item.id}`}
                    thumbnail={
                      getMediaUrl(item.thumbnail) ||
                      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'
                    }
                    title={getTitle(item)}
                    views={formatViews(item.view_count)}
                    onClick={videoUrl ? () => {
                      console.log('Opening YouTube video:', item, 'URL:', videoUrl);
                      setActiveVideo(item);
                    } : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* YouTube Video Player Modal */}
      <Dialog open={!!activeVideo && !!activeVideoUrl} onOpenChange={(open) => {
        if (!open) {
          setActiveVideo(null);
        }
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {activeVideo && activeVideoUrl && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {getTitle(activeVideo)}
              </h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                {isYouTubeUrl(activeVideoUrl) ? (
                  <ReactPlayer
                    url={activeVideoUrl}
                    controls
                    playing={true}
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
                    onReady={() => {
                      console.log('YouTube video player ready, URL:', activeVideoUrl);
                    }}
                    onError={(error) => {
                      console.error('YouTube video player error:', error, 'URL:', activeVideoUrl);
                    }}
                    onStart={() => {
                      console.log('YouTube video started playing');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <p>Invalid YouTube URL</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
