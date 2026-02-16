import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Award, Users, Target, History, User, Info } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useNewsApi';
import logo from '@/assets/logo.png';

const About = () => {
  const { language } = useLanguage();
  const { data: settings, isLoading, isError } = useSiteSettings();

  const tagline =
    language === 'en'
      ? settings?.tagline_en ?? "Fearless and Unbiased - Your trusted weekly newspaper from Gujarat"
      : language === 'hi'
        ? (settings?.tagline_hi || settings?.tagline_en) ?? ''
        : (settings?.tagline_gu || settings?.tagline_en) ?? 'નિડર અને નિષ્પક્ષ - ગુજરાતનું આપનું વિશ્વસનીય સાપ્તાહિક સમાચાર પત્ર';

  const aboutTitle =
    language === 'en'
      ? settings?.about_title_en ?? 'About Us'
      : language === 'hi'
        ? (settings?.about_title_hi || settings?.about_title_en) ?? 'अमारा विशे'
        : (settings?.about_title_gu || settings?.about_title_en) ?? 'અમારા વિશે';

  const editorName = settings?.editor_name ?? 'Japan A. Shah';
  const editorTitle =
    language === 'en'
      ? settings?.editor_title_en ?? 'Editor in Chief & Owner'
      : language === 'hi'
        ? (settings?.editor_title_hi || settings?.editor_title_en) ?? ''
        : (settings?.editor_title_gu || settings?.editor_title_en) ?? 'મુખ્ય સંપાદક અને માલિક';

  const editorBio =
    language === 'en'
      ? settings?.editor_bio_en ?? 'Leading Kanam Express with a vision to deliver unbiased, fearless journalism to the people of Gujarat. Committed to truth and transparency in every story we publish.'
      : language === 'hi'
        ? (settings?.editor_bio_hi || settings?.editor_bio_en) ?? ''
        : (settings?.editor_bio_gu || settings?.editor_bio_en) ?? 'ગુજરાતના લોકોને નિષ્પક્ષ, નિડર પત્રકારત્વ પહોંચાડવાની દ્રષ્ટિ સાથે કાનમ એક્સપ્રેસનું નેતૃત્વ. દરેક સમાચારમાં સત્ય અને પારદર્શિતા માટે પ્રતિબદ્ધ.';

  const publicationDesc =
    language === 'en'
      ? settings?.publication_description_en ?? 'Kanam Express is a weekly newspaper serving the Gujarati community with comprehensive local, national, and international news coverage.'
      : language === 'hi'
        ? (settings?.publication_description_hi || settings?.publication_description_en) ?? ''
        : (settings?.publication_description_gu || settings?.publication_description_en) ?? 'કાનમ એક્સપ્રેસ એક સાપ્તાહિક સમાચાર પત્ર છે જે ગુજરાતી સમુદાયને સ્થાનિક, રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય સમાચારોથી માહિતગાર કરે છે.';

  const mission =
    language === 'en'
      ? settings?.mission_en ?? 'To provide fearless, unbiased, and accurate news to our readers. We believe in the power of truth and are committed to upholding journalistic integrity in all our reporting.'
      : language === 'hi'
        ? (settings?.mission_hi || settings?.mission_en) ?? ''
        : (settings?.mission_gu || settings?.mission_en) ?? 'અમારા વાચકોને નિડર, નિષ્પક્ષ અને સચોટ સમાચાર પ્રદાન કરવા. અમે સત્યની શક્તિમાં માનીએ છીએ અને અમારા તમામ અહેવાલોમાં પત્રકારત્વની અખંડિતતા જાળવવા માટે પ્રતિબદ્ધ છીએ.';

  const aboutDescription =
    language === 'en'
      ? settings?.about_description_en
      : language === 'hi'
        ? settings?.about_description_hi || settings?.about_description_en
        : settings?.about_description_gu || settings?.about_description_en;

  const websiteUrl = settings?.website_url ?? 'https://www.kanamexpress.com';
  
  // Dynamic values from backend
  const getValue = (valueNum: 1 | 2 | 3 | 4, field: 'title' | 'desc') => {
    const langSuffix = language === 'en' ? '_en' : language === 'hi' ? '_hi' : '_gu';
    const key = `value${valueNum}_${field}${langSuffix}` as keyof typeof settings;
    const fallbackKey = `value${valueNum}_${field}_en` as keyof typeof settings;
    return settings?.[key] || settings?.[fallbackKey] || '';
  };

  const values = [
    { 
      icon: Award, 
      title: getValue(1, 'title') || (language === 'en' ? 'Truth' : 'સત્ય'), 
      desc: getValue(1, 'desc') || (language === 'en' ? 'Committed to truthful reporting' : 'સત્ય અહેવાલ માટે પ્રતિબદ્ધ') 
    },
    { 
      icon: Users, 
      title: getValue(2, 'title') || (language === 'en' ? 'Community' : 'સમુદાય'), 
      desc: getValue(2, 'desc') || (language === 'en' ? 'Serving our community' : 'અમારા સમુદાયની સેવા') 
    },
    { 
      icon: Target, 
      title: getValue(3, 'title') || (language === 'en' ? 'Accuracy' : 'ચોકસાઈ'), 
      desc: getValue(3, 'desc') || (language === 'en' ? 'Precise and verified news' : 'ચોક્કસ અને ચકાસાયેલ સમાચાર') 
    },
    { 
      icon: History, 
      title: getValue(4, 'title') || (language === 'en' ? 'Integrity' : 'પ્રામાણિકતા'), 
      desc: getValue(4, 'desc') || (language === 'en' ? 'Ethical journalism' : 'નૈતિક પત્રકારત્વ') 
    },
  ];

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
          </div>
        )}
        {!isLoading && (
          <>
            <div className="text-center mb-12">
              <img src={logo} alt="Kanam Express" className="h-24 md:h-32 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{aboutTitle}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{tagline}</p>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-card mb-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-16 h-16 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{editorName}</h2>
                  <p className="text-primary font-medium mb-4">{editorTitle}</p>
                  <p className="text-muted-foreground">{editorBio}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <History className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'en' ? 'Our Publication' : 'અમારું પ્રકાશન'}
                </h3>
                <p className="text-muted-foreground mb-4">{publicationDesc}</p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>{language === 'en' ? 'Weekly Newspaper' : 'સાપ્તાહિક સમાચાર પત્ર'}</span>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-card">
                <Target className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'en' ? 'Our Mission' : 'અમારું મિશન'}
                </h3>
                <p className="text-muted-foreground">{mission}</p>
              </div>
            </div>

            {/* Additional About description from backend */}
            {aboutDescription && (
              <div className="bg-card rounded-xl p-6 shadow-card mb-12">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    {language === 'en' ? 'About Kanam Express' : 'કાણમ એક્સપ્રેસ વિશે'}
                  </h2>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">
                  {aboutDescription}
                </p>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                {language === 'en' ? 'Our Values' : 'અમારા મૂલ્યો'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 shadow-card text-center">
                    <value.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center bg-primary/5 rounded-xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {language === 'en' ? 'Visit Our Website' : 'અમારી વેબસાઇટની મુલાકાત લો'}
              </h3>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-lg font-medium hover:underline"
              >
                {websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </>
        )}
        {isError && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'en' ? 'Could not load about content.' : 'અમારા વિશેની સામગ્રી લોડ થઈ શકી નથી.'}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default About;
