import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, MapPin, Clock, Globe, Type } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const cities = [
  { id: 'ahmedabad', name: 'અમદાવાદ', nameEn: 'Ahmedabad' },
  { id: 'surat', name: 'સુરત', nameEn: 'Surat' },
  { id: 'vadodara', name: 'વડોદરા', nameEn: 'Vadodara' },
  { id: 'rajkot', name: 'રાજકોટ', nameEn: 'Rajkot' },
];

export function TopBar() {
  const { language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedCity, setSelectedCity] = useState('ahmedabad');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    const locale = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    return currentTime.toLocaleDateString(locale, options);
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFontSize = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    document.documentElement.style.fontSize = size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px';
  };

  return (
    <div className="bg-secondary border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10 text-sm">
          {/* Left: Date & Time */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{formatTime()}</span>
            </div>
            <span className="hidden sm:inline text-xs">{formatDate()}</span>
          </div>

          {/* Center: City & Weather */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-7 w-auto border-none bg-transparent text-xs font-medium p-0 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id} className="text-xs">
                      {language === 'en' ? city.nameEn : city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sun className="w-4 h-4 text-accent" />
              <span className="font-medium">32°C</span>
            </div>
          </div>

          {/* Right: Language & Font Controls */}
          <div className="flex items-center gap-3">
            {/* Font Size Controls */}
            <div className="hidden sm:flex items-center gap-1 border-r border-border pr-3">
              <Type className="w-3.5 h-3.5 text-muted-foreground" />
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSize(size)}
                  className={`px-1.5 text-xs font-medium transition-colors ${
                    fontSize === size
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {size === 'sm' ? 'A-' : size === 'lg' ? 'A+' : 'A'}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={language} onValueChange={(v) => setLanguage(v as 'gu' | 'hi' | 'en')}>
                <SelectTrigger className="h-7 w-auto border-none bg-transparent text-xs font-medium p-0 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gu" className="text-xs">ગુજરાતી</SelectItem>
                  <SelectItem value="hi" className="text-xs">हिंदी</SelectItem>
                  <SelectItem value="en" className="text-xs">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
