import { Link, useNavigate } from 'react-router-dom';
import { Play, Search, X, User, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EpaperDownloadButton } from './EpaperDownloadButton';
import { getTrendingTags, type TagItem } from '@/lib/api';
import logo from '@/assets/logo.png';

export function Header() {
  const { t, language } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTags, setTrendingTags] = useState<TagItem[]>([]);

  useEffect(() => {
    getTrendingTags(8).then((tags) => setTrendingTags(Array.isArray(tags) ? tags : [])).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchOpen(false);
      setSearchQuery('');
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        setSearchOpen(false);
        setSearchQuery('');
        navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const handleTagClick = (tagName: string) => {
    const q = tagName.replace(/^#/, '').trim();
    if (q) {
      setSearchOpen(false);
      setSearchQuery('');
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-card border-b border-border py-3 md:py-4">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Search */}
          <div className="flex-shrink-0">
            <Dialog open={searchOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                  <Search className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('search')}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl p-0 gap-0 [&>button]:hidden">
                <form onSubmit={handleSearchSubmit} className="relative p-4">
                  <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('search') + '...'}
                    className="pl-12 pr-12 h-14 text-lg border-2 border-primary/20 focus:border-primary rounded-full"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDialogChange(false)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </form>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground mb-2">{t('trending')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.length > 0
                      ? trendingTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagClick(tag.name)}
                            className="trending-tag"
                          >
                            #{tag.name}
                          </button>
                        ))
                      : ['#ગુજરાત', '#Cricket', '#Budget2024', '#Election'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className="trending-tag"
                          >
                            {tag}
                          </button>
                        ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Center: Logos */}
          <Link
            to="/"
            className="flex-1 flex justify-center items-center gap-3 h-20 w-30"
          >
            <img
              src={logo}
              alt="Kanam Express"
              className="h-full scale-125 sm:scale-140 md:scale-150 w-auto object-contain"
            />
            {/* Secondary logo placed beside the main logo.
                Put your exported image file (from KANAM (1).cdr) into the `public` folder
                as `kanam-partner-logo.png` so this shows correctly. */}
            <img
              src="/kanam-partner-logo.png"
              alt="Partner Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>


          {/* Right: ePaper + Live TV + Login/Signup */}
          <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 md:gap-3">
            <EpaperDownloadButton />
            <Link to="/videos" className="live-badge group text-xs sm:text-sm">
              <span className="live-dot" />Live
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span className="hidden xs:inline">{t('live_tv')}</span>
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  to={user.role === 'SUPER_ADMIN' ? '/admin' : user.role === 'EDITOR' ? '/editor' : '/reporter'}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'gu' ? 'લોગ આઉટ' : 'Log out'}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'gu' ? 'લોગિન' : 'Login'}</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium border border-primary text-primary rounded-full hover:bg-primary/10 transition-colors"
                >
                  {language === 'gu' ? 'સાઇન અપ' : 'Sign up'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
