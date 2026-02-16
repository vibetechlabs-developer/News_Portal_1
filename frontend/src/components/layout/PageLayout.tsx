import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { BreakingTicker } from './BreakingTicker';
import { Navbar } from './Navbar';
import { AdsSection } from './AdsSection';
import { GoogleAdSlot } from './GoogleAdSlot';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  showTicker?: boolean;
  showAds?: boolean;
}

export function PageLayout({ children, showTicker = true, showAds = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      {showTicker && <BreakingTicker />}
      <Navbar />
      <main>{children}</main>
      {showAds && (
        <div className="container mx-auto px-4 py-6 border-t border-border space-y-4">
          {/* First try to render any configured AdSense footer slots */}
          <GoogleAdSlot placement="FOOTER" />
          {/* Then fall back to internal image/HTML ads */}
          <AdsSection placement="FOOTER" />
        </div>
      )}
      <Footer />
    </div>
  );
}
