import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type {
  BelagaviContentPayload,
  CultureShowcaseItem,
  DestinationItem,
  GalleryPhoto,
  TripRequest,
} from '../src/types.ts';

export interface DatabaseSchema {
  heroImageUrl: string;
  destinations: DestinationItem[];
  food: CultureShowcaseItem[];
  art: CultureShowcaseItem[];
  culture: CultureShowcaseItem[];
  gallery: GalleryPhoto[];
  trips: TripRequest[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DATA_DIR, 'belagavi-db.json');

let memoryStore: DatabaseSchema | null = null;
let writeChain: Promise<void> = Promise.resolve();

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function persistToDisk(snapshot: DatabaseSchema): Promise<void> {
  ensureDataDir();
  const tempPath = path.resolve(DATA_DIR, `belagavi-db.${process.pid}.tmp`);
  const payload = JSON.stringify(snapshot, null, 2);
  await fsp.writeFile(tempPath, payload, 'utf8');
  await fsp.rename(tempPath, DB_PATH);
}

function enqueueWrite(snapshot: DatabaseSchema): Promise<void> {
  const cloned: DatabaseSchema = structuredClone(snapshot);
  writeChain = writeChain.then(() => persistToDisk(cloned));
  return writeChain;
}

export async function initDatabase(seed: DatabaseSchema): Promise<void> {
  ensureDataDir();

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = await fsp.readFile(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      const customGallery = Array.isArray(parsed.gallery)
        ? parsed.gallery.filter((item) => item && item.isCustom)
        : [];
      const existingGalleryIds = new Set(seed.gallery.map((g) => g.id));
      const mergedGallery = [
        ...customGallery.filter((g) => !existingGalleryIds.has(g.id)),
        ...seed.gallery,
      ];

      memoryStore = {
        heroImageUrl: seed.heroImageUrl,
        destinations: seed.destinations,
        food: seed.food,
        art: seed.art,
        culture: seed.culture,
        gallery: mergedGallery,
        trips: Array.isArray(parsed.trips) ? parsed.trips : seed.trips,
      };
      await enqueueWrite(memoryStore);
      return;
    } catch {
      // Fall through to re-seed cleanly if existing file was corrupted
    }
  }

  memoryStore = structuredClone(seed);
  await enqueueWrite(memoryStore);
}

function getStore(): DatabaseSchema {
  if (!memoryStore) {
    throw new Error('Database not initialized');
  }
  return memoryStore;
}

export function getContentSnapshot(): BelagaviContentPayload {
  const db = getStore();
  return {
    heroImageUrl: db.heroImageUrl,
    destinations: db.destinations,
    food: db.food,
    art: db.art,
    culture: db.culture,
    gallery: db.gallery,
  };
}

export function listTrips(): TripRequest[] {
  const db = getStore();
  return [...db.trips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createTrip(trip: TripRequest): Promise<TripRequest> {
  const db = getStore();
  db.trips.unshift(trip);
  await enqueueWrite(db);
  return trip;
}

export async function updateTripStatus(
  id: string,
  status: TripRequest['status']
): Promise<TripRequest | null> {
  const db = getStore();
  const target = db.trips.find((t) => t.id === id);
  if (!target) {
    return null;
  }
  target.status = status;
  await enqueueWrite(db);
  return target;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const db = getStore();
  const initialLength = db.trips.length;
  db.trips = db.trips.filter((t) => t.id !== id);
  if (db.trips.length === initialLength) {
    return false;
  }
  await enqueueWrite(db);
  return true;
}

export async function addGalleryPhoto(photo: GalleryPhoto): Promise<GalleryPhoto> {
  const db = getStore();
  db.gallery.unshift(photo);
  await enqueueWrite(db);
  return photo;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const db = getStore();
  const initialLength = db.gallery.length;
  db.gallery = db.gallery.filter((p) => p.id !== id);
  if (db.gallery.length === initialLength) {
    return false;
  }
  await enqueueWrite(db);
  return true;
}
