import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMediaUrl, listEpaperPublic, type EpaperEdition } from "@/lib/api";

const Epaper = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<EpaperEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await listEpaperPublic({ limit: 30 });
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = items[0] ?? null;
  const latestPdfUrl = latest ? getMediaUrl(latest.pdf_file) : "";

  const latestLabel = useMemo(() => {
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

  const downloadLatest = () => {
    if (!latest) return;
    const datePart = latest.publication_date;
    const filename =
      language === "en"
        ? `Kanam-Express-ePaper-${datePart}.pdf`
        : `કાનમ-એકસ્પ્રેસ-ઈ-પેપર-${datePart}.pdf`;
    const link = document.createElement("a");
    link.href = latestPdfUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {language === "en" ? "E-paper" : "ઈ-પેપર"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === "en"
              ? "Download today’s e-paper PDF and browse previous editions."
              : "આજનું ઈ-પેપર PDF ડાઉનલોડ કરો અને જૂની આવૃત્તિઓ જુઓ."}
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {language === "en" ? "Latest edition" : "નવીનતમ આવૃત્તિ"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {latest ? latestLabel : loading ? (language === "en" ? "Loading…" : "લોડ થઈ રહ્યું છે…") : (language === "en" ? "No e-paper uploaded yet." : "હજુ ઈ-પેપર અપલોડ થયું નથી.")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!latest}
                onClick={() => latestPdfUrl && window.open(latestPdfUrl, "_blank")}
              >
                {language === "en" ? "View" : "જોવો"}
              </Button>
              <Button disabled={!latest} onClick={downloadLatest}>
                {language === "en" ? "Download PDF" : "PDF ડાઉનલોડ"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {latest ? (
              <object data={`${latestPdfUrl}#page=1`} type="application/pdf" className="w-full h-[70vh] rounded-b-xl">
                <embed src={`${latestPdfUrl}#page=1`} type="application/pdf" className="w-full h-[70vh] rounded-b-xl" />
              </object>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                {language === "en"
                  ? "Once an editor uploads an e-paper PDF, it will appear here."
                  : "જ્યારે એડિટર ઈ-પેપર PDF અપલોડ કરશે, તે અહીં દેખાશે."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === "en" ? "All editions" : "બધી આવૃત્તિઓ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">{language === "en" ? "Loading…" : "લોડ થઈ રહ્યું છે…"}</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "No editions found." : "કોઈ આવૃત્તિ મળી નથી."}
              </p>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {items.map((it) => {
                  const url = getMediaUrl(it.pdf_file);
                  const d = new Date(it.publication_date);
                  const dateLabel = Number.isFinite(d.getTime())
                    ? d.toLocaleDateString(language === "en" ? "en-IN" : "gu-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : it.publication_date;
                  return (
                    <div key={it.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{it.title}</p>
                        <p className="text-xs text-muted-foreground">{dateLabel}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
                          {language === "en" ? "View" : "જોવો"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const filename =
                              language === "en"
                                ? `Kanam-Express-ePaper-${it.publication_date}.pdf`
                                : `કાનમ-એકસ્પ્રેસ-ઈ-પેપર-${it.publication_date}.pdf`;
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = filename;
                            link.target = "_blank";
                            link.rel = "noopener noreferrer";
                            link.click();
                          }}
                        >
                          {language === "en" ? "Download" : "ડાઉનલોડ"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Epaper;

