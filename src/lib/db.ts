import { ensureSeeded } from "./store/seed";
import { getDb, saveDb, cuid, nowIso, isDbSeeded } from "./store/db";

export { getDb, saveDb, cuid, nowIso, isDbSeeded, ensureSeeded };
export * from "./store/types";

/** Call at the start of API handlers so local JSON data exists. */
export async function withDb<T>(fn: () => T | Promise<T>): Promise<T> {
  await ensureSeeded();
  return fn();
}
