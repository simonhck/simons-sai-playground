/**
 * Timed Preview — In-memory Override Store
 *
 * Stores field-override payloads posted by the Timed Preview Marketplace App
 * so they can be picked up by the page-props-factory plugin during the same
 * editing render cycle.
 *
 * Keys are UUIDs, entries auto-expire after 60 seconds, and each key is
 * single-use (deleted on first retrieval).
 */

interface StoreEntry {
  data: Record<string, Record<string, string>>;
  expires: number;
}

const store = new Map<string, StoreEntry>();
const TTL_MS = 60_000; // 60 seconds

/**
 * Persist a set of field overrides and return a unique retrieval key.
 *
 * @param overrides  Map of normalised component UID → { fieldName: rawValue }
 * @returns  UUID key for later retrieval
 */
export function storeOverrides(
  overrides: Record<string, Record<string, string>>
): string {
  cleanup();
  const key = crypto.randomUUID();
  store.set(key, { data: overrides, expires: Date.now() + TTL_MS });
  return key;
}

/**
 * Retrieve (and consume) the overrides for `key`.
 * Returns `null` if the key is unknown or expired.
 */
export function getOverrides(
  key: string
): Record<string, Record<string, string>> | null {
  const entry = store.get(key);
  if (!entry) return null;
  store.delete(key);
  if (entry.expires < Date.now()) return null;
  return entry.data;
}

/** Remove all expired entries. */
function cleanup(): void {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expires < now) store.delete(k);
  }
}
