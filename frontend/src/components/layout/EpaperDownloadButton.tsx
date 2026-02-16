import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMediaUrl, listEpaperPublic, type EpaperEdition } from "@/lib/api";

export function EpaperDownloadButton() {
  const { language } = useLanguage();
  const [latest, setLatest] = useState<EpaperEdition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const items = await listEpaperPublic({ limit: 1 });
        if (!cancelled) setLatest(items[0] ?? null);
      } catch {
        if (!cancelled) setLatest(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = useMemo(() => {
    if (loading) return language === "en" ? "Loading…" : "લોડ…";
    return language === "en" ? "E-Newspaper" : "ઈ-ન્યૂઝપેપર";
  }, [language, loading]);

  const download = () => {
    if (!latest) {
      const msg =
        language === "en"
          ? "No e-paper PDF uploaded yet."
          : "હજુ ઈ-પેપર PDF અપલોડ થયું નથી.";
      // eslint-disable-next-line no-alert
      alert(msg);
      return;
    }
    const url = getMediaUrl(latest.pdf_file);
    const filename =
      language === "en"
        ? `Kanam-Express-ePaper-${latest.publication_date}.pdf`
        : `કાનમ-એકસ્પ્રેસ-ઈ-પેપર-${latest.publication_date}.pdf`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={download}
        disabled={loading}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
        title={language === "en" ? "Download latest e-paper PDF" : "નવીનતમ ઈ-પેપર PDF ડાઉનલોડ"}
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">{title}</span>
      </button>
    </div>
  );
}

