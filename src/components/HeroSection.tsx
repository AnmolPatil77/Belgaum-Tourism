import { ArrowRight, Compass } from 'lucide-react';
import { HeroWeatherWidget } from './HeroWeatherWidget';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  heroImageUrl: string;
  onExplore: () => void;
  onPlanTrip: () => void;
}

export function HeroSection({
  heroImageUrl,
  onExplore,
  onPlanTrip,
}: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#122E22] text-[#FAF9F6]"
    >
      <div className="absolute inset-0">
        <ResilientImage
          src={heroImageUrl}
          alt="Gokak Falls and sandstone canyon cliffs in Belagavi, Karnataka"
          className="w-full h-full object-cover object-center"
          fallbackLabel="Gokak Falls, Belagavi"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0D2118]/92 via-[#122E22]/60 to-[#122E22]/35"
          aria-hidden="true"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#FDE68A] mb-4">
              Belagavi District · Western Ghats · Karnataka
            </p>

            <h1 className="font-serif text-[clamp(2.25rem,4.2vw,3.75rem)] font-bold leading-[1.1] tracking-tight text-white [text-wrap:balance]">
              Discover Belagavi: Land of Waterfalls, Forts &amp; Timeless Culture
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#E5E7EB] leading-relaxed max-w-2xl">
              Explore the cultural crossroads of Karnataka, Maharashtra, and Goa—from
              12th-century Ratta dynasty forts to iconic Kunda and Gokak Falls.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A]"
              >
                <span>Explore Belagavi</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onPlanTrip}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/35 backdrop-blur-sm font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Plan Your Trip</span>
              </button>
            </div>
          </div>

          <HeroWeatherWidget />
        </div>

        <div className="mt-14 pt-6 border-t border-white/20 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-[#FDE68A] font-serif text-xl font-semibold tabular-nums">
              170 ft
            </p>
            <p className="text-[#D1D5DB] mt-0.5">
              Gokak Falls Sandstone Plunge
            </p>
          </div>
          <div>
            <p className="text-[#FDE68A] font-serif text-xl font-semibold tabular-nums">
              12th Century
            </p>
            <p className="text-[#D1D5DB] mt-0.5">
              Ratta Dynasty Stone Heritage
            </p>
          </div>
          <div>
            <p className="text-[#FDE68A] font-serif text-xl font-semibold">
              Tri-State Hub
            </p>
            <p className="text-[#D1D5DB] mt-0.5">
              Karnataka · Maharashtra · Goa
            </p>
          </div>
          <div>
            <p className="text-[#FDE68A] font-serif text-xl font-semibold">
              Sahyadri Trails
            </p>
            <p className="text-[#D1D5DB] mt-0.5">
              Monsoon Mist &amp; Biodiversity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
