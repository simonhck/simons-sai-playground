import type { RouteData } from '@sitecore-content-sdk/nextjs';

/**
 * WORKAROUND for Content SDK 2.2.x – 2.4.x. Remove when upgrading to a release that includes the fix
 * (present in 2.5.0 canaries: item tags drop the version suffix and GUIDs are normalized).
 *
 * `collectSitecorePageCacheTags` tags pages as `sc:item:<hyphenated-id>:<locale>:v<itemVersion>`, but
 * `createSitecoreRevalidateRouteHandler` maps webhook `updates[]` rows to `sc:item:<identifier>:<locale>:latest`.
 * The version suffix never matches, so publish webhooks would not invalidate pages. The helpers below produce
 * the tags the handler actually emits, for both GUID spellings Edge may send (hyphenated and compact).
 */

/**
 * Builds the item tags the revalidate route handler emits for a webhook update of the given item.
 *
 * @param {string} itemId Sitecore item ID in any common format (braced, hyphenated or compact).
 * @param {string} locale Item language.
 * @returns {string[]} Tags for the hyphenated and compact spelling of the ID.
 */
export function buildEdgeWebhookItemTags(itemId: string, locale: string): string[] {
  const normalizedLocale = locale.trim().toLowerCase().replace(/[/:\s]+/g, '_');
  const cleaned = itemId.trim().toLowerCase().replace(/[{}]/g, '');
  const compact = cleaned.replace(/-/g, '');
  const hyphenated = /^[0-9a-f]{32}$/.test(compact)
    ? `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`
    : cleaned;

  return Array.from(new Set([hyphenated, compact])).map((id) => `sc:item:${id}:${normalizedLocale}:latest`);
}

/**
 * Builds webhook-compatible item tags for a fetched page route.
 *
 * @param {RouteData | null | undefined} route Route data of the fetched page.
 * @param {string} fallbackLocale Locale used when the route has no `itemLanguage`.
 * @returns {string[]} Extra tags to register; empty when the route has no item id.
 */
export function getEdgeWebhookCompatTags(route: RouteData | null | undefined, fallbackLocale: string): string[] {
  if (!route?.itemId) {
    return [];
  }

  return buildEdgeWebhookItemTags(route.itemId, route.itemLanguage || fallbackLocale);
}
