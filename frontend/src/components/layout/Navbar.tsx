import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSections, useDistricts } from '@/hooks/useNewsApi';
import { cn } from '@/lib/utils';

// Fallback Gujarat districts submenu (ગુજરાતના તમામ જિલ્લાઓ) – used only if API fails
const fallbackGujaratSubmenu = [
  { key: 'ahmedabad', label: 'અમદાવાદ', labelEn: 'Ahmedabad', labelHi: 'अहमदाबाद', href: '/gujarat/ahmedabad' },
  { key: 'amreli', label: 'અમરેલી', labelEn: 'Amreli', labelHi: 'अमरेली', href: '/gujarat/amreli' },
  { key: 'anand', label: 'આણંદ', labelEn: 'Anand', labelHi: 'आनंद', href: '/gujarat/anand' },
  { key: 'aravalli', label: 'અરવલ્લી', labelEn: 'Aravalli', labelHi: 'अरावली', href: '/gujarat/aravalli' },
  { key: 'banaskantha', label: 'બનાસકાંઠા', labelEn: 'Banaskantha', labelHi: 'बनासकांठा', href: '/gujarat/banaskantha' },
  { key: 'bharuch', label: 'ભરૂચ', labelEn: 'Bharuch', labelHi: 'भरूच', href: '/gujarat/bharuch' },
  { key: 'bhavnagar', label: 'ભાવનગર', labelEn: 'Bhavnagar', labelHi: 'भावनगर', href: '/gujarat/bhavnagar' },
  { key: 'botad', label: 'બોટાદ', labelEn: 'Botad', labelHi: 'बोटाद', href: '/gujarat/botad' },
  { key: 'chhota-udepur', label: 'છોટાઉદેપુર', labelEn: 'Chhota Udepur', labelHi: 'छोटा उदयपुर', href: '/gujarat/chhota-udepur' },
  { key: 'dahod', label: 'દાહોદ', labelEn: 'Dahod', labelHi: 'दाहोद', href: '/gujarat/dahod' },
  { key: 'dang', label: 'ડાંગ', labelEn: 'Dang', labelHi: 'डांग', href: '/gujarat/dang' },
  { key: 'devbhoomi-dwarka', label: 'દેવભૂમિ દ્વારકા', labelEn: 'Devbhumi Dwarka', labelHi: 'देवभूमि द्वारका', href: '/gujarat/devbhoomi-dwarka' },
  { key: 'gandhinagar', label: 'ગાંધીનગર', labelEn: 'Gandhinagar', labelHi: 'गांधीनगर', href: '/gujarat/gandhinagar' },
  { key: 'gir-somnath', label: 'ગીર સોમનાથ', labelEn: 'Gir Somnath', labelHi: 'गिर सोमनाथ', href: '/gujarat/gir-somnath' },
  { key: 'jamnagar', label: 'જામનગર', labelEn: 'Jamnagar', labelHi: 'जामनगर', href: '/gujarat/jamnagar' },
  { key: 'junagadh', label: 'જુનાગઢ', labelEn: 'Junagadh', labelHi: 'जूनागढ़', href: '/gujarat/junagadh' },
  { key: 'kutch', label: 'કચ્છ', labelEn: 'Kutch', labelHi: 'कच्छ', href: '/gujarat/kutch' },
  { key: 'kheda', label: 'ખેડા', labelEn: 'Kheda', labelHi: 'खेड़ा', href: '/gujarat/kheda' },
  { key: 'mahisagar', label: 'મહીસાગર', labelEn: 'Mahisagar', labelHi: 'महीसागर', href: '/gujarat/mahisagar' },
  { key: 'mehsana', label: 'મહેસાણા', labelEn: 'Mehsana', labelHi: 'मेहसाणा', href: '/gujarat/mehsana' },
  { key: 'morbi', label: 'મોરબી', labelEn: 'Morbi', labelHi: 'मोरबी', href: '/gujarat/morbi' },
  { key: 'narmada', label: 'નર્મદા', labelEn: 'Narmada', labelHi: 'नर्मदा', href: '/gujarat/narmada' },
  { key: 'navsari', label: 'નવસારી', labelEn: 'Navsari', labelHi: 'नवसारी', href: '/gujarat/navsari' },
  { key: 'panchmahal', label: 'પંચમહાલ', labelEn: 'Panchmahal', labelHi: 'पंचमहल', href: '/gujarat/panchmahal' },
  { key: 'patan', label: 'પાટણ', labelEn: 'Patan', labelHi: 'पाटन', href: '/gujarat/patan' },
  { key: 'porbandar', label: 'પોરબંદર', labelEn: 'Porbandar', labelHi: 'पोरबंदर', href: '/gujarat/porbandar' },
  { key: 'rajkot', label: 'રાજકોટ', labelEn: 'Rajkot', labelHi: 'राजकोट', href: '/gujarat/rajkot' },
  { key: 'sabarkantha', label: 'સાબરકાંઠા', labelEn: 'Sabarkantha', labelHi: 'साबरकांठा', href: '/gujarat/sabarkantha' },
  { key: 'surat', label: 'સુરત', labelEn: 'Surat', labelHi: 'सूरत', href: '/gujarat/surat' },
  { key: 'surendranagar', label: 'સુરેન્દ્રનગર', labelEn: 'Surendranagar', labelHi: 'सुरेंद्रनगर', href: '/gujarat/surendranagar' },
  { key: 'tapi', label: 'તાપી', labelEn: 'Tapi', labelHi: 'ताप्ती', href: '/gujarat/tapi' },
  { key: 'vadodara', label: 'વડોદરા', labelEn: 'Vadodara', labelHi: 'वडोदरा', href: '/gujarat/vadodara' },
  { key: 'valsad', label: 'વલસાડ', labelEn: 'Valsad', labelHi: 'वलसाड', href: '/gujarat/valsad' },
  { key: 'vav-tharad', label: 'વાવ- થરાદ', labelEn: 'Vav-Tharad', labelHi: 'वाव-थराद', href: '/gujarat/vav-tharad' },
];

const staticTail = [
  { key: 'videos', href: '/videos', hasSubmenu: false },
  { key: 'reels', href: '/reels', hasSubmenu: false },
];

export function Navbar() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { data: sections = [] } = useSections();

  const gujaratSection = sections.find((s) => s.slug === 'gujarat');
  const { data: gujaratDistricts = [] } = useDistricts(gujaratSection?.id);

  const gujaratSubmenu = useMemo(() => {
    if (gujaratDistricts.length > 0) {
      return gujaratDistricts
        .filter((d) => d.is_active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((d) => ({
          key: d.slug,
          label: d.name_gu || d.name_en,
          labelEn: d.name_en,
          labelHi: d.name_hi || d.name_en,
          href: `/gujarat/${d.slug}`,
        }));
    }
    return fallbackGujaratSubmenu;
  }, [gujaratDistricts]);

  const navItems = useMemo(() => {
    const fromApi = sections
      .filter((s) => s.slug && s.is_active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => ({
        key: s.slug,
        href: `/${s.slug}`,
        hasSubmenu: s.slug === 'gujarat',
        submenu: s.slug === 'gujarat' ? gujaratSubmenu : undefined,
        labelEn: s.name_en,
        labelGu: s.name_gu || s.name_en,
        labelHi: s.name_hi || s.name_en,
      }));
    if (fromApi.length === 0) {
      return [
        { key: 'home', href: '/', hasSubmenu: false },
        { key: 'gujarat', href: '/gujarat', hasSubmenu: true, submenu: gujaratSubmenu },
        { key: 'national', href: '/national', hasSubmenu: false },
        { key: 'international', href: '/international', hasSubmenu: false },
        { key: 'business', href: '/business', hasSubmenu: false },
        { key: 'sports', href: '/sports', hasSubmenu: false },
        { key: 'entertainment', href: '/entertainment', hasSubmenu: false },
        { key: 'technology', href: '/technology', hasSubmenu: false },
        ...staticTail,
      ];
    }
    return [
      { key: 'home', href: '/', hasSubmenu: false },
      ...fromApi,
      ...staticTail,
    ];
  }, [sections, gujaratSubmenu]);

  const getSubmenuLabel = (item: { label: string; labelEn: string; labelHi: string }) => {
    if (language === 'en') return item.labelEn;
    if (language === 'hi') return item.labelHi;
    return item.label;
  };

  const getNavLabel = (item: { key: string; labelEn?: string; labelGu?: string; labelHi?: string }) => {
    if (item.labelEn != null || item.labelGu != null) {
      if (language === 'en') return item.labelEn ?? item.labelGu ?? t(item.key);
      if (language === 'hi') return item.labelHi ?? item.labelEn ?? t(item.key);
      return item.labelGu ?? item.labelEn ?? t(item.key);
    }
    return t(item.key);
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-nav sticky top-0 z-50 shadow-nav">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center">
          {navItems.map((item) => (
            <div
              key={item.key}
              className="relative group"
              onMouseEnter={() => item.hasSubmenu && setActiveMenu(item.key)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.href}
                className={cn(
                  "nav-link flex items-center gap-1",
                  isActive(item.href) && "nav-link-active"
                )}
              >
                {getNavLabel(item)}
                {item.hasSubmenu && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>

              {/* Mega Menu */}
              {item.hasSubmenu && activeMenu === item.key && item.submenu && (
                <div className="absolute left-0 top-full bg-card shadow-elevated rounded-b-lg min-w-[220px] py-2 animate-fade-in max-h-[70vh] overflow-y-auto scrollbar-thin">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.key}
                      to={subItem.href}
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors"
                    >
                      {getSubmenuLabel(subItem)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 py-2 min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-nav-hover"
                )}
              >
                {getNavLabel(item)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
