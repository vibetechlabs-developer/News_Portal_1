import { useEffect, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCricketNews, type CricketNewsItem, type CricketNewsResponse } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type NormalizedCricketItem = {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
};

function normalizeCricketItems(payload: CricketNewsResponse | CricketNewsItem[] | undefined): NormalizedCricketItem[] {
  if (!payload) return [];

  const fromTopLevel: CricketNewsItem[] = Array.isArray(payload)
    ? payload
    : ((payload.items || payload.news || payload.articles) as CricketNewsItem[] | undefined) || [];

  // Support Cricbuzz-style payload: { storyList: [{ story: { id, hline, intro, pubTime, ... } }, ...] }
  const fromStoryList: CricketNewsItem[] =
    !Array.isArray(payload) && Array.isArray(payload.storyList)
      ? payload.storyList
          .map((entry, idx) => {
            const story = (entry && entry.story) || (entry as unknown as CricketNewsItem);
            if (!story) return undefined;
            const mapped: CricketNewsItem = {
              ...story,
            };
            // Ensure id exists
            if (mapped.id == null) mapped.id = (story as any).id ?? idx;
            // Map hline -> headline/title if not already present
            if (!mapped.headline && (story as any).hline) {
              mapped.headline = (story as any).hline as string;
            }
            // Map pubTime (epoch ms) -> publishedAt ISO string
            if (!mapped.publishedAt && (story as any).pubTime) {
              const ms = Number((story as any).pubTime);
              if (Number.isFinite(ms)) {
                mapped.publishedAt = new Date(ms).toISOString();
              }
            }
            return mapped;
          })
          .filter((x): x is CricketNewsItem => Boolean(x))
      : [];

  const sourceArray: CricketNewsItem[] = fromTopLevel.length ? fromTopLevel : fromStoryList;

  return sourceArray
    .filter((item) => item)
    .map((item, idx) => {
      const title =
        (item.title as string) ||
        (item.headline as string) ||
        ((item as any).hline as string) ||
        (item.summary as string) ||
        (item.intro as string) ||
        "";
      const summary = (item.summary as string) || (item.intro as string) || "";
      const url = (item.url as string) || (item.link as string) || undefined;
      const image = (item.imageUrl as string) || (item.image as string) || undefined;
      let publishedAt = (item.publishedAt as string) || (item.pubDate as string) || undefined;
      if (!publishedAt && typeof (item as any).pubTime !== "undefined") {
        const ms = Number((item as any).pubTime);
        if (Number.isFinite(ms)) {
          publishedAt = new Date(ms).toISOString();
        }
      }

      return {
        id: String(item.id ?? idx),
        title,
        summary,
        url,
        image,
        publishedAt,
      };
    })
    .filter((item) => item.title.trim().length > 0);
}

export function CricketLiveWidget() {
  const { language } = useLanguage();
  const [items, setItems] = useState<NormalizedCricketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCricketNews();
      const normalized = normalizeCricketItems(data);
      setItems(normalized.slice(0, 6));
    } catch (err) {
      console.error("Failed to load cricket news:", err);
      setError(
        language === "en"
          ? "Unable to load live cricket updates."
          : "લાઈવ ક્રિકેટ અપડેટ્સ લોડ કરી શકાયા નથી."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const intervalId = setInterval(() => {
      void load();
    }, 60_000); // refresh every 60 seconds
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase animate-pulse">
            Live
          </span>
          <h3 className="section-title text-lg flex items-center gap-1">
            <Radio className="w-4 h-4 text-primary" />
            {language === "en" ? "Cricket Updates" : "ક્રિકેટ અપડેટ્સ"}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted text-muted-foreground"
          aria-label={language === "en" ? "Refresh cricket updates" : "ક્રિકેટ અપડેટ્સ રિફ્રેશ કરો"}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse flex flex-col gap-1">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {language === "en"
            ? "Live cricket feed is currently unavailable."
            : "હાલમાં લાઈવ ક્રિકેટ ફીડ ઉપલબ્ધ નથી."}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border-b border-border last:border-0 pb-2 last:pb-0">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2"
                >
                  {item.title}
                </a>
              ) : (
                <p className="font-medium text-sm text-foreground line-clamp-2">{item.title}</p>
              )}
              {item.publishedAt && (
                <p className="text-xs text-muted-foreground mt-1">{formatTime(item.publishedAt)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

