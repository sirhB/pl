import { ensureSeeded } from "./store/seed";
import {
  getDb,
  saveDb,
  cuid,
  nowIso,
  isDbSeeded,
  reloadDbFromDisk,
} from "./store/db";

export {
  getDb,
  saveDb,
  cuid,
  nowIso,
  isDbSeeded,
  ensureSeeded,
  reloadDbFromDisk,
};
export * from "./store/types";

/** Call at the start of API handlers so local JSON data exists. */
export async function withDb<T>(fn: () => T | Promise<T>): Promise<T> {
  try {
    await ensureSeeded();
  } catch (err) {
    // Last chance: reload whatever is on disk
    reloadDbFromDisk();
    if (!isDbSeeded()) throw err;
  }
  return fn();
}
