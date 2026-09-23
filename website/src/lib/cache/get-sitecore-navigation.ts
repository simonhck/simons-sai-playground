import { cacheTag } from 'next/cache';
import client from 'src/lib/sitecore-client';
import { buildEdgeWebhookItemTags } from 'src/lib/cache/edge-webhook-tag-compat';

/**
 * A single entry of the main navigation.
 */
export type NavigationLink = {
  id: string;
  title: string;
  href: string;
};

type GetSitecoreNavigationParams = {
  site: string;
  locale: string;
};

type HomeItemResponse = {
  layout?: { item?: { id: string } | null } | null;
};

type ChildrenPageResponse = {
  item?: {
    children: {
      pageInfo: { hasNext: boolean; endCursor: string };
      results: Array<{
        id: string;
        displayName: string;
        url: { path: string };
        navigationTitle?: { value?: string } | null;
      }>;
    };
  } | null;
};

// Resolves the site's home item through site routing, so no content path is hard-coded.
const HOME_ITEM_QUERY = /* GraphQL */ `
  query HomeItem($site: String!, $language: String!) {
    layout(site: $site, routePath: "/", language: $language) {
      item {
        id
      }
    }
  }
`;

// Page size is capped by Experience Edge query complexity; larger pages are rejected.
const CHILDREN_PAGE_SIZE = 10;
const MAX_CHILDREN_PAGES = 10;

const HOME_CHILDREN_QUERY = /* GraphQL */ `
  query HomeChildren($homeId: String!, $language: String!, $after: String) {
    item(path: $homeId, language: $language) {
      children(hasLayout: true, first: ${CHILDREN_PAGE_SIZE}, after: $after) {
        pageInfo {
          hasNext
          endCursor
        }
        results {
          id
          displayName
          url {
            path
          }
          navigationTitle: field(name: "NavigationTitle") {
            value
          }
        }
      }
    }
  }
`;

/**
 * Gets the main navigation: the first-level child pages (items with a layout) of the site's home item.
 * Cached with Cache Components and tagged with the home and child item IDs, so publishing any of them
 * through the Edge webhook invalidates the navigation. Newly added pages are picked up once the entry
 * expires (default cache profile) or when the home item itself is published.
 *
 * Errors are thrown (and therefore not cached) so callers can decide on a fallback.
 *
 * @param {GetSitecoreNavigationParams} params Site name and locale of the current page.
 * @returns {Promise<NavigationLink[]>} Navigation links in Sitecore sort order.
 */
export async function getSitecoreNavigation(params: GetSitecoreNavigationParams): Promise<NavigationLink[]> {
  'use cache';

  const { site, locale } = params;
  const home = await client.getData<HomeItemResponse>(HOME_ITEM_QUERY, { site, language: locale });
  const homeId = home?.layout?.item?.id;
  if (!homeId) {
    return [];
  }

  const links: NavigationLink[] = [];
  let after: string | null = null;
  for (let pageIndex = 0; pageIndex < MAX_CHILDREN_PAGES; pageIndex++) {
    const response: ChildrenPageResponse = await client.getData<ChildrenPageResponse>(HOME_CHILDREN_QUERY, {
      homeId,
      language: locale,
      after,
    });
    const children = response?.item?.children;
    if (!children) {
      break;
    }

    for (const child of children.results) {
      links.push({
        id: child.id,
        title: child.navigationTitle?.value?.trim() || child.displayName,
        href: child.url.path,
      });
    }

    if (!children.pageInfo.hasNext) {
      break;
    }
    after = children.pageInfo.endCursor;
  }

  for (const id of [homeId, ...links.map((link) => link.id)]) {
    for (const tag of buildEdgeWebhookItemTags(id, locale)) {
      cacheTag(tag);
    }
  }

  return links;
}
