import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Upload, X } from 'lucide-react';
import type { GalleryCategory, GalleryPhoto } from '../types';
import { ResilientImage } from './ResilientImage';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  onOpenAdminGallery: () => void;
}

const GALLERY_FILTERS: Array<'All' | GalleryCategory> = [
  'All',
  'Nature & Waterfalls',
  'Forts & Heritage',
  'Food & Sweets',
  'Art & Festivals',
];

export function GallerySection({
  photos,
  onOpenAdminGallery,
}: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  const activePhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <section
      id="gallery"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E7E3DA]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
            03. Visual Archive
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mt-2 [text-wrap:balance]">
            Belagavi Tourist Photo Gallery
          </h2>
          <p className="text-[#4B5563] text-base mt-3 leading-relaxed">
            Field frames from the Western Ghats, sandstone canyons, heritage kitchens,
            and craft workshops. Click any frame to inspect in full detail.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdminGallery}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1B4332]/25 bg-white text-[#1B4332] hover:bg-[#1B4332] hover:text-[#FAF9F6] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          <span>Upload Custom Photo</span>
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Filter photo gallery by category"
        className="mt-6 flex flex-wrap gap-2"
      >
        {GALLERY_FILTERS.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIndex(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1B4332] text-[#FAF9F6]'
                  : 'bg-[#EFECE4] text-[#374151] hover:bg-[#E7E3DA]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="mt-10 rounded-[14px] border border-[#E7E3DA] bg-white p-10 text-center">
          <p className="font-serif text-lg text-[#1F2937]">
            No photographs in this category yet.
          </p>
          <button
            type="button"
            onClick={onOpenAdminGallery}
            className="mt-4 px-5 py-2.5 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#122E22] transition-colors cursor-pointer"
          >
            Add First Photo
          </button>
        </div>
      ) : (
        <div className="mt-8 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((photo, index) => (
            <figure
              key={photo.id}
              className="break-inside-avoid group rounded-[14px] overflow-hidden bg-white border border-[#E7E3DA] shadow-[0_2px_10px_rgba(27,67,50,0.04)] hover:shadow-[0_12px_28px_rgba(27,67,50,0.10)] transition-shadow duration-200"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4332] block"
              >
                <div
                  className={`relative overflow-hidden bg-[#EFECE4] ${
                    index % 3 === 0 ? 'aspect-[4/3]' : index % 3 === 1 ? 'aspect-[5/4]' : 'aspect-[4/3]'
                  }`}
                >
                  <ResilientImage
                    src={photo.imageUrl}
                    alt={photo.title}
                    fallbackLabel={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-3"
                    aria-hidden="true"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      <Expand className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </div>
                <figcaption className="p-4">
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span className="font-semibold text-[#1B4332]">
                      {photo.category}
                    </span>
                    {photo.isCustom && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#B45309] font-medium">
                          Field Upload
                        </span>
                      </>
                    )}
                  </div>
                  <p className="font-serif text-base font-bold text-[#1F2937] mt-1">
                    {photo.title}
                  </p>
                  <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">
                    {photo.caption}
                  </p>
                </figcaption>
              </button>
            </figure>
          ))}
        </div>
      )}

      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#FAF9F6] rounded-[14px] overflow-hidden shadow-2xl border border-[#E7E3DA]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7E3DA] bg-white">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#1B4332]">
                  {activePhoto.category}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#1F2937] truncate">
                  {activePhoto.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close lightbox"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-lg text-[#4B5563] hover:bg-[#EFECE4] hover:text-[#1F2937] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-[#111827] flex items-center justify-center max-h-[70vh] overflow-hidden">
              <ResilientImage
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                fallbackLabel={activePhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photograph"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredPhotos.length) %
                          filteredPhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photograph"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="px-5 py-3.5 bg-white border-t border-[#E7E3DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#4B5563]">
              <p>{activePhoto.caption}</p>
              <span className="font-mono text-xs text-[#6B7280] tabular-nums shrink-0">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
