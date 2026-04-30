import { Link, useNavigate } from 'react-router-dom';
import { Search, X, User, LogOut, Newspaper, Radio, Smartphone, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getTrendingTags, type TagItem } from '@/lib/api';
import { subscribeBrowserPush } from '@/lib/webPush';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

export function Header() {
  const { t, language } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTags, setTrendingTags] = useState<TagItem[]>([]);

  useEffect(() => {
    getTrendingTags(8).then((tags) => setTrendingTags(Array.isArray(tags) ? tags : [])).catch(() => { });
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

  const handleEnableNotifications = async () => {
    try {
      const result = await subscribeBrowserPush();
      toast({
        title: result.ok ? (language === 'gu' ? 'સફળ' : 'Success') : (language === 'gu' ? 'નોટિફિકેશન સેટ થયું નહીં' : 'Unable to enable notifications'),
        description: result.message,
        variant: result.ok ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: language === 'gu' ? 'નોટિફિકેશન સેટ થયું નહીં' : 'Unable to enable notifications',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-card border-b border-border py-5 md:py-6 lg:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">

          {/* Center: Logo */}
          <Link
            to="/"
            className="flex-[2] min-w-0 flex justify-center items-center py-1 px-2"
          >
            <img
              src={logo}
              alt="Kanam Express"
              className="w-52 sm:w-64 md:w-72 lg:w-80 xl:w-96 h-auto max-h-32 md:max-h-36 lg:max-h-40 object-contain drop-shadow-lg hover:opacity-90 transition-opacity"
            />
          </Link>


          {/* Right: Live TV + Login/Signup */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            {/* App Download Button */}
            <a
              href="/kanam-app.apk"
              download="Kanam-Express.apk"
              className="flex flex-col items-center justify-center gap-1 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3 py-0 sm:py-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-all group relative overflow-visible"
              title={language === 'gu' ? 'એપ ડાઉનલોડ કરો' : 'Download App'}
            >
              <div className="relative">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="hidden sm:flex items-center gap-1 relative">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                  {language === 'gu' ? 'એપ' : 'App'}
                </span>
              </div>
            </a>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="flex flex-col items-center justify-center gap-1 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3 py-0 sm:py-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-all group relative overflow-visible"
              title={language === 'gu' ? 'બ્રાઉઝર નોટિફિકેશન ચાલુ કરો' : 'Enable browser notifications'}
            >
              <div className="relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="hidden sm:flex items-center gap-1 relative">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                  {language === 'gu' ? 'ALERT' : 'ALERT'}
                </span>
              </div>
            </button>
            {/* Live TV Button */}
            <Link
              to="/live-videos"
              className="flex flex-col items-center justify-center gap-1 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3 py-0 sm:py-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-all group relative overflow-visible"
              title={t('live_tv')}
            >
              <div className="relative">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse shadow-lg shadow-green-500/50"></span>
              </div>
              <div className="hidden sm:flex items-center gap-1 relative">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-500/10 dark:bg-green-500/20 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
            </Link>
            {/* E-paper Button */}
            <Link
              to="/epaper"
              className="flex flex-col items-center justify-center gap-1 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3 py-0 sm:py-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-all group relative overflow-visible"
              title={t('epaper')}
            >
              <div className="relative">
                <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="hidden sm:flex items-center gap-1 relative">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                  {t('epaper')}
                </span>
              </div>
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
