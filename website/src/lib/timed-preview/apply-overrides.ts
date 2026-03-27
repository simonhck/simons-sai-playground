/**
 * Timed Preview — Layout Data Override Applicator
 *
 * Walks the JSS `layoutData` placeholder tree and replaces field values for
 * components whose UIDs match the override map.
 *
 * The override map is keyed by **normalised** component UID (lowercase, no
 * braces) and contains raw Sitecore field values as returned by the Authoring
 * GraphQL API.  This module resolves each raw value into the Layout-Service
 * format that JSS components expect (`{ value: ... }`).
 */

import { resolveFieldValue } from "./value-resolver";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Mutates `layoutData` in place, replacing field values for any component
 * whose UID appears in `overrides`.
 *
 * @param layoutData  The full `LayoutServiceData` object (sitecore.route…)
 * @param overrides   Map of normalisedUid → { fieldName: rawSitecoreValue }
 */
export function applyFieldOverrides(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutData: any,
  overrides: Record<string, Record<string, string>>
): void {
  const route = layoutData?.sitecore?.route;
  if (!route?.placeholders) return;

  // Discover the media base URL from existing image fields in the layout.
  // The Layout Service resolves images to the Edge delivery CDN, e.g.
  //   "https://edge-beta.sitecorecloud.io/-/media/GUID.ashx"
  // We extract the origin so overridden images use the same CDN.
  const mediaBaseUrl = discoverMediaBaseUrl(route.placeholders);

  walkPlaceholders(route.placeholders, overrides, mediaBaseUrl);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function walkPlaceholders(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholders: Record<string, any[]>,
  overrides: Record<string, Record<string, string>>,
  mediaBaseUrl?: string
): void {
  for (const phKey of Object.keys(placeholders)) {
    const components = placeholders[phKey];
    if (!Array.isArray(components)) continue;

    for (const component of components) {
      applyToComponent(component, overrides, mediaBaseUrl);

      // Recurse into nested placeholders (e.g. column splitters, tabs)
      if (component.placeholders) {
        walkPlaceholders(component.placeholders, overrides, mediaBaseUrl);
      }
    }
  }
}

function applyToComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  overrides: Record<string, Record<string, string>>,
  mediaBaseUrl?: string
): void {
  const rawUid: string = component.uid ?? "";
  const uid = rawUid.replace(/[{}]/g, "").toLowerCase();
  if (!uid) return;

  const componentOverrides = overrides[uid];
  if (!componentOverrides) return;

  // Ensure the component has a fields object to write into
  if (!component.fields) component.fields = {};

  for (const [fieldName, rawValue] of Object.entries(componentOverrides)) {
    // Case-insensitive match against existing fields so we overwrite in place
    // rather than creating a duplicate key with different casing.
    const existingKey = Object.keys(component.fields).find(
      (k) => k.toLowerCase() === fieldName.toLowerCase()
    );

    const resolved = resolveFieldValue(rawValue, mediaBaseUrl);

    if (existingKey) {
      component.fields[existingKey] = resolved;
    } else {
      component.fields[fieldName] = resolved;
    }
  }
}

// ---------------------------------------------------------------------------
// Media base URL discovery
// ---------------------------------------------------------------------------

/**
 * Scan existing image fields in the layout to find the Edge delivery base URL.
 * Looks for `src` values containing `/-/media/` and extracts the origin.
 *
 * Example: `"https://edge-beta.sitecorecloud.io/-/media/GUID.ashx"`
 *       →  `"https://edge-beta.sitecorecloud.io"`
 */
function discoverMediaBaseUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholders: Record<string, any[]>
): string | undefined {
  for (const phKey of Object.keys(placeholders)) {
    const components = placeholders[phKey];
    if (!Array.isArray(components)) continue;

    for (const component of components) {
      const fields = component.fields;
      if (fields) {
        for (const field of Object.values(fields)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const src = (field as any)?.value?.src as string | undefined;
          if (src) {
            const match = src.match(/^(https?:\/\/[^/]+)\/\-\/media\//);
            if (match) return match[1];
          }
        }
      }

      // Recurse into nested placeholders
      if (component.placeholders) {
        const found = discoverMediaBaseUrl(component.placeholders);
        if (found) return found;
      }
    }
  }
  return undefined;
}
