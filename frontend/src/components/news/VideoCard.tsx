import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  duration?: string;
  views?: string;
  category?: string;
  href?: string;
  onClick?: () => void;
}

export function VideoCard({
  thumbnail,
  title,
  duration = '0:00',
  views,
  category,
  href,
  onClick,
}: VideoCardProps) {
  const content = (
    <article className="group cursor-pointer bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded">
          {duration}
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
            {category}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug">
          {title}
        </h3>
        {views && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>{views} {views === '1' ? 'view' : 'views'}</span>
          </div>
        )}
      </div>
    </article>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link to={href}>
        {content}
      </Link>
    );
  }

  // If no onClick and no href, just render the content
  return <div>{content}</div>;
}
