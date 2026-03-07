import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'gu' | 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  gu: {
    'home': 'હોમ',
    'gujarat': 'ગુજરાત',
    'national': 'રાષ્ટ્રીય',
    'international': 'આંતરરાષ્ટ્રીય',
    'business': 'બિઝનેસ',
    'sports': 'રમતગમત',
    'entertainment': 'મનોરંજન',
    'technology': 'ટેકનોલોજી',
    'education': 'શિક્ષણ',
    'health': 'સ્વાસ્થ્ય',
    'lifestyle': 'જીવનશૈલી',
    'videos': 'વિડિયો',
    'reels': 'રીલ્સ',
    'live_tv': 'લાઇવ ટીવી',
    'breaking_news': 'બ્રેકિંગ ન્યૂઝ',
    'latest_news': 'તાજા સમાચાર',
    'trending': 'ટ્રેન્ડિંગ',
    'editors_pick': 'એડિટર્સ પિક',
    'most_read': 'સૌથી વધુ વંચાયેલ',
    'search': 'શોધો',
    'read_more': 'વધુ વાંચો',
    'watch_now': 'હવે જુઓ',
    'share': 'શેર કરો',
    'save': 'સેવ કરો',
    'tagline': 'વિશ્વાસનું પ્રતીક',
    'loading': 'લોડ થઈ રહ્યું છે...',
    'no_trending_topics': 'હમણાં કોઈ ટ્રેન્ડિંગ વિષયો નથી.',
    'no_news_available': 'હમણાં કોઈ સમાચાર ઉપલબ્ધ નથી.',
  },
  hi: {
    'home': 'होम',
    'gujarat': 'गुजरात',
    'national': 'राष्ट्रीय',
    'international': 'अंतर्राष्ट्रीय',
    'business': 'बिज़नेस',
    'sports': 'खेल',
    'entertainment': 'मनोरंजन',
    'technology': 'टेक्नोलॉजी',
    'education': 'शिक्षा',
    'health': 'स्वास्थ्य',
    'lifestyle': 'लाइफस्टाइल',
    'videos': 'वीडियो',
    'reels': 'रील्स',
    'live_tv': 'लाइव टीवी',
    'breaking_news': 'ब्रेकिंग न्यूज़',
    'latest_news': 'ताज़ा खबरें',
    'trending': 'ट्रेंडिंग',
    'editors_pick': 'एडिटर्स पिक',
    'most_read': 'सबसे ज़्यादा पढ़ी गई',
    'search': 'खोजें',
    'read_more': 'और पढ़ें',
    'watch_now': 'अभी देखें',
    'share': 'शेयर करें',
    'save': 'सेव करें',
    'tagline': 'विश्वास का प्रतीक',
    'loading': 'लोड हो रहा है...',
    'no_trending_topics': 'अभी कोई ट्रेंडिंग विषय नहीं हैं।',
    'no_news_available': 'अभी कोई समाचार उपलब्ध नहीं है।',
  },
  en: {
    'home': 'Home',
    'gujarat': 'Gujarat',
    'national': 'National',
    'international': 'International',
    'business': 'Business',
    'sports': 'Sports',
    'entertainment': 'Entertainment',
    'technology': 'Technology',
    'education': 'Education',
    'health': 'Health',
    'lifestyle': 'Lifestyle',
    'videos': 'Videos',
    'reels': 'Reels',
    'live_tv': 'LIVE TV',
    'breaking_news': 'Breaking News',
    'latest_news': 'Latest News',
    'trending': 'Trending',
    'editors_pick': "Editor's Pick",
    'most_read': 'Most Read',
    'search': 'Search',
    'read_more': 'Read More',
    'watch_now': 'Watch Now',
    'share': 'Share',
    'save': 'Save',
    'tagline': 'Symbol of Trust',
    'loading': 'Loading...',
    'no_trending_topics': 'No trending topics right now.',
    'no_news_available': 'No news available right now.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('gu');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
