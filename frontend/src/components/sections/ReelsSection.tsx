import { useEffect, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getReels, getMediaUrl, type ReelContentItem } from '@/lib/api';
import { getReelUrl as getReelUrlUtil } from '@/lib/videoUtils';
import { ImmersiveReelPlayer } from '@/components/reels/ImmersiveReelPlayer';

function formatViews(count?: number): string | undefined {
  if (!count) return undefined;
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getReelUrl(reel: ReelContentItem): string | null {
  // Reels should ONLY show uploaded video files, not YouTube URLs
  return getReelUrlUtil(reel.youtube_url, reel.file, getMediaUrl);
}

export function ReelsSection() {
  const { t, language } = useLanguage();
  const [reels, setReels] = useState<ReelContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getReels();
        if (cancelled) return;
        setReels(res.results ?? []);
      } catch (err) {
        console.error('Failed to fetch reels section:', err);
        if (!cancelled) setReels([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = (reel: ReelContentItem) => {
    if (language === 'en') return reel.title_en;
    return reel.title_gu || reel.title_hi || reel.title_en;
  };

  const authorLabel = language === 'en' ? 'Kanam Express' : 'કણમ એક્સપ્રેસ';

  return (
    <>
      <section className="py-8 mt-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-full">
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <h2 className="section-title">{language === 'gu' ? 'રીલ્સ' : 'Reels'}</h2>
            </div>
            <Link 
              to="/reels" 
              className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {language === 'gu' ? 'બધા રીલ્સ જુઓ' : 'View All Reels'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile: Horizontal Scroll, Desktop: Grid */}
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('loading')}
            </div>
          ) : reels.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('no_news_available')}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0">
              {reels
                .filter((reel) => {
                  // Only show reels with uploaded video files (not YouTube URLs)
                  const reelUrl = getReelUrl(reel);
                  return reelUrl !== null;
                })
                .slice(0, 8)
                .map((reel) => {
                  const reelUrl = getReelUrl(reel);
                  return (
                    <div
                      key={reel.id}
                    onClick={(e) => {
                      if (reelUrl) {
                        e.preventDefault();
                        e.stopPropagation();
                        const filteredReels = reels.filter((r) => getReelUrl(r) !== null);
                        const reelIndex = filteredReels.findIndex((r) => r.id === reel.id);
                        if (reelIndex !== -1) {
                          setActiveReelIndex(reelIndex);
                        }
                      }
                    }}
                      className="flex-shrink-0 w-48 md:w-auto group cursor-pointer"
                    >
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
                      <img
                        src={
                          getMediaUrl(reel.thumbnail) ||
                          'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'
                        }
                        alt={getTitle(reel)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      {reelUrl && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 flex items-center justify-center bg-primary/90 rounded-full">
                            <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                          {getTitle(reel)}
                        </p>
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <span>{authorLabel}</span>
                          {typeof reel.view_count === 'number' && (
                            <>
                              <span>•</span>
                              <span>
                                {formatViews(reel.view_count)}{' '}
                                {language === 'en' ? 'views' : 'વ્યૂઝ'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Immersive Reel Player */}
      {activeReelIndex !== null && (
        <ImmersiveReelPlayer
          reels={reels.filter((r) => getReelUrl(r) !== null)}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </>
  );
}
