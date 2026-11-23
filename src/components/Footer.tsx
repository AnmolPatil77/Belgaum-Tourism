interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export function Footer({ onNavigateSection, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#122E22] text-[#E5E7EB] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/15">
          <div className="max-w-md">
            <p className="font-serif text-2xl font-bold text-white">
              Discover Belagavi
            </p>
            <p className="text-sm text-[#D1D5DB] mt-2 leading-relaxed">
              An editorial travel guide and trip planner celebrating Belagavi’s Western
              Ghats waterfalls, Ratta dynasty forts, artisan guilds, and culinary heritage.
            </p>
          </div>

          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-6 text-sm text-[#D1D5DB]"
          >
            <button
              type="button"
              onClick={() => onNavigateSection('destinations')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Destinations
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('food-culture')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Food &amp; Culture
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('gallery')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Photo Gallery
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('plan-trip')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Plan Your Trip
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[#FDE68A] hover:text-white transition-colors cursor-pointer font-medium"
            >
              Admin Dashboard
            </button>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <p>Belagavi (Belgaum), Karnataka · Western Ghats Heritage &amp; Travel Portal</p>
          <p>© {new Date().getFullYear()} Discover Belagavi</p>
        </div>
      </div>
    </footer>
  );
}
