import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getArticles,
  getCategories,
  getMediaUrl,
  getTrendingTags,
  type ArticleListItem,
  type CategoryItem,
  type TagItem,
} from '@/lib/api';

const Search = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [trendingTags, setTrendingTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Keep input in sync with URL when URL changes (e.g. back/forward, tag click)
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Perform search when URL query changes
  useEffect(() => {
    let cancelled = false;
    const query = urlQuery.trim();

    if (!query) {
      setArticles([]);
      setTotalCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          getArticles({
            search: query,
            status: 'PUBLISHED',
            page_size: 50,
          }),
          getCategories(),
          getTrendingTags(10),
        ]);

        if (cancelled) return;

        let articlesList: ArticleListItem[] = [];
        let count = 0;

        if (Array.isArray(articlesRes)) {
          articlesList = articlesRes;
          count = articlesRes.length;
        } else if (articlesRes && typeof articlesRes === 'object' && 'results' in articlesRes) {
          const res = articlesRes as { results?: ArticleListItem[]; count?: number };
          articlesList = res.results ?? [];
          count = res.count ?? articlesList.length;
        }

        setArticles(articlesList);
        setTotalCount(count);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setTrendingTags(Array.isArray(tagsRes) ? tagsRes : []);
      } catch (err) {
        if (!cancelled) {
          setArticles([]);
          setTotalCount(0);
          setError(
            language === 'en'
              ? 'Search failed. Please try again.'
              : 'શોધ નિષ્ફળ ગઈ. કૃપા કરીને ફરી પ્રયાસ કરો.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlQuery, language]);

  const getArticleTitle = useCallback(
    (article: ArticleListItem) => {
      if (language === 'en') return article.title_en;
      return article.title_gu || article.title_hi || article.title_en;
    },
    [language]
  );

  const getCategoryName = useCallback(
    (categoryId: number | null) => {
      if (!categoryId) return language === 'en' ? 'News' : 'સમાચાર';
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return language === 'en' ? 'News' : 'સમાચાર';
      return language === 'en' ? category.name_en : (category.name_gu || category.name_hi || category.name_en);
    },
    [categories, language]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleTagClick = (tagName: string) => {
    const q = tagName.replace(/^#/, '').trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="headline-primary text-foreground mb-2">
            {language === 'en' ? 'Search' : 'શોધો'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Search across all news articles'
              : 'બધા સમાચાર લેખોમાં શોધો'}
          </p>

          {/* Search input */}
          <form className="mt-4 max-w-2xl" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="q"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={language === 'en' ? 'Search news...' : 'સમાચાર શોધો...'}
                className="w-full pl-12 pr-4 py-3 text-base border-2 border-primary/20 focus:border-primary rounded-full bg-card"
                autoFocus
                aria-label={language === 'en' ? 'Search news' : 'સમાચાર શોધો'}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
              >
                {language === 'en' ? 'Search' : 'શોધો'}
              </button>
            </div>
          </form>

          {/* Trending Tags */}
          {trendingTags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'en' ? 'Trending:' : 'ટ્રેન્ડિંગ:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagClick(tag.name)}
                    className="trending-tag"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {error ? (
              <div className="text-center py-12 text-destructive">
                {error}
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Searching...' : 'શોધી રહ્યું છે...'}
              </div>
            ) : !urlQuery.trim() ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en'
                  ? 'Enter a search term above to find news'
                  : 'સમાચાર શોધવા માટે ઉપર શોધ શબ્દ દાખલ કરો'}
              </div>
            ) : articles.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en'
                    ? `${totalCount} result${totalCount !== 1 ? 's' : ''} found`
                    : `${totalCount} પરિણામ${totalCount !== 1 ? 'ો' : ''} મળ્યા`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articles.map((article) => {
                    const title = getArticleTitle(article);
                    const category = getCategoryName(article.category);
                    const image = getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400';
                    const time = article.published_at
                      ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                      : formatDistanceToNow(new Date(article.created_at), { addSuffix: true });

                    if (!title) return null;

                    return (
                      <Link key={article.id} to={`/article/${article.slug}`}>
                        <NewsCard
  views={article.view_count}
  image={image}
                          category={category}
                          headline={title}
                          time={time}
                        />
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'No results found' : 'કોઈ પરિણામ મળ્યું નથી'}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Search;
