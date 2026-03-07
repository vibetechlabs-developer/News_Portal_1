import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Newspaper, Calendar, ExternalLink, Download } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getEpaperEditions, getMediaUrl, type EpaperEditionItem } from "@/lib/api";

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr);
  if (!Number.isFinite(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

function toIsoDateOnly(dateStr: string): string {
  // Backend stores publication_date as YYYY-MM-DD; normalize in case time sneaks in.
  if (!dateStr) return "";
  const m = String(dateStr).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : String(dateStr);
}

export default function Epaper() {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editions, setEditions] = useState<EpaperEditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = useMemo(() => {
    if (language === "gu") return "gu-IN";
    if (language === "hi") return "hi-IN";
    return "en-IN";
  }, [language]);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const ed of editions) set.add(toIsoDateOnly(ed.publication_date));
    return Array.from(set).filter(Boolean).sort((a, b) => (a < b ? 1 : -1)); // desc
  }, [editions]);

  const selectedDate = useMemo(() => {
    const fromQuery = searchParams.get("date");
    const normalized = fromQuery ? toIsoDateOnly(fromQuery) : "";
    if (normalized && availableDates.includes(normalized)) return normalized;
    return availableDates[0] ?? ""; // latest by default
  }, [availableDates, searchParams]);

  const editionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return editions
      .filter((ed) => toIsoDateOnly(ed.publication_date) === selectedDate)
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [editions, selectedDate]);

  const selectedEditionId = useMemo(() => {
    const idParam = searchParams.get("id");
    const parsed = idParam ? Number(idParam) : NaN;
    if (Number.isFinite(parsed) && editionsForSelectedDate.some((e) => e.id === parsed)) return parsed;
    return editionsForSelectedDate[0]?.id ?? null;
  }, [editionsForSelectedDate, searchParams]);

  const selectedEdition = useMemo(() => {
    if (!selectedEditionId) return null;
    return editionsForSelectedDate.find((e) => e.id === selectedEditionId) ?? null;
  }, [editionsForSelectedDate, selectedEditionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEpaperEditions({ page_size: 50 });
        const list = Array.isArray(data) ? data : data?.results ?? [];
        const normalized = Array.isArray(list) ? list : [];
        normalized.sort((a, b) => (a.publication_date < b.publication_date ? 1 : -1));
        if (!cancelled) setEditions(normalized);
      } catch (e) {
        console.error("Failed to load e-paper editions:", e);
        if (!cancelled) {
          setEditions([]);
          setError(
            language === "en"
              ? "Unable to load e-paper editions."
              : language === "hi"
                ? "ई-पेपर संस्करण लोड नहीं हो पाए।"
                : "ઈ-પેપર આવૃત્તિઓ લોડ થઈ શકી નથી."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Keep query params in sync (default to latest date once we have data).
  useEffect(() => {
    if (!availableDates.length) return;
    const curDate = searchParams.get("date");
    const curId = searchParams.get("id");
    const nextDate = selectedDate || availableDates[0];
    const nextId = selectedEditionId != null ? String(selectedEditionId) : "";

    const needsDate = !curDate || toIsoDateOnly(curDate) !== nextDate;
    const needsId = editionsForSelectedDate.length > 1 && (!curId || String(curId) !== nextId);

    if (needsDate || needsId) {
      const next = new URLSearchParams(searchParams);
      next.set("date", nextDate);
      if (editionsForSelectedDate.length > 1 && nextId) next.set("id", nextId);
      else next.delete("id");
      setSearchParams(next, { replace: true });
    }
    // Intentionally exclude setSearchParams from deps to avoid loops; it's stable in react-router-dom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates.length, editionsForSelectedDate.length, selectedDate, selectedEditionId]);

  const pdfUrl = selectedEdition ? getMediaUrl(selectedEdition.pdf_file) : "";
  const pdfUrlForEmbed = pdfUrl ? `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1` : "";

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
              <Newspaper className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="headline-primary text-foreground">{t("epaper")}</h1>
              <p className="text-muted-foreground text-sm">
                {language === "en"
                  ? "Browse the latest e-paper editions."
                  : language === "hi"
                    ? "नवीनतम ई-पेपर संस्करण देखें।"
                    : "તાજી ઈ-પેપર આવૃત્તિઓ જુઓ."}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Loading..." : language === "hi" ? "लोड हो रहा है..." : "લોડ થઈ રહ્યું છે..."}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : editions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en"
              ? "No e-paper editions available yet."
              : language === "hi"
                ? "अभी कोई ई-पेपर संस्करण उपलब्ध नहीं है।"
                : "હમણાં કોઈ ઈ-પેપર આવૃત્તિ ઉપલબ્ધ નથી."}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  {language === "en" ? "Select date" : language === "hi" ? "तारीख चुनें" : "તારીખ પસંદ કરો"}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const nextDate = toIsoDateOnly(e.target.value);
                        const next = new URLSearchParams(searchParams);
                        next.set("date", nextDate);
                        next.delete("id");
                        setSearchParams(next);
                      }}
                      className="h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                    />
                  </div>

                  {availableDates.length > 0 && (
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        const nextDate = toIsoDateOnly(e.target.value);
                        const next = new URLSearchParams(searchParams);
                        next.set("date", nextDate);
                        next.delete("id");
                        setSearchParams(next);
                      }}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      aria-label="Select e-paper date"
                    >
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {formatDate(d, locale)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "en"
                    ? "Only dates with available editions are listed."
                    : language === "hi"
                      ? "केवल उपलब्ध संस्करण वाली तिथियाँ दिखाई जाती हैं।"
                      : "માત્ર ઉપલબ્ધ આવૃત્તિ ધરાવતી તારીખો જ દેખાશે."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {editionsForSelectedDate.length > 1 && (
                  <select
                    value={selectedEditionId ?? ""}
                    onChange={(e) => {
                      const nextId = Number(e.target.value);
                      const next = new URLSearchParams(searchParams);
                      next.set("date", selectedDate);
                      if (Number.isFinite(nextId)) next.set("id", String(nextId));
                      setSearchParams(next);
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Select e-paper edition"
                  >
                    {editionsForSelectedDate.map((ed, idx) => (
                      <option key={ed.id} value={ed.id}>
                        {(idx === 0 ? (language === "en" ? "Latest" : language === "hi" ? "नवीनतम" : "નવતમ") : `#${idx + 1}`) +
                          " — " +
                          (ed.title || t("epaper"))}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" disabled={!pdfUrl}>
                    <a href={pdfUrl} rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {language === "en" ? "Open" : language === "hi" ? "खोलें" : "ખોલો"}
                    </a>
                  </Button>
                  <Button asChild size="sm" disabled={!pdfUrl}>
                    <a href={pdfUrl} download>
                      <Download className="w-4 h-4" />
                      {language === "en" ? "Download" : language === "hi" ? "डाउनलोड" : "ડાઉનલોડ"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Inline viewer */}
            {selectedEdition ? (
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{selectedEdition.title || t("epaper")}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedEdition.publication_date, locale)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={pdfUrl} rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        {language === "en" ? "Open PDF" : language === "hi" ? "PDF खोलें" : "PDF ખોલો"}
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <a href={pdfUrl} download>
                        <Download className="w-4 h-4" />
                        {language === "en" ? "Download PDF" : language === "hi" ? "PDF डाउनलोड" : "PDF ડાઉનલોડ"}
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="bg-background">
                  <object
                    data={pdfUrlForEmbed}
                    type="application/pdf"
                    className="w-full h-[75vh] md:h-[80vh]"
                  >
                    <div className="p-6 text-sm text-muted-foreground space-y-2">
                      <p>
                        {language === "en"
                          ? "Your browser couldn't display the PDF inline."
                          : language === "hi"
                            ? "आपका ब्राउज़र PDF को पेज पर नहीं दिखा पा रहा है।"
                            : "તમારો બ્રાઉઝર PDF પેજ પર બતાવી શકતો નથી."}
                      </p>
                      <a className="text-primary underline" href={pdfUrl} rel="noreferrer">
                        {language === "en" ? "Open PDF in new tab" : language === "hi" ? "नई टैब में PDF खोलें" : "નવી ટેબમાં PDF ખોલો"}
                      </a>
                    </div>
                  </object>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {language === "en"
                  ? "No edition found for the selected date."
                  : language === "hi"
                    ? "चुनी हुई तारीख के लिए कोई संस्करण नहीं मिला।"
                    : "પસંદ કરેલી તારીખ માટે કોઈ આવૃત્તિ મળી નથી."}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

