import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMediaUrl, listEpaperPublic, type EpaperEdition } from "@/lib/api";

export function EpaperSection() {
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

  const dateLabel = useMemo(() => {
    if (!latest) return "";
    const d = new Date(latest.publication_date);
    return Number.isFinite(d.getTime())
      ? d.toLocaleDateString(language === "en" ? "en-IN" : "gu-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : latest.publication_date;
  }, [latest, language]);

  const download = () => {
    if (!latest) return;
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
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base">{language === "en" ? "E-paper" : "ઈ-પેપર"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading
                ? language === "en"
                  ? "Loading…"
                  : "લોડ થઈ રહ્યું છે…"
                : latest
                ? dateLabel
                : language === "en"
                ? "No e-paper uploaded yet."
                : "હજુ ઈ-પેપર અપલોડ થયું નથી."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/epaper">{language === "en" ? "Open" : "ખોલો"}</Link>
          </Button>
          <Button onClick={download} disabled={!latest || loading}>
            <Download className="w-4 h-4 mr-2" />
            {language === "en" ? "Download" : "ડાઉનલોડ"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">
          {language === "en"
            ? "Direct download of the latest e-paper PDF."
            : "નવીનતમ ઈ-પેપર PDFનું સીધું ડાઉનલોડ."}
        </p>
      </CardContent>
    </Card>
  );
}

