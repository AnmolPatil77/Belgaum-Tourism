import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeView: 'explore' | 'admin';
  onToggleView: (view: 'explore' | 'admin') => void;
  onNavigateSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'destinations', label: 'Destinations' },
  { id: 'food-culture', label: 'Food & Culture' },
  { id: 'gallery', label: 'Photo Gallery' },
  { id: 'plan-trip', label: 'Plan Your Trip' },
];

export function Navbar({
  activeView,
  onToggleView,
  onNavigateSection,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'explore') {
      onToggleView('explore');
      setTimeout(() => {
        onNavigateSection(sectionId);
      }, 60);
      return;
    }
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E7E3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onToggleView('explore');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1B4332] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] rounded"
        >
          Belagavi
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#374151]"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              className="whitespace-nowrap shrink-0 hover:text-[#1B4332] underline-offset-4 hover:underline transition-colors cursor-pointer py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] rounded"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onToggleView(activeView === 'admin' ? 'explore' : 'admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332] ${
              activeView === 'admin'
                ? 'bg-[#1B4332] text-[#FAF9F6] hover:bg-[#122E22]'
                : 'bg-[#1B4332]/10 text-[#1B4332] hover:bg-[#1B4332] hover:text-[#FAF9F6]'
            }`}
          >
            {activeView === 'admin' ? 'Back to Guide' : 'Admin Dashboard'}
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-[#1F2937] hover:bg-[#E7E3DA]/50 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E3DA] bg-[#FAF9F6] px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className="text-left px-3 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-[#E7E3DA]/50 rounded-lg cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
