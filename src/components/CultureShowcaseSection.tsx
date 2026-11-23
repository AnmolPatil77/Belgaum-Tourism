import { useState } from 'react';
import type { CultureShowcaseItem } from '../types';
import { ResilientImage } from './ResilientImage';

interface CultureShowcaseSectionProps {
  food: CultureShowcaseItem[];
  art: CultureShowcaseItem[];
  culture: CultureShowcaseItem[];
}

type ShowcaseTab = 'food' | 'art' | 'culture';

const TABS: Array<{ id: ShowcaseTab; label: string; subtitle: string }> = [
  {
    id: 'food',
    label: 'Local Food & Culinary Heritage',
    subtitle:
      'Slow-caramelized dairy confections, nutrient-rich Karadant, and hearty North Karnataka sorghum thalis.',
  },
  {
    id: 'art',
    label: 'Traditional Art & Handicrafts',
    subtitle:
      'Lacquered Gokak woodwork, Khanapur terracotta pottery, Shahapur looms, and Ratta stone sculpture.',
  },
  {
    id: 'culture',
    label: 'Cultural Activities & Festivals',
    subtitle:
      'Living celebrations uniting Kannada and Marathi traditions across royal forts, skies, and village jatras.',
  },
];

export function CultureShowcaseSection({
  food,
  art,
  culture,
}: CultureShowcaseSectionProps) {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('food');

  const itemsByTab: Record<ShowcaseTab, CultureShowcaseItem[]> = {
    food,
    art,
    culture,
  };

  const currentTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const currentItems = itemsByTab[activeTab];

  return (
    <section
      id="food-culture"
      className="bg-[#F3EFE6]/75 border-y border-[#E7E3DA] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
            02. Gastronomy, Craft &amp; Tradition
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mt-2 [text-wrap:balance]">
            Flavors, Artisans &amp; Living Heritage
          </h2>
          <p className="text-[#4B5563] text-base mt-3 leading-relaxed">
            {currentTabMeta.subtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Belagavi food, art, and cultural showcase"
          className="mt-8 flex flex-wrap gap-2 border-b border-[#DED9CD] pb-4"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1B4332] text-[#FAF9F6] shadow-sm'
                    : 'bg-white/70 text-[#374151] border border-[#E7E3DA] hover:bg-white hover:text-[#1B4332]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <article
              key={item.id}
              className="group rounded-[14px] overflow-hidden bg-white border border-[#E7E3DA] shadow-[0_2px_10px_rgba(27,67,50,0.04)] hover:shadow-[0_12px_26px_rgba(27,67,50,0.09)] transition-shadow duration-200 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EFECE4]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fallbackLabel={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#6B7280]">
                  <span className="text-[#B45309] font-semibold">
                    {item.metaPrimary}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.metaSecondary}</span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1F2937] mt-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-[#4B5563] leading-relaxed mt-2 flex-1">
                  {item.description}
                </p>

                <p className="text-xs text-[#6B7280] mt-4 pt-3 border-t border-[#F3EFE6]">
                  Origin: <span className="font-medium text-[#1F2937]">{item.origin}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
