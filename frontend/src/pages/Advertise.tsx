import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Eye, Newspaper, TrendingUp, Mail, Phone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, SiteSettingsData } from '@/lib/api';

const Advertise = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLayout showTicker={false}>
        <div className="container mx-auto px-4 py-8 min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  // Fallback defaults if API fails or empty
  const defaultStats = [
    { icon: Users, value: '50M+', label: language === 'gu' ? 'માસિક વાચકો' : language === 'hi' ? 'मासिक पाठक' : 'Monthly Readers' },
    { icon: Eye, value: '100M+', label: language === 'gu' ? 'પેજ વ્યૂઝ' : language === 'hi' ? 'पेज व्यूज़' : 'Page Views' },
    { icon: Newspaper, value: '15+', label: language === 'gu' ? 'પ્રિન્ટ આવૃત્તિઓ' : language === 'hi' ? 'प्रिंट संस्करण' : 'Print Editions' },
    { icon: TrendingUp, value: '#1', label: language === 'gu' ? 'ગુજરાતમાં' : language === 'hi' ? 'गुजरात में' : 'In Gujarat' },
  ];

  const statIcons = [Users, Eye, Newspaper, TrendingUp];

  const stats = [1, 2, 3, 4].map((i, idx) => {
    const val = settings?.[`adv_stat${i}_value` as keyof SiteSettingsData] as string;
    const lblEn = settings?.[`adv_stat${i}_label_en` as keyof SiteSettingsData] as string;
    const lblGu = settings?.[`adv_stat${i}_label_gu` as keyof SiteSettingsData] as string;
    const lblHi = settings?.[`adv_stat${i}_label_hi` as keyof SiteSettingsData] as string;

    if (!val && !lblEn) return defaultStats[idx]; // fallback if not configured

    const label = language === 'hi' ? (lblHi || lblEn) : language === 'gu' ? (lblGu || lblEn) : lblEn;

    return {
      icon: statIcons[idx % statIcons.length],
      value: val || '',
      label: label || ''
    };
  });

  const adFormats = [1, 2, 3].map(i => {
    const tEn = settings?.[`adv_format${i}_title_en` as keyof SiteSettingsData] as string;
    const tGu = settings?.[`adv_format${i}_title_gu` as keyof SiteSettingsData] as string;
    const tHi = settings?.[`adv_format${i}_title_hi` as keyof SiteSettingsData] as string;
    
    const dEn = settings?.[`adv_format${i}_desc_en` as keyof SiteSettingsData] as string;
    const dGu = settings?.[`adv_format${i}_desc_gu` as keyof SiteSettingsData] as string;
    const dHi = settings?.[`adv_format${i}_desc_hi` as keyof SiteSettingsData] as string;

    const tagsEn = settings?.[`adv_format${i}_tags_en` as keyof SiteSettingsData] as string;
    const tagsGu = settings?.[`adv_format${i}_tags_gu` as keyof SiteSettingsData] as string;
    const tagsHi = settings?.[`adv_format${i}_tags_hi` as keyof SiteSettingsData] as string;

    const title = language === 'hi' ? (tHi || tEn) : language === 'gu' ? (tGu || tEn) : tEn;
    const desc = language === 'hi' ? (dHi || dEn) : language === 'gu' ? (dGu || dEn) : dEn;
    const tagsStr = language === 'hi' ? (tagsHi || tagsEn) : language === 'gu' ? (tagsGu || tagsEn) : tagsEn;
    const formats = tagsStr ? tagsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    return { title, description: desc, formats };
  }).filter(f => f.title); // Filter out empty formats

  // Fallback hero texts
  const heroTitleEn = settings?.advertise_title_en || 'Advertise With Us';
  const heroTitleGu = settings?.advertise_title_gu || 'અમારી સાથે જાહેરાત કરો';
  const heroTitleHi = settings?.advertise_title_hi || 'हमारे साथ विज्ञापन करें';
  const heroTitle = language === 'hi' ? heroTitleHi : language === 'gu' ? heroTitleGu : heroTitleEn;

  const heroDescEn = settings?.advertise_desc_en || 'Reach millions of engaged readers across Gujarat through print, digital, and broadcast media.';
  const heroDescGu = settings?.advertise_desc_gu || 'પ્રિન્ટ, ડિજિટલ અને બ્રોડકાસ્ટ મીડિયા દ્વારા ગુજરાત ભરમાં લાખો વ્યસ્ત વાચકો સુધી પહોંચો.';
  const heroDescHi = settings?.advertise_desc_hi || 'प्रिंट, डिजिटल और प्रसारण मीडिया के माध्यम से गुजरात भर में लाखों पाठकों तक पहुंचें।';
  const heroDesc = language === 'hi' ? heroDescHi : language === 'gu' ? heroDescGu : heroDescEn;

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-12 text-center">
          <h1 className="headline-display text-foreground mb-4">
            {heroTitle}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {heroDesc}
          </p>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-xl p-6 text-center shadow-card">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Ad Formats */}
        {adFormats.length > 0 && (
          <div className="mb-12">
            <h2 className="headline-secondary text-foreground mb-6 text-center">
              {language === 'gu' ? 'જાહેરાત સોલ્યુશન્સ' : language === 'hi' ? 'विज्ञापन समाधान' : 'Advertising Solutions'}
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
        )}

        {/* Contact Section */}
        <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'hi' ? 'संपर्क करें' : language === 'gu' ? 'સંપર્કમાં રહો' : 'Get in Touch'}
            </h2>
            <p className="mb-6 opacity-90">
              {language === 'hi' 
                ? 'हमारी विज्ञापन टीम प्रभावशाली अभियान बनाने में आपकी सहायता करने के लिए तैयार है।' 
                : language === 'gu'
                ? 'અમારી જાહેરાત ટીમ પ્રભાવશાળી ઝુંબેશો બનાવવામાં તમારી મદદ કરવા તૈયાર છે.'
                : 'Our advertising team is ready to help you create impactful campaigns.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a href={`mailto:${settings?.contact_email || 'ads@sandesh.com'}`} className="flex items-center gap-2 text-lg hover:underline transition-all">
                <Mail className="w-5 h-5 flex-shrink-0" />
                {settings?.contact_email || 'ads@sandesh.com'}
              </a>
              <a href={`tel:${settings?.contact_phone_primary || '+917926822222'}`} className="flex items-center gap-2 text-lg hover:underline transition-all">
                <Phone className="w-5 h-5 flex-shrink-0" />
                {settings?.contact_phone_primary || '+91 79 2682 2222'}
              </a>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
            >
              {language === 'hi' ? 'मीडिया किट का अनुरोध करें' : language === 'gu' ? 'મીડિયા કિટ માટે વિનંતી કરો' : 'Request Media Kit'}
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Advertise;
