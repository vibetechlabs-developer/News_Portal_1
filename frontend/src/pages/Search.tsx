import { useState, useEffect } from 'react';
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

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [trendingTags, setTrendingTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state with URL parameter when it changes
  useEffect(() => {
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery, searchQuery]);

  // Perform search when query changes
  useEffect(() => {
    let cancelled = false;
    const query = searchQuery.trim();
    
    (async () => {
      if (!query) {
        setArticles([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          getArticles({ search: query, status: 'PUBLISHED' }),
          getCategories(),
          getTrendingTags(10),
        ]);
        
        if (cancelled) return;
        
        // Debug logging
        console.log('Search response:', articlesRes);
        console.log('Response type:', typeof articlesRes);
        console.log('Is array?', Array.isArray(articlesRes));
        console.log('Has results?', 'results' in articlesRes);
        console.log('Has count?', 'count' in articlesRes);
        
        // getArticles normalizes to ArticlesResponse, but handle both formats just in case
        let articlesList: ArticleListItem[] = [];
        let count = 0;
        
        if (Array.isArray(articlesRes)) {
          // Shouldn't happen after normalization, but handle it
          articlesList = articlesRes;
          count = articlesRes.length;
          console.warn('Received array instead of ArticlesResponse');
        } else if (articlesRes && typeof articlesRes === 'object' && 'results' in articlesRes) {
          // Normal ArticlesResponse format
          articlesList = (articlesRes as { results?: ArticleListItem[] }).results || [];
          count = (articlesRes as { count?: number }).count || 0;
        } else {
          console.error('Unexpected response format:', articlesRes);
        }
        
        console.log('Extracted articles:', articlesList.length, 'items');
        console.log('Extracted count:', count);
        console.log('Articles list:', articlesList);
        console.log('First article:', articlesList[0]);
        
        // Set state - ensure we're setting actual arrays
        if (Array.isArray(articlesList)) {
          setArticles(articlesList);
          setTotalCount(count);
          console.log('State updated - articles:', articlesList.length, 'count:', count);
        } else {
          console.error('articlesList is not an array:', articlesList);
          setArticles([]);
          setTotalCount(0);
        }
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setTrendingTags(Array.isArray(tagsRes) ? tagsRes : []);
      } catch (error) {
        console.error('Search failed:', error);
        if (!cancelled) {
          setArticles([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return language === 'en' ? 'News' : 'સમાચાર';
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return language === 'en' ? 'News' : 'સમાચાર';
    return language === 'en' ? category.name_en : (category.name_gu || category.name_hi || category.name_en);
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

          {/* Search input - sync with URL */}
          <form
            className="mt-4 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              if (q) {
                navigate(`/search?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search news...' : 'સમાચાર શોધો...'}
                className="w-full pl-12 pr-4 py-3 text-base border-2 border-primary/20 focus:border-primary rounded-full bg-card"
                autoFocus
              />
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
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Searching...' : 'શોધી રહ્યું છે...'}
              </div>
            ) : !searchQuery.trim() ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en'
                  ? 'Enter a search term above to find news'
                  : 'સમાચાર શોધવા માટે ઉપર શોધ શબ્દ દાખલ કરો'}
              </div>
            ) : (
              <>
                {(() => {
                  console.log('Rendering results - articles.length:', articles.length, 'totalCount:', totalCount);
                  console.log('Articles array:', articles);
                  
                  if (articles.length > 0) {
                    return (
                      <>
                        {totalCount > 0 && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {language === 'en'
                              ? `${totalCount} result${totalCount !== 1 ? 's' : ''} found`
                              : `${totalCount} પરિણામ${totalCount !== 1 ? 'ો' : ''} મળ્યા`}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {articles.map((article) => {
                            const title = getArticleTitle(article);
                            const category = getCategoryName(article.category);
                            const image = getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400';
                            const time = article.published_at
                              ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                              : formatDistanceToNow(new Date(article.created_at), { addSuffix: true });
                            
                            console.log('Rendering article:', article.id, 'title:', title);
                            
                            // Only render if we have at least a title
                            if (!title) {
                              console.warn('Article missing title:', article);
                              return null;
                            }
                            
                            return (
                              <Link key={article.id} to={`/article/${article.slug}`}>
                                <NewsCard
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
                    );
                  }
                  
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      {language === 'en' ? 'No results found' : 'કોઈ પરિણામ મળ્યું નથી'}
                      <div className="mt-2 text-xs">
                        Debug: articles.length={articles.length}, totalCount={totalCount}
                      </div>
                    </div>
                  );
                })()}
              </>
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
