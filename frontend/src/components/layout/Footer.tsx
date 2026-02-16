import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSections } from '@/hooks/useNewsApi';
import { useSiteSettings } from '@/hooks/useNewsApi';

const defaultCategoryKeys = ['gujarat', 'national', 'international', 'business', 'sports', 'entertainment'];

export function Footer() {
  const { t, language } = useLanguage();
  const { data: sections = [] } = useSections();
  const { data: siteSettings } = useSiteSettings();

  const categoryLinks = sections.length > 0
    ? sections
        .filter((s) => s.slug && s.is_active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({ key: s.slug, href: `/${s.slug}`, label: language === 'en' ? s.name_en : (s.name_gu || s.name_hi || s.name_en) }))
    : defaultCategoryKeys.map((key) => ({ key, href: `/${key}`, label: t(key) }));

  const footerLinks = {
    categories: categoryLinks,
    company: [
      { key: 'about', label: 'About Us', labelGu: 'અમારા વિશે', labelHi: 'हमारे बारे में', href: '/about' },
      { key: 'contact', label: 'Contact', labelGu: 'સંપર્ક', labelHi: 'संपर्क', href: '/contact' },
      { key: 'careers', label: 'Careers', labelGu: 'કારકિર્દી', labelHi: 'करियर', href: '/careers' },
      { key: 'advertise', label: 'Advertise', labelGu: 'જાહેરાત', labelHi: 'विज्ञापन', href: '/advertise' },
    ],
    legal: [
      { key: 'privacy', label: 'Privacy Policy', labelGu: 'ગોપનીયતા નીતિ', labelHi: 'गोपनीयता नीति', href: '/privacy' },
      { key: 'terms', label: 'Terms of Use', labelGu: 'ઉપયોગની શરતો', labelHi: 'उपयोग की शर्तें', href: '/terms' },
    ],
  };

  const getLabel = (item: { label: string; labelGu: string; labelHi: string }) => {
    if (language === 'hi') return item.labelHi;
    if (language === 'gu') return item.labelGu;
    return item.label;
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/">
              <h2 className="font-serif text-3xl font-bold text-accent mb-4">કાનમ એક્સપ્રેસ</h2>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-4">
              {language === 'gu'
                ? (siteSettings?.tagline_gu || siteSettings?.tagline_en || 'નિડર અને નિષ્પક્ષ - ગુજરાતનું સૌથી વિશ્વસનીય સાપ્તાહિક સમાચાર પત્ર.')
                : language === 'hi'
                ? (siteSettings?.tagline_hi || siteSettings?.tagline_en || 'निडर और निष्पक्ष - गुजरात का सबसे विश्वसनीय साप्ताहिक समाचार पत्र।')
                : (siteSettings?.tagline_en || "Fearless and Unbiased - Gujarat's most trusted weekly newspaper.")}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: siteSettings?.facebook_url || 'https://facebook.com/kanamexpress' },
                { Icon: Twitter, href: siteSettings?.twitter_url || 'https://twitter.com/kanamexpress' },
                { Icon: Instagram, href: siteSettings?.instagram_url || 'https://instagram.com/kanam_express' },
                { Icon: Youtube, href: siteSettings?.youtube_url || 'https://youtube.com/kanamexpress' },
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-background/10 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">
              {language === 'gu' ? 'વિભાગો' : language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((cat) => (
                <li key={cat.key}>
                  <Link to={cat.href} className="text-background/70 hover:text-accent text-sm transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">
              {language === 'gu' ? 'કંપની' : language === 'hi' ? 'कंपनी' : 'Company'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((item) => (
                <li key={item.key}>
                  <Link to={item.href} className="text-background/70 hover:text-accent text-sm transition-colors">
                    {getLabel(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">
              {language === 'gu' ? 'સંપર્ક' : language === 'hi' ? 'संपर्क' : 'Contact'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{siteSettings?.contact_address || "H.O. Gokul Lalani Khadki, Jawahar Bazaar, Jambusar, District: Bharuch, Gujarat-391150"}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <div className="flex flex-col">
                  {(() => {
                    const p1 = siteSettings?.contact_phone_primary || "+91 98247 49413";
                    const p2 = siteSettings?.contact_phone_secondary || "+91 76230 46498";
                    return (
                      <>
                        <a href={`tel:${p1.replace(/\s+/g, '')}`} className="hover:text-accent transition-colors">
                          {p1}
                        </a>
                        <a href={`tel:${p2.replace(/\s+/g, '')}`} className="hover:text-accent transition-colors">
                          {p2}
                        </a>
                      </>
                    );
                  })()}
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${siteSettings?.contact_email || "kanamexpress@gmail.com"}`} className="hover:text-accent transition-colors">
                  {siteSettings?.contact_email || "kanamexpress@gmail.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/50">
              © 2024 Kanam Express. {language === 'gu' ? 'બધા હક્કો આરક્ષિત.' : language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
            </p>
            <div className="flex gap-4">
              {footerLinks.legal.map((item) => (
                <Link key={item.key} to={item.href} className="text-xs text-background/50 hover:text-accent transition-colors">
                  {getLabel(item)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
