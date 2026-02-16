import { useEffect, useState } from 'react';
import { Play, Eye, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { getReels, getMediaUrl, type ReelContentItem } from '@/lib/api';
import { getReelUrl as getReelUrlUtil } from '@/lib/videoUtils';
import { ImmersiveReelPlayer } from '@/components/reels/ImmersiveReelPlayer';

function formatCount(count?: number): string {
  if (!count) return '0';
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

function getTitle(reel: ReelContentItem, lang: string): string {
  return lang === 'en' ? reel.title_en : (reel.title_gu || reel.title_hi || reel.title_en);
}

function getReelUrl(reel: ReelContentItem): string | null {
  // Reels should ONLY show uploaded video files, not YouTube URLs
  return getReelUrlUtil(reel.youtube_url, reel.file, getMediaUrl);
}

const Reels = () => {
  const { language } = useLanguage();
  const [reels, setReels] = useState<ReelContentItem[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getReels();
        if (cancelled) return;
        setReels(res.results ?? []);
      } catch (err) {
        console.error('Failed to fetch reels page:', err);
        if (!cancelled) setReels([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter reels with valid video URLs
  const validReels = reels.filter((reel) => {
    const reelUrl = getReelUrl(reel);
    return reelUrl !== null;
  });

  // Desktop: Grid layout like video section
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-full">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
          <div>
            <h1 className="headline-primary text-foreground">
              {language === 'en' ? 'Reels' : 'રીલ્સ'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'Watch short news videos' : 'ટૂંકા સમાચાર વિડિયો જુઓ'}
            </p>
          </div>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {validReels.map((reel) => {
              const reelUrl = getReelUrl(reel);
              return (
                <div
                  key={reel.id}
                onClick={(e) => {
                  if (reelUrl) {
                    e.preventDefault();
                    e.stopPropagation();
                    const reelIndex = validReels.findIndex((r) => r.id === reel.id);
                    if (reelIndex !== -1) {
                      setActiveReelIndex(reelIndex);
                    }
                  }
                }}
                  className="group cursor-pointer block"
                >
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
                <img
                  src={
                    getMediaUrl(reel.thumbnail) ||
                    'https://images.unsplash.com/photo-1516031190212-da133013de50?w=800'
                  }
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button Overlay */}
                {reelUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 flex items-center justify-center bg-primary/90 rounded-full">
                      <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>
                )}

                {/* Views Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">
                    {formatCount(reel.view_count)}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xs">K</span>
                    </div>
                    <span className="text-white text-xs font-medium">
                      {language === 'en' ? 'Kanam Express' : 'કણમ એક્સપ્રેસ'}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {getTitle(reel, language)}
                  </p>
                </div>

                {/* Stats */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white/70 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {formatCount(reel.likes_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {formatCount(reel.view_count)}
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
            {language === 'en' ? 'Load More Reels' : 'વધુ રીલ્સ લોડ કરો'}
          </button>
        </div>
      </div>

      {/* Immersive Reel Player */}
      {activeReelIndex !== null && (
        <ImmersiveReelPlayer
          reels={validReels}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </PageLayout>
  );
};

export default Reels;
