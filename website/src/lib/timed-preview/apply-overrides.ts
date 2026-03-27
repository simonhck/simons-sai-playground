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

    const resolved = resolveFieldValue(rawValue);

    if (existingKey) {
      component.fields[existingKey] = resolved;
    } else {
      component.fields[fieldName] = resolved;
    }
  }
}
