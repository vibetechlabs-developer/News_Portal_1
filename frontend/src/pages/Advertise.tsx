import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Eye, Newspaper, TrendingUp, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Advertise = () => {
  const { language } = useLanguage();

  const stats = [
    { icon: Users, value: '50M+', label: language === 'en' ? 'Monthly Readers' : 'માસિક વાચકો' },
    { icon: Eye, value: '100M+', label: language === 'en' ? 'Page Views' : 'પેજ વ્યૂઝ' },
    { icon: Newspaper, value: '15+', label: language === 'en' ? 'Print Editions' : 'પ્રિન્ટ આવૃત્તિઓ' },
    { icon: TrendingUp, value: '#1', label: language === 'en' ? 'In Gujarat' : 'ગુજરાતમાં' },
  ];

  const adFormats = [
    {
      title: language === 'en' ? 'Print Advertising' : 'પ્રિન્ટ જાહેરાત',
      description: language === 'en'
        ? 'Reach millions through our daily newspaper editions across Gujarat.'
        : 'ગુજરાત ભરમાં અમારી દૈનિક અખબાર આવૃત્તિઓ દ્વારા લાખો સુધી પહોંચો.',
      formats: language === 'en'
        ? ['Full Page', 'Half Page', 'Quarter Page', 'Classified']
        : ['ફુલ પેજ', 'હાફ પેજ', 'ક્વાર્ટર પેજ', 'ક્લાસિફાઇડ'],
    },
    {
      title: language === 'en' ? 'Digital Advertising' : 'ડિજિટલ જાહેરાત',
      description: language === 'en'
        ? 'Target your audience with precision on our website and mobile app.'
        : 'અમારી વેબસાઇટ અને મોબાઇલ એપ્લિકેશન પર ચોકસાઈ સાથે તમારા પ્રેક્ષકોને લક્ષ્ય બનાવો.',
      formats: language === 'en'
        ? ['Banner Ads', 'Native Ads', 'Video Ads', 'Sponsored Content']
        : ['બેનર એડ્સ', 'નેટિવ એડ્સ', 'વિડિયો એડ્સ', 'સ્પોન્સર્ડ કન્ટેન્ટ'],
    },
    {
      title: language === 'en' ? 'TV Advertising' : 'ટીવી જાહેરાત',
      description: language === 'en'
        ? 'Advertise on Sandesh News channel and reach viewers across India.'
        : 'સંદેશ ન્યૂઝ ચેનલ પર જાહેરાત કરો અને સમગ્ર ભારતમાં દર્શકો સુધી પહોંચો.',
      formats: language === 'en'
        ? ['Spot Ads', 'Aston Bands', 'L-Bands', 'Sponsorships']
        : ['સ્પોટ એડ્સ', 'એસ્ટન બેન્ડ્સ', 'એલ-બેન્ડ્સ', 'સ્પોન્સરશિપ'],
    },
  ];

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-12 text-center">
          <h1 className="headline-display text-foreground mb-4">
            {language === 'en' ? 'Advertise With Us' : 'અમારી સાથે જાહેરાત કરો'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {language === 'en'
              ? 'Reach millions of engaged readers across Gujarat through print, digital, and broadcast media.'
              : 'પ્રિન્ટ, ડિજિટલ અને બ્રોડકાસ્ટ મીડિયા દ્વારા ગુજરાત ભરમાં લાખો વ્યસ્ત વાચકો સુધી પહોંચો.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-6 text-center shadow-card">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ad Formats */}
        <div className="mb-12">
          <h2 className="headline-secondary text-foreground mb-6 text-center">
            {language === 'en' ? 'Advertising Solutions' : 'જાહેરાત સોલ્યુશન્સ'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {adFormats.map((format, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">{format.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{format.description}</p>
                <div className="flex flex-wrap gap-2">
                  {format.formats.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'en' ? 'Get in Touch' : 'સંપર્કમાં રહો'}
            </h2>
            <p className="mb-6 opacity-90">
              {language === 'en'
                ? 'Our advertising team is ready to help you create impactful campaigns.'
                : 'અમારી જાહેરાત ટીમ પ્રભાવશાળી ઝુંબેશો બનાવવામાં તમારી મદદ કરવા તૈયાર છે.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a href="mailto:ads@sandesh.com" className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                ads@sandesh.com
              </a>
              <a href="tel:+917926822222" className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5" />
                +91 79 2682 2222
              </a>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
            >
              {language === 'en' ? 'Request Media Kit' : 'મીડિયા કિટ માટે વિનંતી કરો'}
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Advertise;
