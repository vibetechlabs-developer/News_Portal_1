import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  image: string;
  category: string;
  headline: string;
  excerpt?: string;
  time: string;
  variant?: 'default' | 'horizontal' | 'compact';
  href?: string;
}

export function NewsCard({ 
  image, 
  category, 
  headline, 
  excerpt, 
  time, 
  variant = 'default',
  href = '/latest'
}: NewsCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link to={href}>
        <article className="news-card flex gap-4 p-4 group cursor-pointer">
          <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={image}
              alt={headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              {category}
            </span>
            <h3 className="headline-card text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {headline}
            </h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {time}
            </span>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={href}>
        <article className="flex gap-3 py-3 border-b border-border last:border-0 group cursor-pointer">
          <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded">
            <img
              src={image}
              alt={headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {headline}
            </h4>
            <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={href}>
      <article className="news-card group cursor-pointer">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {category}
          </span>
          <h3 className="headline-card text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-2">
            {headline}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{excerpt}</p>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
      </article>
    </Link>
  );
}
