import type { RouteData } from '@sitecore-content-sdk/nextjs';

/**
 * WORKAROUND for Content SDK 2.2.x – 2.4.x. Remove when upgrading to a release that includes the fix
 * (present in 2.5.0 canaries: item tags drop the version suffix and GUIDs are normalized).
 *
 * `collectSitecorePageCacheTags` tags pages as `sc:item:<hyphenated-id>:<locale>:v<itemVersion>`, but
 * `createSitecoreRevalidateRouteHandler` maps webhook `updates[]` rows to `sc:item:<identifier>:<locale>:latest`.
 * The version suffix never matches, so publish webhooks would not invalidate pages. This adds the tags the
 * handler actually produces, for both GUID spellings Edge may send (hyphenated and compact).
 *
 * @param {RouteData | null | undefined} route Route data of the fetched page.
 * @param {string} fallbackLocale Locale used when the route has no `itemLanguage`.
 * @returns {string[]} Extra tags to register; empty when the route has no item id.
 */
export function getEdgeWebhookCompatTags(route: RouteData | null | undefined, fallbackLocale: string): string[] {
  if (!route?.itemId) {
    return [];
  }

  const locale = (route.itemLanguage || fallbackLocale).trim().toLowerCase().replace(/[/:\s]+/g, '_');
  const hyphenated = route.itemId.trim().toLowerCase().replace(/[{}]/g, '');
  const compact = hyphenated.replace(/-/g, '');

  return Array.from(new Set([hyphenated, compact])).map((id) => `sc:item:${id}:${locale}:latest`);
}
