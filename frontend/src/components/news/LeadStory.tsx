import { Clock, Share2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface LeadStoryProps {
  image: string;
  category: string;
  headline: string;
  excerpt: string;
  author: string;
  time: string;
  href?: string;
}

export function LeadStory({ image, category, headline, excerpt, author, time, href = '/latest' }: LeadStoryProps) {
  const { t } = useLanguage();

  return (
    <Link to={href}>
      <article className="relative group overflow-hidden rounded-xl bg-card shadow-elevated cursor-pointer">
        <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
          <img
            src={image}
            alt={headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="video-overlay" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="max-w-3xl">
            <span className="category-tag mb-3 sm:mb-4">{category}</span>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg leading-tight">
              {headline}
            </h2>
            
            <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 line-clamp-2 max-w-2xl">
              {excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 text-white/70 text-xs sm:text-sm">
                <span className="font-medium">{author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {time}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
