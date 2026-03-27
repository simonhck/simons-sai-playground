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
 *
 * **Image handling**: Image fields on XM Cloud require a server-generated
 * security hash in their URL.  We cannot fabricate this hash from the raw
 * `mediaid` GUID alone.  Therefore, when the underlying media item has NOT
 * changed between versions (same mediaid), we preserve the existing fully-
 * resolved `src` URL and only update metadata (alt, width, height).  When
 * the media item itself changed, we flag the image so the consumer can
 * decide how to handle it (e.g. show a placeholder or skip).
 */

import { resolveFieldValue, isImageXml, parseImageMediaId } from "./value-resolver";

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

  walkPlaceholders(route.placeholders, overrides);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function walkPlaceholders(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholders: Record<string, any[]>,
  overrides: Record<string, Record<string, string>>
): void {
  for (const phKey of Object.keys(placeholders)) {
    const components = placeholders[phKey];
    if (!Array.isArray(components)) continue;

    for (const component of components) {
      applyToComponent(component, overrides);

      // Recurse into nested placeholders (e.g. column splitters, tabs)
      if (component.placeholders) {
        walkPlaceholders(component.placeholders, overrides);
      }
    }
  }
}

function applyToComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  overrides: Record<string, Record<string, string>>
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

    const key = existingKey ?? fieldName;
    const existingField = existingKey ? component.fields[existingKey] : undefined;

    // ── Image fields: smart merge ──────────────────────────────────────
    // XM Cloud image URLs contain a server-generated security hash + CDN
    // params (h, w, iar, ttc, tt, hash) that we cannot reproduce from the
    // raw mediaid alone.
    //
    // Strategy:
    //   • Same mediaid → keep the existing resolved src, update alt/w/h
    //   • Different mediaid → full resolve (URL will lack hash — consumer
    //     may need to handle this, but at least the correct alt/dimensions
    //     are shown)
    if (isImageXml(rawValue) && existingField?.value?.src) {
      const newMediaId = parseImageMediaId(rawValue);
      const existingSrc: string = existingField.value.src;
      const existingMediaId = extractMediaIdFromUrl(existingSrc);

      if (newMediaId && existingMediaId && newMediaId === existingMediaId) {
        // Same image — keep the fully-resolved src, update only metadata
        const resolved = resolveFieldValue(rawValue);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolvedValue = resolved.value as Record<string, any>;
        component.fields[key] = {
          value: {
            ...existingField.value,        // preserves src with hash, plus any extra props
            alt: resolvedValue.alt || existingField.value.alt,
            width: resolvedValue.width || existingField.value.width,
            height: resolvedValue.height || existingField.value.height,
          },
        };
      } else {
        // Different image — full resolve; src won't have hash but it's the
        // best we can do without a Layout Service call for this version.
        // Copy the base URL from the existing src so at least the domain is right.
        const baseUrl = extractBaseUrlFromMediaSrc(existingSrc);
        component.fields[key] = resolveFieldValue(rawValue, baseUrl);
      }
      continue;
    }

    // ── All other fields: straightforward resolve ──────────────────────
    const resolved = resolveFieldValue(rawValue);
    component.fields[key] = resolved;
  }
}

// ---------------------------------------------------------------------------
// Image URL helpers
// ---------------------------------------------------------------------------

/**
 * Extract the mediaid (normalised, lowercase, no braces) from a resolved
 * XM Cloud media URL.
 *
 * Handles both GUID-based and friendly paths:
 *   `…/-/media/B80D28E1-EBBC-49E6-A965-70070AC4087B.ashx?…` → guid
 *   `…/-/media/Feature/Solterra/images/tropical-bird.jpg?…`  → null (path-based)
 */
function extractMediaIdFromUrl(src: string): string | null {
  const match = src.match(
    /\/\-\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match ? match[1].toLowerCase() : null;
}

/**
 * Extract the base URL (everything before `/-/media/`) from an existing
 * resolved image src.  Used as fallback when the media item itself changed
 * and we need to construct a new URL with at least the correct domain.
 *
 * Example: `"https://xmc-host.sitecorecloud.io/-/media/GUID.ashx?h=600&…"`
 *       →  `"https://xmc-host.sitecorecloud.io"`
 */
function extractBaseUrlFromMediaSrc(src: string): string | undefined {
  const match = src.match(/^(https?:\/\/.+?)\/\-\/media\//);
  return match ? match[1] : undefined;
}
