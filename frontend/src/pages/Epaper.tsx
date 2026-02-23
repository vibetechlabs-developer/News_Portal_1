import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { gu } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Download, FileQuestion } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMediaUrl, listEpaperPublic, type EpaperEdition } from "@/lib/api";
import { cn } from "@/lib/utils";

const Epaper = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");

  const today = useMemo(() => {
    const d = new Date();
    return format(d, "yyyy-MM-dd");
  }, []);

  const initialDate = useMemo(() => {
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (isValid(parsed) && parsed <= new Date()) return parsed;
    }
    return new Date();
  }, [dateParam]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [edition, setEdition] = useState<EpaperEdition | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const items = await listEpaperPublic({
          publication_date: dateStr,
          limit: 1,
        });
        if (!cancelled) setEdition(items[0] ?? null);
      } catch {
        if (!cancelled) setEdition(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateStr]);

  const pdfUrl = edition ? getMediaUrl(edition.pdf_file) : "";

  const dateLabel = useMemo(() => {
    return format(selectedDate, "d MMMM yyyy", {
      locale: language === "gu" ? gu : undefined,
    });
  }, [selectedDate, language]);

  const goPrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleDownload = () => {
    if (!edition) return;
    const filename =
      language === "en"
        ? `Kanam-Express-ePaper-${edition.publication_date}.pdf`
        : `કાનમ-એકસ્પ્રેસ-ઈ-પેપર-${edition.publication_date}.pdf`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const isToday = dateStr === today;
  const isFuture = selectedDate > new Date();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {language === "en" ? "E-Newspaper" : "ઈ-ન્યૂઝપેપર"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === "en"
              ? "Select a date to view and download the e-newspaper edition."
              : "ઈ-ન્યૂઝપેપર જોવા અને ડાઉનલોડ કરવા તારીખ પસંદ કરો."}
          </p>
        </div>

        {/* Date selector bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrevDate}
              disabled={isFuture}
              aria-label={language === "en" ? "Previous date" : "પહેલાની તારીખ"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[220px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(d);
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={goNextDate}
              disabled={isToday || isFuture}
              aria-label={language === "en" ? "Next date" : "આગામી તારીખ"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              onClick={handleDownload}
              disabled={!edition || loading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {language === "en" ? "Download PDF" : "PDF ડાઉનલોડ"}
            </Button>
          </div>
        </div>

        {/* Newspaper display */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Loading…" : "લોડ થઈ રહ્યું છે…"}
              </p>
            </div>
          ) : !edition ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
              <FileQuestion className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <p className="text-lg font-medium text-foreground">
                {language === "en"
                  ? "No E-Paper Found"
                  : "ઈ-પેપર મળ્યું નથી"}
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {language === "en"
                  ? `There is no e-newspaper edition available for ${dateLabel}. Please select another date.`
                  : `${dateLabel} માટે ઈ-ન્યૂઝપેપર ઉપલબ્ધ નથી. કૃપા કરીને બીજી તારીખ પસંદ કરો.`}
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {edition.title} — {dateLabel}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pdfUrl, "_blank")}
                >
                  {language === "en" ? "Open in new tab" : "નવી ટૅબમાં ખોલો"}
                </Button>
              </div>
              <div className="bg-secondary/30 p-4">
                <object
                  data={`${pdfUrl}#view=FitH`}
                  type="application/pdf"
                  className="w-full min-h-[70vh] rounded-lg"
                >
                  <embed
                    src={`${pdfUrl}#view=FitH`}
                    type="application/pdf"
                    className="w-full min-h-[70vh] rounded-lg"
                  />
                </object>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Epaper;
