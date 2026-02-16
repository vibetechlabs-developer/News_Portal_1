import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMediaUrl, type ArticleListItem } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface HeroSectionProps {
  /** Top 3 headline articles (from getTopNews or first 3 published). */
  articles: ArticleListItem[];
  getSectionName?: (sectionId: number) => string;
}

export function HeroSection({ articles, getSectionName }: HeroSectionProps) {
  const { language } = useLanguage();
  const top3 = articles.slice(0, 3);
  if (top3.length === 0) return null;

  const getTitle = (a: ArticleListItem) =>
    language === 'en'
      ? a.title_en ?? ''
      : (a.title_gu || a.title_hi || a.title_en) ?? '';
  const getTime = (a: ArticleListItem) => {
    const date = a.published_at || a.created_at;
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const lead = top3[0];
  const rest = top3.slice(1);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6" aria-label="Top headlines">
      {/* Lead – large */}
      <Link
        to={lead.slug ? `/article/${lead.slug}` : '/latest'}
        className="lg:col-span-2 group relative overflow-hidden rounded-xl bg-card shadow-elevated"
      >
        <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
          <img
            src={getMediaUrl(lead.featured_image) || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200'}
            alt={getTitle(lead)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl">
            {getSectionName && (
              <span className="inline-block px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                {getSectionName(lead.section)}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg leading-tight line-clamp-2">
              {getTitle(lead)}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              {getTime(lead)}
            </p>
          </div>
        </div>
      </Link>

      {/* Second & third – stacked */}
      <div className="flex flex-col gap-4 lg:gap-6">
        {rest.map((article) => (
          <Link
            key={article.id}
            to={article.slug ? `/article/${article.slug}` : '/latest'}
            className="group flex gap-4 rounded-xl bg-card overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="w-1/3 min-w-[100px] aspect-[4/3] flex-shrink-0 overflow-hidden">
              <img
                src={getMediaUrl(article.featured_image) || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400'}
                alt={getTitle(article)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col justify-center">
              {getSectionName && (
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {getSectionName(article.section)}
                </span>
              )}
              <h3 className="font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                {getTitle(article)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTime(article)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
