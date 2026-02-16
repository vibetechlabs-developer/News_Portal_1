import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewsCard } from '@/components/news/NewsCard';

interface CategoryNewsProps {
  categoryKey: string;
  articles: Array<{
    image: string;
    headline: string;
    headlineEn: string;
    time: string;
  }>;
}

export function CategoryNews({ categoryKey, articles }: CategoryNewsProps) {
  const { t, language } = useLanguage();

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{t(categoryKey)}</h2>
        <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
          {language === 'gu' ? 'વધુ જુઓ' : 'View More'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map((article, index) => (
          <NewsCard
            key={index}
            image={article.image}
            category={t(categoryKey)}
            headline={language === 'en' ? article.headlineEn : article.headline}
            time={article.time}
            variant={index === 0 ? 'default' : 'horizontal'}
          />
        ))}
      </div>
    </section>
  );
}
