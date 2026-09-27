import fs from "fs";
import path from "path";
import { emptyDatabase, type Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");
const TMP_DB_PATH = path.join("/tmp", "prime-fusion-store.json");

declare global {
  // eslint-disable-next-line no-var
  var __primeFusionDb: Database | undefined;
  // eslint-disable-next-line no-var
  var __primeFusionDbWriteTimer: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __primeFusionDbPath: string | undefined;
}

function resolveDbPath(): string {
  if (global.__primeFusionDbPath) return global.__primeFusionDbPath;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Probe write access
    const probe = path.join(DATA_DIR, ".write-test");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    global.__primeFusionDbPath = DB_PATH;
  } catch {
    global.__primeFusionDbPath = TMP_DB_PATH;
    console.warn("[store] data/ not writable — using", TMP_DB_PATH);
  }
  return global.__primeFusionDbPath;
}

function readFromDisk(): Database {
  const file = resolveDbPath();
  // Prefer project data file if it exists (even if we write to /tmp)
  const candidates = [file, DB_PATH, TMP_DB_PATH];
  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const raw = fs.readFileSync(candidate, "utf8");
      if (!raw.trim()) continue;
      return { ...emptyDatabase(), ...JSON.parse(raw) } as Database;
    } catch (err) {
      console.warn("[store] failed reading", candidate, err);
    }
  }
  return emptyDatabase();
}

function writeToDisk(db: Database) {
  const file = resolveDbPath();
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    // Keep serving from memory even if persistence fails
    console.warn("[store] persist failed (in-memory only):", err);
  }
}

export function getDb(): Database {
  if (!global.__primeFusionDb) {
    global.__primeFusionDb = readFromDisk();
  }
  return global.__primeFusionDb;
}

/** Drop in-memory cache and reload from disk (or empty). */
export function reloadDbFromDisk() {
  global.__primeFusionDb = readFromDisk();
  return global.__primeFusionDb;
}

export function saveDb(immediate = false) {
  const db = getDb();
  if (immediate) {
    writeToDisk(db);
    return;
  }
  if (global.__primeFusionDbWriteTimer) clearTimeout(global.__primeFusionDbWriteTimer);
  global.__primeFusionDbWriteTimer = setTimeout(() => writeToDisk(db), 40);
}

export function replaceDb(next: Database) {
  global.__primeFusionDb = next;
  saveDb(true);
}

export function cuid() {
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export function nowIso() {
  return new Date().toISOString();
}

export function isDbSeeded() {
  const db = getDb();
  return db.menuItems.length > 0 && db.users.some((u) => u.role === "ADMIN");
}
