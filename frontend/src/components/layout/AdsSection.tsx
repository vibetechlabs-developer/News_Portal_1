import { useEffect, useState } from 'react';
import { getAdvertisements, getMediaUrl, type Advertisement } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

/** Placements: TOP, SIDEBAR_LEFT, SIDEBAR_RIGHT, IN_ARTICLE, FOOTER, POPUP */
type Placement = 'FOOTER' | 'TOP' | 'IN_ARTICLE';

interface AdsSectionProps {
  placement?: Placement;
  className?: string;
}

export function AdsSection({ placement = 'FOOTER', className = '' }: AdsSectionProps) {
  const { language } = useLanguage();
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAdvertisements({ placement })
      .then((data) => {
        if (!cancelled) setAds(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      });
    return () => { cancelled = true; };
  }, [placement]);

  if (ads.length === 0) {
    return (
      <div className={`bg-muted/50 border border-border rounded-xl py-8 text-center ${className}`}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {language === 'gu' ? 'જાહેરાત' : language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">Ad space</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad) => {
        const href = ad.link_url && ad.link_url.trim().length > 0 ? ad.link_url : '#';
        const isExternal = href !== '#';
        return (
          <a
            key={ad.id}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="block rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow"
          >
          {ad.ad_type === 'HTML' && ad.html_snippet ? (
            <div
              className="rounded-xl bg-background text-left min-h-[90px] flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: ad.html_snippet }}
            />
          ) : ad.image ? (
            <div className="aspect-[6/1] sm:aspect-[8/1] max-h-24 w-full flex items-center justify-center bg-muted">
              <img
                src={getMediaUrl(ad.image)}
                alt={ad.title}
                className="max-h-full w-auto object-contain"
              />
            </div>
          ) : (
            <div className="aspect-[6/1] min-h-[80px] flex items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">{ad.title}</span>
            </div>
          )}
        </a>
        );
      })}
    </div>
  );
}
