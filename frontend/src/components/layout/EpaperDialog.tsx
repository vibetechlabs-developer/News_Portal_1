import { Download, X, Newspaper, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { getMediaUrl, listEpaperPublic, type EpaperEdition } from '@/lib/api';

export function EpaperDialog() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [latestEdition, setLatestEdition] = useState<EpaperEdition | null>(null);
  const [loadingEdition, setLoadingEdition] = useState(false);

  // When dialog opens, fetch the latest e-paper edition from backend
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingEdition(true);
    listEpaperPublic({ limit: 1 })
      .then((items) => {
        if (!cancelled) {
          setLatestEdition(items[0] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLatestEdition(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingEdition(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleDownload = () => {
    if (!latestEdition) {
      // No backend e-paper available; avoid downloading placeholder image
      const message =
        language === 'en'
          ? 'No e-paper PDF is available yet. Please upload today’s e-paper from the admin panel.'
          : 'ઈ-પેપર PDF ઉપલબ્ધ નથી. કૃપા કરીને એડમિનમાંથી આજનું ઈ-પેપર અપલોડ કરો.';
      // eslint-disable-next-line no-alert
      alert(message);
      return;
    }

    const pdfUrl = getMediaUrl(latestEdition.pdf_file);
    const datePart = latestEdition.publication_date; // e.g. 2026-02-12
    const filename =
      language === 'en'
        ? `Kanam-Express-ePaper-${datePart}.pdf`
        : `કાનમ-એકસ્પ્રેસ-ઈ-પેપર-${datePart}.pdf`;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const todayDate = new Date().toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pdfUrl = latestEdition ? getMediaUrl(latestEdition.pdf_file) : '';
  // Force first page render and pass zoom to the built-in PDF viewer (Chrome/Edge)
  const pdfViewerUrl = pdfUrl ? `${pdfUrl}#page=1&zoom=${encodeURIComponent(String(zoom))}` : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
        <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">
          {language === 'en' ? 'ePaper' : 'ઈ-પેપર'}
        </span>
      </button>
    </DialogTrigger>
  
    <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-bold text-foreground">
          {language === 'en' ? 'Kanam Express ePaper' : 'કાનમ એક્સપ્રેસ ઈ-પેપર'}
        </h2>
  
          <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 25))}
              className="p-1.5 hover:bg-muted rounded"
              title={language === 'en' ? 'Zoom out' : 'ઝૂમ આઉટ'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2 min-w-[3rem] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="p-1.5 hover:bg-muted rounded"
              title={language === 'en' ? 'Zoom in' : 'ઝૂમ ઇન'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-60"
            disabled={loadingEdition}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {loadingEdition
                ? language === 'en'
                  ? 'Loading...'
                  : 'લોડ થઈ રહ્યું છે...'
                : language === 'en'
                ? 'Download PDF'
                : 'PDF ડાઉનલોડ'}
            </span>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center hover:bg-secondary rounded-full"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

        {/* Paper Preview (PDF from backend) */}
        <div className="relative bg-secondary/50 p-4">
          <div className="relative max-h-[70vh] mx-auto bg-card rounded-lg shadow-elevated overflow-auto">
            {loadingEdition ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                {language === 'en' ? 'Loading e-paper…' : 'ઈ-પેપર લોડ થઈ રહ્યું છે…'}
              </div>
            ) : !latestEdition ? (
              <div className="p-10 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'No e-paper PDF uploaded yet.' : 'હજુ સુધી ઈ-પેપર PDF અપલોડ થયું નથી.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'en'
                    ? 'Please upload from Editor/Admin → E-paper tab.'
                    : 'કૃપા કરીને Editor/Admin → E-paper ટૅબમાંથી અપલોડ કરો.'}
                </p>
              </div>
            ) : (
              <object data={pdfViewerUrl} type="application/pdf" className="w-full h-[70vh] rounded-lg">
                <embed src={pdfViewerUrl} type="application/pdf" className="w-full h-[70vh] rounded-lg" />
              </object>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card text-center">
          <p className="text-base text-foreground font-medium">
            {language === 'en'
              ? `Today's edition - ${todayDate}`
              : `આજની આવૃત્તિ - ${todayDate}`}
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}
