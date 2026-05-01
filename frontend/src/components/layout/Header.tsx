import { Link, useNavigate } from 'react-router-dom';
import { Search, X, User, LogOut, Newspaper, Radio, Smartphone, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  getArticles,
  getTrendingTags,
  type ArticleListItem,
  type TagItem,
} from '@/lib/api';
import {
  NEWS_BELL_LAST_SEEN_KEY,
  getArticleComparableTime,
  parseNewsBellLastSeen,
} from '@/lib/newsBell';
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
  const [bellOpen, setBellOpen] = useState(false);
  const [bellArticles, setBellArticles] = useState<ArticleListItem[]>([]);
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);
  const [pushBusy, setPushBusy] = useState(false);
  const bellMarkSeenPending = useRef(false);

  useEffect(() => {
    getTrendingTags(8).then((tags) => setTrendingTags(Array.isArray(tags) ? tags : [])).catch(() => { });
  }, []);

  const bumpBellLastSeenFromList = useCallback((rows: ArticleListItem[]) => {
    const first = rows[0];
    const iso =
      first?.published_at || first?.updated_at || new Date().toISOString();
    window.localStorage.setItem(NEWS_BELL_LAST_SEEN_KEY, iso);
    setUnreadNewsCount(0);
  }, []);

  const pollBellArticles = useCallback(async () => {
    try {
      const res = await getArticles({
        page: 1,
        page_size: 40,
        ordering: '-published_at,-created_at',
      });
      const rows = Array.isArray(res.results) ? res.results : [];
      setBellArticles(rows);

      let rawLs = window.localStorage.getItem(NEWS_BELL_LAST_SEEN_KEY);
      const newest = rows[0];
      if (!rawLs && newest) {
        const anchor = newest.published_at || newest.updated_at || new Date().toISOString();
        window.localStorage.setItem(NEWS_BELL_LAST_SEEN_KEY, anchor);
        rawLs = anchor;
      }

      const lastTs = parseNewsBellLastSeen(rawLs);
      const unread = rows.filter((a) => getArticleComparableTime(a) > lastTs).length;
      setUnreadNewsCount(unread);
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    void pollBellArticles();
    const id = window.setInterval(() => void pollBellArticles(), 45000);
    return () => window.clearInterval(id);
  }, [pollBellArticles]);

  const onBellOpenChange = useCallback((open: boolean) => {
    setBellOpen(open);
    if (open) {
      bellMarkSeenPending.current = true;
      void pollBellArticles();
    } else {
      bellMarkSeenPending.current = false;
    }
  }, [pollBellArticles]);

  useEffect(() => {
    if (!bellOpen || !bellMarkSeenPending.current || bellArticles.length === 0) return;
    bumpBellLastSeenFromList(bellArticles);
    bellMarkSeenPending.current = false;
  }, [bellOpen, bellArticles, bumpBellLastSeenFromList]);

  const handleEnablePushFromBell = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      const result = await subscribeBrowserPush();
      toast({
        title: result.ok ? (language === 'gu' ? 'સફળ' : 'Success') : (language === 'gu' ? 'નોટિફિકેશન' : 'Notifications'),
        description: result.message,
        variant: result.ok ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: language === 'gu' ? 'ભૂલ' : 'Error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setPushBusy(false);
    }
  };

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
            <Popover open={bellOpen} onOpenChange={onBellOpenChange}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3 py-0 sm:py-2 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-all group relative overflow-visible"
                  title={language === 'gu' ? 'નવા સમાચાર અને સૂચનાઓ' : 'Latest news alerts'}
                  aria-label={language === 'gu' ? 'નવા સમાચાર' : 'News notifications'}
                >
                  <div className="relative">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    {unreadNewsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-[3px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-destructive-foreground border-2 border-card">
                        {unreadNewsCount > 9 ? '9+' : unreadNewsCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 relative">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                      {language === 'gu' ? 'નોટિસ' : 'NEWS'}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[min(100vw-1rem,22rem)] p-0 overflow-hidden">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">
                    {language === 'gu' ? 'નવા સમાચાર' : 'Recent news'}
                  </span>
                  {unreadNewsCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {language === 'gu' ? `${unreadNewsCount} નવું` : `${unreadNewsCount} new`}
                    </span>
                  )}
                </div>
                <ScrollArea className="max-h-[min(52vh,20rem)]">
                  <div className="py-1">
                    {bellArticles.length === 0 ? (
                      <p className="px-3 py-6 text-sm text-muted-foreground text-center">
                        {language === 'gu' ? 'હજુ લોડ થાય છે...' : 'Loading…'}
                      </p>
                    ) : (
                      bellArticles.slice(0, 25).map((a) => {
                        const dateRaw = a.published_at || a.created_at;
                        const when =
                          dateRaw &&
                          Number.isFinite(Date.parse(dateRaw))
                            ? formatDistanceToNow(new Date(dateRaw), { addSuffix: true })
                            : '';
                        const headline =
                          language === 'gu'
                            ? (a.title_gu || a.title_hi || a.title_en)
                            : (a.title_en || a.title_gu || a.title_hi);
                        return (
                          <Link
                            key={a.id}
                            to={`/article/${a.slug}`}
                            className="block px-3 py-2 hover:bg-accent/80 text-left border-b border-border/60 last:border-0 transition-colors"
                            onClick={() => setBellOpen(false)}
                          >
                            <p className="text-xs font-medium line-clamp-2 leading-snug">{headline}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{when}</p>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
                <div className="px-3 py-2 border-t border-border bg-muted/30 flex flex-col gap-2">
                  <Button type="button" size="sm" variant="outline" className="w-full" onClick={handleEnablePushFromBell} disabled={pushBusy}>
                    {language === 'gu' ? 'ક્રોમ બ્રાઉઝર એલર્ટ ચાલુ કરો' : 'Enable Chrome alerts'}
                  </Button>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {language === 'gu'
                      ? 'અહીં દબાવો અને Allow કરો — નવું સમાચાર પ્રકાશિત થતાં તરત બ્રાઉઝર સૂચના મળશે.'
                      : 'Tap the button and choose Allow — you will get a browser notification when a story is published.'}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
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
