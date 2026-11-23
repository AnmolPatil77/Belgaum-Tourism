import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Search, Trash2, Upload } from 'lucide-react';
import type {
  GalleryCategory,
  GalleryPhoto,
  TripRequest,
  TripStatus,
} from '../types';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  initialTab?: 'trips' | 'gallery';
  trips: TripRequest[];
  gallery: GalleryPhoto[];
  loadingTrips: boolean;
  onUpdateTripStatus: (id: string, status: TripStatus) => Promise<void>;
  onDeleteTrip: (id: string) => Promise<void>;
  onAddGalleryPhoto: (payload: {
    title: string;
    category: GalleryCategory;
    caption: string;
    imageUrl: string;
  }) => Promise<void>;
  onDeleteGalleryPhoto: (id: string) => Promise<void>;
}

const STATUS_OPTIONS: TripStatus[] = ['Pending', 'Confirmed', 'Completed'];
const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Nature & Waterfalls',
  'Forts & Heritage',
  'Food & Sweets',
  'Art & Festivals',
];

const STATUS_BADGE_STYLES: Record<TripStatus, string> = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Completed: 'bg-stone-100 text-stone-700 border-stone-200',
};

export function AdminDashboard({
  initialTab = 'trips',
  trips,
  gallery,
  loadingTrips,
  onUpdateTripStatus,
  onDeleteTrip,
  onAddGalleryPhoto,
  onDeleteGalleryPhoto,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'trips' | 'gallery'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<'All' | TripStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);

  // Gallery Upload Form State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] =
    useState<GalleryCategory>('Nature & Waterfalls');
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);

  const pendingCount = trips.filter((t) => t.status === 'Pending').length;
  const confirmedCount = trips.filter((t) => t.status === 'Confirmed').length;

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus =
      statusFilter === 'All' || trip.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      trip.fullName.toLowerCase().includes(q) ||
      trip.bookingId.toLowerCase().includes(q) ||
      trip.email.toLowerCase().includes(q) ||
      trip.selectedDestinations.some((d) => d.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Please choose a PNG, JPEG, WebP, or GIF image.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setPhotoError('Image file must be 4MB or smaller.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhotoError(null);
    setPhotoSuccess(null);

    const resolvedUrl =
      uploadMode === 'file' ? fileDataUrl : photoUrlInput.trim();
    if (!resolvedUrl) {
      setPhotoError(
        uploadMode === 'file'
          ? 'Please upload an image file first.'
          : 'Please enter an image URL.'
      );
      return;
    }

    setPhotoSubmitting(true);
    try {
      await onAddGalleryPhoto({
        title: photoTitle.trim(),
        category: photoCategory,
        caption: photoCaption.trim(),
        imageUrl: resolvedUrl,
      });
      setPhotoTitle('');
      setPhotoCaption('');
      setPhotoUrlInput('');
      setFileDataUrl('');
      setFileName('');
      setPhotoSuccess('Photo added to the Belagavi gallery.');
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Unable to save photo.'
      );
    } finally {
      setPhotoSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E7E3DA]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
            Belagavi Tourism Desk
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mt-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#4B5563] mt-1.5">
            Manage incoming visitor trip itineraries and curate custom survey photography.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Admin management sections"
          className="flex items-center gap-1.5 p-1.5 bg-[#EFECE4] rounded-xl self-start md:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'trips'}
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-[#1B4332] text-[#FAF9F6] shadow-sm'
                : 'text-[#374151] hover:text-[#1B4332]'
            }`}
          >
            Trip Requests ({trips.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gallery'}
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#1B4332] text-[#FAF9F6] shadow-sm'
                : 'text-[#374151] hover:text-[#1B4332]'
            }`}
          >
            Photo Manager ({gallery.length})
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[14px] border border-[#E7E3DA] px-5 py-4">
          <p className="text-xs font-medium text-[#6B7280]">Total Trip Requests</p>
          <p className="font-serif text-2xl font-bold text-[#1F2937] mt-1 tabular-nums">
            {trips.length}
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E7E3DA] px-5 py-4">
          <p className="text-xs font-medium text-[#6B7280]">Pending Review</p>
          <p className="font-serif text-2xl font-bold text-[#D97706] mt-1 tabular-nums">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E7E3DA] px-5 py-4">
          <p className="text-xs font-medium text-[#6B7280]">Confirmed Itineraries</p>
          <p className="font-serif text-2xl font-bold text-[#1B4332] mt-1 tabular-nums">
            {confirmedCount}
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E7E3DA] px-5 py-4">
          <p className="text-xs font-medium text-[#6B7280]">Gallery Archive Photos</p>
          <p className="font-serif text-2xl font-bold text-[#1F2937] mt-1 tabular-nums">
            {gallery.length}
          </p>
        </div>
      </div>

      {activeTab === 'trips' ? (
        <section className="mt-8 bg-white rounded-[14px] border border-[#E7E3DA] overflow-hidden">
          <div className="p-5 border-b border-[#E7E3DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', ...STATUS_OPTIONS] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-[#FAF9F6] text-[#4B5563] border border-[#E7E3DA] hover:bg-[#EFECE4]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, destination..."
                aria-label="Search trip requests"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          {loadingTrips ? (
            <div className="p-10 text-center text-sm text-[#6B7280]">
              Loading trip requests...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-serif text-lg text-[#1F2937]">
                No matching trip requests found.
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                Try clearing the search filter or submit a new trip plan from the guide.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E3DA] bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3.5 px-5">Booking ID</th>
                    <th className="py-3.5 px-5">Visitor</th>
                    <th className="py-3.5 px-5">Destinations &amp; Focus</th>
                    <th className="py-3.5 px-5">Schedule</th>
                    <th className="py-3.5 px-5 text-right">Guests</th>
                    <th className="py-3.5 px-5">Budget</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE6] text-sm">
                  {filteredTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-[#FAF9F6]/80 transition-colors align-top"
                    >
                      <td className="py-4 px-5 font-mono text-xs font-semibold text-[#1B4332] whitespace-nowrap tabular-nums">
                        {trip.bookingId}
                      </td>
                      <td className="py-4 px-5 min-w-[180px]">
                        <p className="font-semibold text-[#1F2937]">
                          {trip.fullName}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {trip.email}
                        </p>
                        <p className="text-xs text-[#6B7280] tabular-nums">
                          {trip.phone}
                        </p>
                      </td>
                      <td className="py-4 px-5 min-w-[240px]">
                        <p className="font-medium text-[#1F2937]">
                          {trip.selectedDestinations.join(', ')}
                        </p>
                        {trip.experiences.length > 0 && (
                          <p className="text-xs text-[#6B7280] mt-1">
                            {trip.experiences.join(' · ')}
                          </p>
                        )}
                        {trip.notes && (
                          <p className="text-xs text-[#4B5563] italic mt-1 line-clamp-2">
                            “{trip.notes}”
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="font-mono text-xs text-[#1F2937] tabular-nums">
                          {trip.travelDate}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {trip.duration}
                        </p>
                      </td>
                      <td className="py-4 px-5 text-right font-mono tabular-nums text-[#1F2937]">
                        {trip.travelers}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap text-[#374151]">
                        {trip.budget}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <select
                          aria-label={`Status for ${trip.bookingId}`}
                          disabled={updatingTripId === trip.id}
                          value={trip.status}
                          onChange={async (e) => {
                            setUpdatingTripId(trip.id);
                            try {
                              await onUpdateTripStatus(
                                trip.id,
                                e.target.value as TripStatus
                              );
                            } finally {
                              setUpdatingTripId(null);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1B4332] ${
                            STATUS_BADGE_STYLES[trip.status]
                          }`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {confirmDeleteId === trip.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteTrip(trip.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded border border-[#D1D5DB] text-xs text-[#4B5563] hover:bg-[#EFECE4] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Delete trip ${trip.bookingId}`}
                            onClick={() => setConfirmDeleteId(trip.id)}
                            className="p-2 rounded-lg text-[#6B7280] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handlePhotoSubmit}
            className="lg:col-span-5 bg-white rounded-[14px] border border-[#E7E3DA] p-6 space-y-5"
          >
            <div className="flex items-center gap-2.5">
              <ImagePlus className="w-5 h-5 text-[#1B4332]" aria-hidden="true" />
              <h2 className="font-serif text-xl font-bold text-[#1F2937]">
                Upload / Add Custom Photo
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Add field survey photography or curated landmarks directly to the public
              Belagavi gallery via image file upload or direct URL.
            </p>

            <div>
              <label
                htmlFor="gallery-title"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Photo Title *
              </label>
              <input
                id="gallery-title"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="e.g., Sunset over Yellur Ramparts"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label
                htmlFor="gallery-category"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Category *
              </label>
              <select
                id="gallery-category"
                value={photoCategory}
                onChange={(e) =>
                  setPhotoCategory(e.target.value as GalleryCategory)
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332]"
              >
                {GALLERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#374151] mb-2">
                Image Source *
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#EFECE4] rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-white text-[#1B4332] shadow-sm'
                      : 'text-[#4B5563]'
                  }`}
                >
                  Upload Image File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    uploadMode === 'url'
                      ? 'bg-white text-[#1B4332] shadow-sm'
                      : 'text-[#4B5563]'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {uploadMode === 'file' ? (
                <label className="flex flex-col items-center justify-center border border-dashed border-[#9CA3AF] rounded-xl p-5 bg-[#FAF9F6] hover:border-[#1B4332] transition-colors cursor-pointer text-center">
                  <Upload
                    className="w-6 h-6 text-[#1B4332] mb-2"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-[#1F2937]">
                    {fileName || 'Choose PNG, JPEG, or WebP (max 4MB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://example.com/belagavi-photo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332]"
                />
              )}

              {((uploadMode === 'file' && fileDataUrl) ||
                (uploadMode === 'url' && photoUrlInput.trim())) && (
                <div className="mt-3 aspect-[4/3] rounded-lg overflow-hidden border border-[#E7E3DA] bg-[#EFECE4]">
                  <ResilientImage
                    src={uploadMode === 'file' ? fileDataUrl : photoUrlInput.trim()}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="gallery-caption"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Caption
              </label>
              <textarea
                id="gallery-caption"
                rows={2}
                maxLength={240}
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Brief note about the location, season, or heritage craft..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            {photoError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
              >
                {photoError}
              </div>
            )}
            {photoSuccess && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800"
              >
                {photoSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={photoSubmitting}
              className="w-full py-3 px-5 rounded-lg bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {photoSubmitting ? 'Adding Photo...' : 'Publish to Photo Gallery'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-[14px] border border-[#E7E3DA] p-6">
            <h3 className="font-serif text-xl font-bold text-[#1F2937] pb-4 border-b border-[#E7E3DA]">
              Published Archive ({gallery.length})
            </h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl border border-[#E7E3DA] overflow-hidden bg-[#FAF9F6] flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#EFECE4] overflow-hidden">
                    <ResilientImage
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1B4332]">
                        {photo.category}
                      </p>
                      <p className="font-serif text-sm font-bold text-[#1F2937] truncate mt-0.5">
                        {photo.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${photo.title}`}
                      onClick={() => onDeleteGalleryPhoto(photo.id)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-700 hover:bg-red-50 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
