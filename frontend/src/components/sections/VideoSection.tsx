import { useEffect, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { VideoCard } from '@/components/news/VideoCard';
import { getVideos, getMediaUrl, type VideoContentItem } from '@/lib/api';
import { getUploadedVideoUrl } from '@/lib/videoUtils';
import { ImmersiveVideoPlayer } from '@/components/videos/ImmersiveVideoPlayer';

function formatViews(count?: number): string | undefined {
  if (!count) return undefined;
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getVideoUrl(video: VideoContentItem): string | null {
  // Videos section should ONLY show uploaded video files, not YouTube URLs
  return getUploadedVideoUrl(video.youtube_url, video.file, getMediaUrl);
}

export function VideoSection() {
  const { t, language } = useLanguage();
  const [videos, setVideos] = useState<VideoContentItem[]>([]);
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
        console.error('Failed to fetch video section:', err);
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
    <>
      <section className="py-8 bg-secondary/50 -mx-4 px-4 lg:-mx-8 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-full">
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <h2 className="section-title">{t('videos')}</h2>
            </div>
            <Link 
              to="/videos"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {language === 'gu' ? 'બધા વિડિયો' : 'All Videos'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('loading')}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('no_news_available')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {validVideos.slice(0, 4).map((video) => {
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
      </section>

      {/* Immersive Video Player */}
      {activeVideoIndex !== null && (
        <ImmersiveVideoPlayer
          videos={validVideos}
          initialIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)}
        />
      )}
    </>
  );
}
