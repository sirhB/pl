import fs from "fs";
import path from "path";
import { emptyDatabase, type Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

declare global {
  // eslint-disable-next-line no-var
  var __primeFusionDb: Database | undefined;
  // eslint-disable-next-line no-var
  var __primeFusionDbWriteTimer: NodeJS.Timeout | undefined;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readFromDisk(): Database {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    return emptyDatabase();
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return { ...emptyDatabase(), ...JSON.parse(raw) } as Database;
  } catch {
    return emptyDatabase();
  }
}

function writeToDisk(db: Database) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function getDb(): Database {
  if (!global.__primeFusionDb) {
    global.__primeFusionDb = readFromDisk();
  }
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
