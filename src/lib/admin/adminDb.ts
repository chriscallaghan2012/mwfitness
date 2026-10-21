// adminDb.ts — Single data-access switch for Staff HQ.
// Live mode returns the shared Neon client; demo mode returns the in-memory demo
// client, which is what lets demo and live run the exact same staff components
// with only the data differing. Demo writes never reach Neon.
import { neon } from '../neon';
import { demoDb } from './demoDb';

export type AdminDb = NonNullable<typeof neon>;

let demoMode = false;

export function setAdminDemoMode(enabled: boolean) {
  demoMode = enabled;
}

export function isDemoMode() {
  return demoMode;
}

/**
 * Returns the data client for the current mode. Null only in live mode when the
 * Neon environment variables are missing — components keep their existing
 * "not configured" handling for that case.
 */
export function adminDb(): AdminDb | null {
  if (demoMode) return demoDb as unknown as AdminDb;
  return neon;
}
