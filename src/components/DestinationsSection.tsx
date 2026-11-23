import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import type { DestinationCategory, DestinationItem } from '../types';
import { ResilientImage } from './ResilientImage';

interface DestinationsSectionProps {
  destinations: DestinationItem[];
  selectedDestinations: string[];
  onToggleDestination: (destinationName: string) => void;
}

const FILTER_TABS: Array<'All' | DestinationCategory> = [
  'All',
  'Forts & Heritage',
  'Waterfalls & Nature',
  'Spiritual & Landmarks',
];

export function DestinationsSection({
  destinations,
  selectedDestinations,
  onToggleDestination,
}: DestinationsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | DestinationCategory>('All');

  const filtered =
    activeFilter === 'All'
      ? destinations
      : destinations.filter(
          (item) =>
            item.category === activeFilter || item.tags.includes(activeFilter)
        );

  return (
    <section
      id="destinations"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E7E3DA]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
            01. Curated Landmarks
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mt-2 [text-wrap:balance]">
            Belagavi Tourist Destinations
          </h2>
          <p className="text-[#4B5563] text-base mt-3 leading-relaxed">
            From thundering monsoon cataracts in the Sahyadri foothills to historic
            citadels of Kittur and Yellur, add stops directly to your custom itinerary.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter Belagavi destinations"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EFECE4] rounded-xl self-start lg:self-auto"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1B4332] text-[#FAF9F6] shadow-sm'
                    : 'text-[#374151] hover:text-[#1B4332] hover:bg-white/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((dest) => {
          const isSelected = selectedDestinations.includes(dest.name);
          return (
            <article
              key={dest.id}
              className="group rounded-[14px] overflow-hidden bg-white border border-[#E7E3DA] shadow-[0_2px_12px_rgba(27,67,50,0.04)] hover:shadow-[0_14px_30px_rgba(27,67,50,0.10)] transition-shadow duration-200 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EFECE4]">
                <ResilientImage
                  src={dest.imageUrl}
                  alt={dest.imageAlt}
                  fallbackLabel={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#6B7280]">
                  <span className="text-[#1B4332] font-semibold">
                    {dest.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{dest.distanceFromCity}</span>
                  <span aria-hidden="true">·</span>
                  <span>Best: {dest.bestSeason}</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#1F2937] mt-2 leading-snug">
                  {dest.name}
                </h3>

                <p className="text-sm text-[#4B5563] leading-relaxed mt-2.5 flex-1">
                  {dest.description}
                </p>

                <p className="text-xs text-[#6B7280] mt-4 pt-3 border-t border-[#F3EFE6]">
                  <span className="font-semibold text-[#1F2937]">Highlight:</span>{' '}
                  {dest.highlights}
                </p>

                <button
                  type="button"
                  onClick={() => onToggleDestination(dest.name)}
                  className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                    isSelected
                      ? 'bg-[#D97706] text-white hover:bg-[#B45309]'
                      : 'bg-[#1B4332] text-[#FAF9F6] hover:bg-[#122E22]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Added to Trip</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Add to Trip</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
