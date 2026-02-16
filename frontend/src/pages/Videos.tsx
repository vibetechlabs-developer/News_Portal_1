import { useEffect, useState } from 'react';
import { Play, Grid, List } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { VideoCard } from '@/components/news/VideoCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVideos, getMediaUrl, type VideoContentItem } from '@/lib/api';
import { getUploadedVideoUrl } from '@/lib/videoUtils';
import { ImmersiveVideoPlayer } from '@/components/videos/ImmersiveVideoPlayer';

const videoCategories = [
  { id: 'all', name: 'All Videos', nameGu: 'બધા વિડિયો' },
  { id: 'news', name: 'News Videos', nameGu: 'સમાચાર વિડિયો' },
  { id: 'interviews', name: 'Interviews', nameGu: 'ઇન્ટરવ્યૂ' },
  { id: 'reports', name: 'Ground Reports', nameGu: 'ગ્રાઉન્ડ રિપોર્ટ' },
  { id: 'explainers', name: 'Explainers', nameGu: 'એક્સપ્લેનર્સ' },
  { id: 'sports', name: 'Sports', nameGu: 'રમતગમત' },
];

function formatViews(count?: number): string | undefined {
  if (!count) return undefined;
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getVideoUrl(video: VideoContentItem): string | null {
  // Videos page should ONLY show uploaded video files, not YouTube URLs
  return getUploadedVideoUrl(video.youtube_url, video.file, getMediaUrl);
}

const Videos = () => {
  const { language } = useLanguage();
  const [videos, setVideos] = useState<VideoContentItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getVideos();
        if (cancelled) return;
        setVideos(res.results ?? []);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        if (!cancelled) setVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = (video: VideoContentItem) => {
    if (language === 'en') return video.title_en;
    return video.title_gu || video.title_hi || video.title_en;
  };

  const validVideos = videos.filter((video) => {
    const videoUrl = getVideoUrl(video);
    return videoUrl !== null;
  });

  return (
    <PageLayout showTicker={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
              <Play className="w-6 h-6 text-primary-foreground fill-current" />
            </div>
            <div>
              <h1 className="headline-primary text-foreground">
                {language === 'en' ? 'Videos' : 'વિડિયો'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {language === 'en' ? 'Watch latest news videos' : 'તાજા સમાચાર વિડિયો જુઓ'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading videos...' : 'વિડિયો લોડ થઈ રહ્યા છે...'}
              </div>
            ) : validVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'No videos found.' : 'કોઈ વિડિયો મળ્યા નથી.'}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Featured/First Video - Large Display */}
                {validVideos.length > 0 && (
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                    <div className="relative aspect-video">
                      <img
                        src={
                          getMediaUrl(validVideos[0].thumbnail) ||
                          'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200'
                        }
                        alt={getTitle(validVideos[0])}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <button
                        onClick={() => {
                          const videoUrl = getVideoUrl(validVideos[0]);
                          if (videoUrl) {
                            setActiveVideoIndex(0);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full group-hover:bg-white/30 transition-colors">
                          <Play className="w-10 h-10 text-white fill-white ml-1" />
                        </div>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-white text-2xl font-bold mb-2 line-clamp-2">
                          {getTitle(validVideos[0])}
                        </h2>
                        {validVideos[0].view_count && (
                          <p className="text-white/80 text-sm">
                            {formatViews(validVideos[0].view_count)} {language === 'en' ? 'views' : 'વ્યૂઝ'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid of Other Videos */}
                {validVideos.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {validVideos.slice(1).map((video) => {
                      const videoUrl = getVideoUrl(video);
                      return (
                        <VideoCard
                          key={video.id}
                          thumbnail={
                            getMediaUrl(video.thumbnail) ||
                            'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'
                          }
                          title={getTitle(video)}
                          views={formatViews(video.view_count)}
                          onClick={videoUrl ? () => {
                            const videoIndex = validVideos.findIndex((v) => v.id === video.id);
                            if (videoIndex !== -1) {
                              setActiveVideoIndex(videoIndex);
                            }
                          } : undefined}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* View Toggle */}
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3">{language === 'en' ? 'View Mode' : 'વ્યૂ મોડ'}</h3>
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Video Stats */}
              {validVideos.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="font-semibold mb-3">{language === 'en' ? 'Video Stats' : 'વિડિયો આંકડા'}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'en' ? 'Total Videos' : 'કુલ વિડિયો'}</span>
                      <span className="font-medium">{validVideos.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trending Sidebar */}
              <TrendingSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Video Player */}
      {activeVideoIndex !== null && (
        <ImmersiveVideoPlayer
          videos={validVideos}
          initialIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)}
        />
      )}
    </PageLayout>
  );
};

export default Videos;
