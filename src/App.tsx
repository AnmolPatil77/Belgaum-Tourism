import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { CultureShowcaseSection } from './components/CultureShowcaseSection';
import { DestinationsSection } from './components/DestinationsSection';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { TripPlannerSection } from './components/TripPlannerSection';
import type {
  BelagaviContentPayload,
  GalleryCategory,
  GalleryPhoto,
  TripRequest,
  TripStatus,
} from './types';

export default function App() {
  const [content, setContent] = useState<BelagaviContentPayload | null>(null);
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'explore' | 'admin'>('explore');
  const [adminInitialTab, setAdminInitialTab] = useState<'trips' | 'gallery'>(
    'trips'
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([
    'Gokak Falls',
    'Belagavi Fort & Kamal Basti',
  ]);

  const fetchContent = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/content');
      if (!res.ok) {
        throw new Error('Unable to load Belagavi destination catalog.');
      }
      const data = (await res.json()) as BelagaviContentPayload;
      setContent(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Unable to connect to the server.'
      );
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = (await res.json()) as { trips: TripRequest[] };
        setTrips(data.trips || []);
      }
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    void fetchContent();
    void fetchTrips();
  }, [fetchContent, fetchTrips]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleDestination = (name: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleUpdateTripStatus = async (id: string, status: TripStatus) => {
    const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = (await res.json()) as { trip: TripRequest };
      setTrips((prev) => prev.map((t) => (t.id === id ? data.trip : t)));
    }
  };

  const handleDeleteTrip = async (id: string) => {
    const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddGalleryPhoto = async (payload: {
    title: string;
    category: GalleryCategory;
    caption: string;
    imageUrl: string;
  }) => {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { photo?: GalleryPhoto; error?: string };
    if (!res.ok || !data.photo) {
      throw new Error(data.error || 'Failed to upload gallery photo.');
    }
    setContent((prev) =>
      prev ? { ...prev, gallery: [data.photo!, ...prev.gallery] } : prev
    );
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    const res = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setContent((prev) =>
        prev
          ? { ...prev, gallery: prev.gallery.filter((p) => p.id !== id) }
          : prev
      );
    }
  };

  const openAdmin = (tab: 'trips' | 'gallery' = 'trips') => {
    setAdminInitialTab(tab);
    setActiveView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1F2937]">
      <Navbar
        activeView={activeView}
        onToggleView={(view) => {
          if (view === 'admin') {
            setAdminInitialTab('trips');
          }
          setActiveView(view);
        }}
        onNavigateSection={scrollToSection}
      />

      {loadingContent ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-80 rounded-[14px] bg-[#E7E3DA]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-72 rounded-[14px] bg-[#EFECE4]" />
              <div className="h-72 rounded-[14px] bg-[#EFECE4]" />
              <div className="h-72 rounded-[14px] bg-[#EFECE4]" />
            </div>
          </div>
        </main>
      ) : loadError || !content ? (
        <main className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#1F2937]">
            Unable to Load Belagavi Guide
          </h1>
          <p className="text-sm text-[#4B5563] mt-3">
            {loadError || 'Content could not be retrieved.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoadingContent(true);
              void fetchContent();
            }}
            className="mt-6 px-5 py-2.5 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#122E22] cursor-pointer"
          >
            Retry
          </button>
        </main>
      ) : activeView === 'admin' ? (
        <AdminDashboard
          key={adminInitialTab}
          initialTab={adminInitialTab}
          trips={trips}
          gallery={content.gallery}
          loadingTrips={loadingTrips}
          onUpdateTripStatus={handleUpdateTripStatus}
          onDeleteTrip={handleDeleteTrip}
          onAddGalleryPhoto={handleAddGalleryPhoto}
          onDeleteGalleryPhoto={handleDeleteGalleryPhoto}
        />
      ) : (
        <main className="flex-1">
          <HeroSection
            heroImageUrl={content.heroImageUrl}
            onExplore={() => scrollToSection('destinations')}
            onPlanTrip={() => scrollToSection('plan-trip')}
          />

          <DestinationsSection
            destinations={content.destinations}
            selectedDestinations={selectedDestinations}
            onToggleDestination={handleToggleDestination}
          />

          <CultureShowcaseSection
            food={content.food}
            art={content.art}
            culture={content.culture}
          />

          <GallerySection
            photos={content.gallery}
            onOpenAdminGallery={() => openAdmin('gallery')}
          />

          <TripPlannerSection
            destinations={content.destinations}
            selectedDestinations={selectedDestinations}
            onToggleDestination={handleToggleDestination}
            onClearDestinations={() => setSelectedDestinations([])}
            onTripCreated={(trip) => {
              setTrips((prev) => [trip, ...prev]);
            }}
            onGoToAdmin={() => openAdmin('trips')}
          />
        </main>
      )}

      <Footer
        onNavigateSection={(sectionId) => {
          if (activeView !== 'explore') {
            setActiveView('explore');
            setTimeout(() => scrollToSection(sectionId), 60);
          } else {
            scrollToSection(sectionId);
          }
        }}
        onOpenAdmin={() => openAdmin('trips')}
      />
    </div>
  );
}
