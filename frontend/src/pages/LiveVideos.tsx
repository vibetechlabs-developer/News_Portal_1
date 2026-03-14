import { useEffect, useState } from 'react';
import { Play, Grid, List } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { VideoCard } from '@/components/news/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVideos, getReels, getMediaUrl, type VideoContentItem, type ReelContentItem } from '@/lib/api';
import { getVideoUrl, extractYouTubeVideoId, isYouTubeUrl } from '@/lib/videoUtils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

const LiveVideos = () => {
  const { language } = useLanguage();
  const [youtubeItems, setYoutubeItems] = useState<YouTubeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<YouTubeItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [reelsRes, videosRes] = await Promise.all([
          getReels({ is_live: true }),
          getVideos({ is_live: true })
        ]);
        if (cancelled) return;
        
        const reels = (reelsRes.results ?? []).map(r => ({ ...r, source: 'reel' as const }));
        const videos = (videosRes.results ?? []).map(v => ({ ...v, source: 'video' as const }));
        const allItems = [...reels, ...videos] as YouTubeItem[];
        
        const youtubeOnly = allItems
          .filter((item) => {
            if (!getYouTubeUrl(item)) return false;
            if (item.file) return false;
            return true;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setYoutubeItems(youtubeOnly);
      } catch (err) {
        console.error('Failed to fetch YouTube videos:', err);
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

  return (
    <PageLayout showTicker={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-full">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="headline-primary text-foreground">
                {language === 'en' ? 'Live Videos' : 'લાઇવ વિડિયો'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {language === 'en' ? 'Watch live broadcasts' : 'લાઇવ બ્રોડકાસ્ટ જુઓ'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading videos...' : 'વિડિયો લોડ થઈ રહ્યા છે...'}
              </div>
            ) : youtubeItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'No Live videos found.' : 'કોઈ લાઇવ વિડિયો મળ્યા નથી.'}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Featured/First Video - Large Display */}
                {youtubeItems.length > 0 && (
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                    <div className="relative aspect-video bg-black">
                      {getYouTubeUrl(youtubeItems[0]) && isYouTubeUrl(getYouTubeUrl(youtubeItems[0])) ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(getYouTubeUrl(youtubeItems[0])!) || (getYouTubeUrl(youtubeItems[0])!.split('v=')[1] ?? getYouTubeUrl(youtubeItems[0])!.split('/').pop())}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                          title={getTitle(youtubeItems[0])}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={(() => {
                            const item = youtubeItems[0];
                            let thumbnailUrl = getMediaUrl(item.thumbnail);
                            const videoUrl = getYouTubeUrl(item);
                            if (videoUrl) {
                              const videoId = extractYouTubeVideoId(videoUrl);
                              if (videoId) {
                                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                              }
                            }
                            return thumbnailUrl || '/logo.png';
                          })()}
                          alt={getTitle(youtubeItems[0])}
                          onError={(e) => {
                            // Fall back to hqdefault if maxresdefault is 404
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('maxresdefault.jpg')) {
                              target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                        <h2 className="text-white text-2xl font-bold mb-2 line-clamp-2">
                          {getTitle(youtubeItems[0])}
                        </h2>
                        {youtubeItems[0].view_count && (
                          <p className="text-white/80 text-sm">
                            {formatViews(youtubeItems[0].view_count)} {language === 'en' ? 'views' : 'વ્યૂઝ'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideoUrl.split('v=')[1] ?? activeVideoUrl.split('/').pop()}?autoplay=1&rel=0&modestbranding=1`}
                    title={getTitle(activeVideo)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
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
    </PageLayout>
  );
};

export default LiveVideos;
