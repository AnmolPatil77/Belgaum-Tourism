import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, X } from 'lucide-react';
import type {
  DestinationItem,
  ExperiencePreference,
  TripBudget,
  TripDuration,
  TripRequest,
} from '../types';

interface TripPlannerSectionProps {
  destinations: DestinationItem[];
  selectedDestinations: string[];
  onToggleDestination: (name: string) => void;
  onClearDestinations: () => void;
  onTripCreated: (trip: TripRequest) => void;
  onGoToAdmin: () => void;
}

const EXPERIENCE_OPTIONS: ExperiencePreference[] = [
  'Local Food Trail',
  'Heritage & Fort Walk',
  'Art & Handicraft Shopping',
  'Nature & Waterfall Trek',
];

const DURATION_OPTIONS: TripDuration[] = [
  '1 Day',
  '2 Days / 1 Night',
  '3 Days / 2 Nights',
];

const BUDGET_OPTIONS: TripBudget[] = ['Budget', 'Standard', 'Premium'];

function getDefaultTravelDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

export function TripPlannerSection({
  destinations,
  selectedDestinations,
  onToggleDestination,
  onClearDestinations,
  onTripCreated,
  onGoToAdmin,
}: TripPlannerSectionProps) {
  const [experiences, setExperiences] = useState<ExperiencePreference[]>([
    'Local Food Trail',
    'Heritage & Fort Walk',
  ]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState(getDefaultTravelDate);
  const [duration, setDuration] = useState<TripDuration>('2 Days / 1 Night');
  const [travelers, setTravelers] = useState<number>(2);
  const [budget, setBudget] = useState<TripBudget>('Standard');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedTrip, setConfirmedTrip] = useState<TripRequest | null>(null);

  const toggleExperience = (exp: ExperiencePreference) => {
    setExperiences((prev) =>
      prev.includes(exp) ? prev.filter((item) => item !== exp) : [...prev, exp]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedDestinations.length === 0) {
      setErrorMessage('Please select at least one Belagavi destination above.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          travelDate,
          duration,
          travelers,
          budget,
          selectedDestinations,
          experiences,
          notes,
        }),
      });

      const data = (await response.json()) as {
        trip?: TripRequest;
        error?: string;
      };

      if (!response.ok || !data.trip) {
        setErrorMessage(
          data.error || 'Could not submit your trip request. Please check your entries.'
        );
        return;
      }

      setConfirmedTrip(data.trip);
      onTripCreated(data.trip);
      setFullName('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch {
      setErrorMessage('Network error while saving your itinerary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="plan-trip"
      className="bg-[#F3EFE6]/75 border-t border-[#E7E3DA] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#DED9CD]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
            04. Custom Itinerary Request
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mt-2 [text-wrap:balance]">
            Plan Your Belagavi Journey
          </h2>
          <p className="text-[#4B5563] text-base mt-3 leading-relaxed">
            Combine waterfalls, Ratta dynasty forts, artisan workshops, and culinary stops
            into a tailored Belagavi itinerary saved directly for local trip coordination.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white rounded-[14px] border border-[#E7E3DA] p-6 sm:p-8 shadow-[0_2px_12px_rgba(27,67,50,0.04)] space-y-8"
          >
            {/* 1. Destinations Multi-Select */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <label className="block font-serif text-lg font-bold text-[#1F2937]">
                  Select Belagavi Destinations
                </label>
                {selectedDestinations.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearDestinations}
                    className="text-xs font-medium text-[#6B7280] hover:text-[#1F2937] underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mb-4">
                Synced with the destinations guide above. Choose one or more stops.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {destinations.map((dest) => {
                  const isChecked = selectedDestinations.includes(dest.name);
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => onToggleDestination(dest.name)}
                      aria-pressed={isChecked}
                      className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-left text-sm transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332] font-medium'
                          : 'bg-[#FAF9F6] text-[#1F2937] border-[#E7E3DA] hover:border-[#1B4332]/50'
                      }`}
                    >
                      <span className="truncate">{dest.name}</span>
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-[#D97706] text-white'
                            : 'border border-[#D1D5DB] bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Experience Preferences */}
            <div className="pt-6 border-t border-[#F3EFE6]">
              <label className="block font-serif text-lg font-bold text-[#1F2937] mb-3">
                Experience Preferences
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPERIENCE_OPTIONS.map((exp) => {
                  const checked = experiences.includes(exp);
                  return (
                    <label
                      key={exp}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332] font-medium'
                          : 'border-[#E7E3DA] bg-[#FAF9F6] text-[#374151] hover:border-[#1B4332]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExperience(exp)}
                        className="w-4 h-4 accent-[#1B4332] rounded"
                      />
                      <span>{exp}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Visitor Details */}
            <div className="pt-6 border-t border-[#F3EFE6] space-y-5">
              <h3 className="font-serif text-lg font-bold text-[#1F2937]">
                Visitor &amp; Schedule Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="trip-fullname"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="trip-fullname"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Ananya Deshpande"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trip-email"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="trip-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trip-phone"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="trip-phone"
                    type="tel"
                    required
                    minLength={7}
                    maxLength={22}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trip-date"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Preferred Travel Date *
                  </label>
                  <input
                    id="trip-date"
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trip-duration"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Trip Duration *
                  </label>
                  <select
                    id="trip-duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as TripDuration)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="trip-travelers"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Number of Travelers *
                  </label>
                  <input
                    id="trip-travelers"
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={travelers}
                    onChange={(e) =>
                      setTravelers(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#374151] mb-2">
                  Budget Range *
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {BUDGET_OPTIONS.map((tier) => {
                    const active = budget === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBudget(tier)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332]'
                            : 'bg-[#FAF9F6] text-[#374151] border-[#E7E3DA] hover:border-[#1B4332]/40'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="trip-notes"
                  className="block text-xs font-semibold text-[#374151] mb-1.5"
                >
                  Special Notes or Accessibility Requests
                </label>
                <textarea
                  id="trip-notes"
                  rows={3}
                  maxLength={800}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention dietary preferences, pickup point (Belagavi Airport / Railway Station), or Kunda tasting stops..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-[#FAF9F6] text-sm text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-lg bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 text-white font-semibold text-base transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D97706]"
            >
              {submitting ? 'Saving Your Trip Request...' : 'Submit Trip Request'}
            </button>
          </form>

          {/* Live Trip Summary Box */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-[14px] bg-[#1B4332] text-[#FAF9F6] p-7 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FDE68A]">
              Live Trip Summary
            </p>
            <h3 className="font-serif text-2xl font-bold text-white mt-1.5">
              Your Belagavi Itinerary
            </h3>

            <dl className="mt-6 space-y-5 text-sm">
              <div className="pb-4 border-b border-white/15">
                <dt className="text-xs uppercase tracking-wider text-white/70">
                  Selected Destinations ({selectedDestinations.length})
                </dt>
                <dd className="mt-2.5">
                  {selectedDestinations.length === 0 ? (
                    <p className="text-white/70 italic">
                      No destinations chosen yet. Select stops from the guide or the
                      checklist.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedDestinations.map((dest) => (
                        <li
                          key={dest}
                          className="flex items-center justify-between gap-3 text-white font-medium"
                        >
                          <span>{dest}</span>
                          <button
                            type="button"
                            onClick={() => onToggleDestination(dest)}
                            aria-label={`Remove ${dest}`}
                            className="text-white/60 hover:text-white cursor-pointer p-0.5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>

              <div className="pb-4 border-b border-white/15">
                <dt className="text-xs uppercase tracking-wider text-white/70">
                  Chosen Experiences ({experiences.length})
                </dt>
                <dd className="mt-2 text-white/95 leading-relaxed">
                  {experiences.length === 0
                    ? 'No specific experience trails selected'
                    : experiences.join(' · ')}
                </dd>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/15">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/70">
                    Duration
                  </dt>
                  <dd className="mt-1 font-semibold text-white">{duration}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/70">
                    Travelers
                  </dt>
                  <dd className="mt-1 font-semibold text-white tabular-nums">
                    {travelers} {travelers === 1 ? 'Guest' : 'Guests'}
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/70">
                    Preferred Date
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-white tabular-nums">
                    {travelDate || 'Flexible'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/70">
                    Budget Tier
                  </dt>
                  <dd className="mt-1 font-semibold text-[#FDE68A]">{budget}</dd>
                </div>
              </div>
            </dl>
          </aside>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedTrip && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="trip-confirmed-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmedTrip(null)}
        >
          <div
            className="max-w-lg w-full bg-[#FAF9F6] rounded-[14px] border border-[#E7E3DA] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#1B4332] shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1B4332]">
                    Itinerary Registered
                  </p>
                  <h3
                    id="trip-confirmed-title"
                    className="font-serif text-2xl font-bold text-[#1F2937]"
                  >
                    Your Belagavi Trip Is Queued
                  </h3>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close confirmation modal"
                onClick={() => setConfirmedTrip(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFECE4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-white border border-[#E7E3DA] p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
                <span className="text-[#6B7280]">Booking Reference</span>
                <span className="font-mono text-base font-bold text-[#1B4332] tabular-nums">
                  {confirmedTrip.bookingId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Traveler</span>
                <span className="font-semibold text-[#1F2937]">
                  {confirmedTrip.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Schedule</span>
                <span className="text-[#1F2937] tabular-nums">
                  {confirmedTrip.travelDate} · {confirmedTrip.duration}
                </span>
              </div>
              <div className="pt-2 border-t border-[#F3EFE6]">
                <span className="text-[#6B7280] block mb-1">Destinations</span>
                <span className="font-medium text-[#1F2937]">
                  {confirmedTrip.selectedDestinations.join(', ')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmedTrip(null)}
                className="px-4 py-2.5 rounded-lg border border-[#D1D5DB] text-sm font-semibold text-[#374151] hover:bg-white cursor-pointer"
              >
                Continue Exploring
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedTrip(null);
                  onGoToAdmin();
                }}
                className="px-5 py-2.5 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#122E22] cursor-pointer"
              >
                View in Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
