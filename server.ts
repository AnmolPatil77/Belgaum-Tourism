import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  addGalleryPhoto,
  createTrip,
  deleteGalleryPhoto,
  deleteTrip,
  getContentSnapshot,
  initDatabase,
  listTrips,
  updateTripStatus,
} from './server/db.ts';
import { createInitialSeed } from './server/seed.ts';
import type {
  ExperiencePreference,
  GalleryCategory,
  TripBudget,
  TripDuration,
  TripRequest,
  TripStatus,
} from './src/types.ts';

const VALID_DURATIONS = new Set<TripDuration>([
  '1 Day',
  '2 Days / 1 Night',
  '3 Days / 2 Nights',
]);

const VALID_BUDGETS = new Set<TripBudget>(['Budget', 'Standard', 'Premium']);

const VALID_STATUSES = new Set<TripStatus>(['Pending', 'Confirmed', 'Completed']);

const VALID_EXPERIENCES = new Set<ExperiencePreference>([
  'Local Food Trail',
  'Heritage & Fort Walk',
  'Art & Handicraft Shopping',
  'Nature & Waterfall Trek',
]);

const VALID_GALLERY_CATEGORIES = new Set<GalleryCategory>([
  'Nature & Waterfalls',
  'Forts & Heritage',
  'Food & Sweets',
  'Art & Festivals',
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATA_IMAGE_PATTERN =
  /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i;

function isSafeImageSource(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 5_500_000) {
    return false;
  }
  if (DATA_IMAGE_PATTERN.test(trimmed)) {
    return true;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function generateBookingId(existingIds: Set<string>): string {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const numeric = crypto.randomInt(1000, 9999);
    const candidate = `BGM-2026-${numeric}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BGM-2026-${suffix}`;
}

async function startServer(): Promise<void> {
  const seed = createInitialSeed();
  await initDatabase(seed);

  const app = express();
  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  let cachedWeather: {
    expiresAt: number;
    payload: {
      temperatureC: number;
      humidity: number;
      windSpeedKmh: number;
      weatherCode: number;
      condition: string;
      isDay: boolean;
      advice: string;
      fetchedAt: string;
    };
  } | null = null;

  function describeWeatherCode(
    code: number,
    tempC: number,
    isDay: boolean
  ): { condition: string; advice: string } {
    if (code === 0) {
      return {
        condition: isDay ? 'Clear Sky' : 'Clear Night',
        advice:
          tempC >= 30
            ? 'Warm sunshine — visit Belagavi Fort early or head into shaded Bhimgad trails.'
            : 'Crisp visibility — ideal for Rajhansgad Fort ramparts and Gokak cliff views.',
      };
    }
    if (code === 1 || code === 2) {
      return {
        condition: 'Partly Cloudy',
        advice:
          'Pleasant Western Ghats breeze — great weather for heritage walks and Kunda tasting.',
      };
    }
    if (code === 3) {
      return {
        condition: 'Overcast',
        advice:
          'Cool shaded skies — comfortable all-day window for Kittur Fort and Shahapur looms.',
      };
    }
    if (code === 45 || code === 48) {
      return {
        condition: 'Misty & Foggy',
        advice:
          'Sahyadri valley mist — scenic viewpoints along Yellur and Khanapur ghats.',
      };
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return {
        condition: code >= 61 ? 'Rain & Showers' : 'Light Drizzle',
        advice:
          'Active Ghat showers — dramatic river flow at Gokak and Godchinamalaki Falls.',
      };
    }
    if (code >= 95) {
      return {
        condition: 'Thunderstorms',
        advice:
          'Stormy Ghat weather — enjoy warm Jolada Roti thalis and indoor artisan studios.',
      };
    }
    return {
      condition: 'Mild Ghat Weather',
      advice:
        'Comfortable climate across Belagavi’s forts, markets, and waterfall trails.',
    };
  }

  app.get('/api/weather', async (_req, res) => {
    if (cachedWeather && cachedWeather.expiresAt > Date.now()) {
      res.json(cachedWeather.payload);
      return;
    }

    try {
      const upstream = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=15.8497&longitude=74.4977&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=Asia%2FKolkata',
        { signal: AbortSignal.timeout(5000) }
      );
      if (!upstream.ok) {
        res.status(503).json({ error: 'Weather service unavailable.' });
        return;
      }

      const json = (await upstream.json()) as {
        current?: {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          weather_code?: number;
          wind_speed_10m?: number;
          is_day?: number;
        };
      };

      const cur = json.current;
      if (!cur || typeof cur.temperature_2m !== 'number') {
        res.status(503).json({ error: 'Incomplete weather response.' });
        return;
      }

      const temperatureC = Math.round(cur.temperature_2m);
      const humidity = Math.round(cur.relative_humidity_2m ?? 0);
      const windSpeedKmh = Math.round(cur.wind_speed_10m ?? 0);
      const weatherCode = Number(cur.weather_code ?? 0);
      const isDay = cur.is_day !== 0;
      const { condition, advice } = describeWeatherCode(
        weatherCode,
        temperatureC,
        isDay
      );

      const payload = {
        temperatureC,
        humidity,
        windSpeedKmh,
        weatherCode,
        condition,
        isDay,
        advice,
        fetchedAt: new Date().toISOString(),
      };

      cachedWeather = {
        expiresAt: Date.now() + 10 * 60 * 1000,
        payload,
      };

      res.json(payload);
    } catch {
      res.status(503).json({ error: 'Unable to fetch live Belagavi weather.' });
    }
  });

  app.get('/api/content', (_req, res) => {
    res.json(getContentSnapshot());
  });

  app.get('/api/trips', (req, res) => {
    const statusParam =
      typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const allTrips = listTrips();
    if (statusParam && VALID_STATUSES.has(statusParam as TripStatus)) {
      res.json({
        trips: allTrips.filter((trip) => trip.status === statusParam),
      });
      return;
    }
    res.json({ trips: allTrips });
  });

  app.post('/api/trips', async (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request payload.' });
      return;
    }

    const fullName =
      typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const travelDate =
      typeof body.travelDate === 'string' ? body.travelDate.trim() : '';
    const duration = body.duration as TripDuration;
    const travelers = Number(body.travelers);
    const budget = body.budget as TripBudget;
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

    if (fullName.length < 2 || fullName.length > 100) {
      res
        .status(400)
        .json({ error: 'Please enter your full name (2–100 characters).' });
      return;
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 120) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (phone.length < 7 || phone.length > 22) {
      res.status(400).json({ error: 'Please enter a valid phone number.' });
      return;
    }
    if (!DATE_PATTERN.test(travelDate)) {
      res.status(400).json({ error: 'Please choose a preferred travel date.' });
      return;
    }
    if (!VALID_DURATIONS.has(duration)) {
      res.status(400).json({ error: 'Please select a valid trip duration.' });
      return;
    }
    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 50) {
      res
        .status(400)
        .json({ error: 'Number of travelers must be between 1 and 50.' });
      return;
    }
    if (!VALID_BUDGETS.has(budget)) {
      res.status(400).json({ error: 'Please select a valid budget range.' });
      return;
    }

    const rawDestinations = Array.isArray(body.selectedDestinations)
      ? body.selectedDestinations
      : [];
    const selectedDestinations = rawDestinations
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= 120);

    if (selectedDestinations.length === 0) {
      res
        .status(400)
        .json({ error: 'Please select at least one Belagavi destination.' });
      return;
    }

    const rawExperiences = Array.isArray(body.experiences)
      ? body.experiences
      : [];
    const experiences = rawExperiences.filter(
      (item): item is ExperiencePreference =>
        typeof item === 'string' &&
        VALID_EXPERIENCES.has(item as ExperiencePreference)
    );

    if (notes.length > 800) {
      res
        .status(400)
        .json({ error: 'Special notes must be 800 characters or fewer.' });
      return;
    }

    const existingBookingIds = new Set(listTrips().map((t) => t.bookingId));
    const newTrip: TripRequest = {
      id: crypto.randomUUID(),
      bookingId: generateBookingId(existingBookingIds),
      fullName,
      email,
      phone,
      travelDate,
      duration,
      travelers,
      budget,
      selectedDestinations: Array.from(new Set(selectedDestinations)),
      experiences: Array.from(new Set(experiences)),
      notes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const created = await createTrip(newTrip);
    res.status(201).json({ trip: created });
  });

  app.patch('/api/trips/:id', async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const status = (req.body as { status?: unknown } | undefined)?.status;

    if (!id || typeof status !== 'string' || !VALID_STATUSES.has(status as TripStatus)) {
      res.status(400).json({ error: 'Invalid trip status update request.' });
      return;
    }

    const updated = await updateTripStatus(id, status as TripStatus);
    if (!updated) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }

    res.json({ trip: updated });
  });

  app.delete('/api/trips/:id', async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      res.status(400).json({ error: 'Invalid trip ID.' });
      return;
    }

    const deleted = await deleteTrip(id);
    if (!deleted) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }

    res.json({ deleted: true, id });
  });

  app.post('/api/gallery', async (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid photo payload.' });
      return;
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const category = body.category as GalleryCategory;
    const caption = typeof body.caption === 'string' ? body.caption.trim() : '';
    const imageUrl =
      typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';

    if (title.length < 2 || title.length > 100) {
      res
        .status(400)
        .json({ error: 'Photo title must be between 2 and 100 characters.' });
      return;
    }
    if (!VALID_GALLERY_CATEGORIES.has(category)) {
      res.status(400).json({ error: 'Please select a valid gallery category.' });
      return;
    }
    if (caption.length > 240) {
      res
        .status(400)
        .json({ error: 'Caption must be 240 characters or fewer.' });
      return;
    }
    if (!isSafeImageSource(imageUrl)) {
      res.status(400).json({
        error:
          'Please provide a valid http(s) image URL or upload a PNG/JPEG/WebP image under 5MB.',
      });
      return;
    }

    const photo = await addGalleryPhoto({
      id: `photo-${crypto.randomUUID().slice(0, 8)}`,
      title,
      category,
      caption: caption || 'Belagavi field archive submission.',
      imageUrl,
      isCustom: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ photo });
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      res.status(400).json({ error: 'Invalid photo ID.' });
      return;
    }

    const deleted = await deleteGalleryPhoto(id);
    if (!deleted) {
      res.status(404).json({ error: 'Gallery photo not found.' });
      return;
    }

    res.json({ deleted: true, id });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
        return;
      }
      res.status(404).send('Production build not found.');
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Belagavi Tourism server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Belagavi Tourism server:', err);
  process.exit(1);
});
