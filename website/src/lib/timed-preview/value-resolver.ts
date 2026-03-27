/**
 * Timed Preview — Field Value Resolver
 *
 * The GraphQL Authoring API returns raw Sitecore field values (XML strings,
 * raw JSON, plain text).  The Layout Service that feeds component props wraps
 * and transforms these values into a richer format.
 *
 * This module bridges the gap: it takes a raw field value and returns the
 * Layout-Service-style object that JSS components expect in `props.fields`.
 *
 * Supported conversions:
 *   - Image XML      → { src, alt, width, height }
 *   - General Link XML → { href, text, linktype, target, title, class }
 *   - JSON strings   → parsed object / array  (key-value maps, plugin fields)
 *   - Plain text / HTML → pass-through string
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a raw Sitecore field value to the `{ value: ... }` shape that
 * JSS components receive via `props.fields.<FieldName>`.
 *
 * @param mediaBaseUrl  Optional base URL for media assets (e.g.
 *   `"https://edge-beta.sitecorecloud.io"`).  When provided, image `src`
 *   values are generated as absolute URLs matching the Edge delivery origin.
 */
export function resolveFieldValue(
  rawValue: string,
  mediaBaseUrl?: string
): { value: unknown } {
  if (!rawValue) return { value: "" };

  const trimmed = rawValue.trim();

  // ── Image field ──────────────────────────────────────────────────────────
  if (trimmed.startsWith("<image ")) {
    return { value: parseImageXml(trimmed, mediaBaseUrl) };
  }

  // ── General Link field ───────────────────────────────────────────────────
  if (trimmed.startsWith("<link ")) {
    return { value: parseLinkXml(trimmed) };
  }

  // ── JSON value (key-value maps, plugin fields, structured content) ──────
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return { value: JSON.parse(trimmed) };
    } catch {
      // Not valid JSON — fall through to plain-text handling
    }
  }

  // ── Text / Rich Text — pass through as-is ───────────────────────────────
  return { value: rawValue };
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Parse a Sitecore image XML string into the object shape that
 * `next/image` / `<Image>` JSS helper expects.
 *
 * Input:  `<image mediaid="{GUID}" alt="Hero" width="800" height="600" />`
 * Output: `{ src: "/-/media/GUID.ashx", alt: "Hero", width: "800", height: "600" }`
 */
function parseImageXml(
  xml: string,
  mediaBaseUrl?: string
): Record<string, string> {
  const attrs = extractXmlAttributes(xml);

  const mediaid = (attrs.mediaid || "").replace(/[{}]/g, "");
  const base = mediaBaseUrl ? mediaBaseUrl.replace(/\/+$/, "") : "";

  return {
    src: mediaid ? `${base}/-/media/${mediaid}.ashx` : "",
    alt: attrs.alt ?? "",
    width: attrs.width ?? "",
    height: attrs.height ?? "",
  };
}

/**
 * Parse a Sitecore link XML string into the object shape that
 * `<Link>` JSS helper expects.
 *
 * Input:  `<link text="Read more" linktype="internal" url="/about" target="_blank" />`
 * Output: `{ href: "/about", text: "Read more", linktype: "internal", target: "_blank", ... }`
 */
function parseLinkXml(xml: string): Record<string, string> {
  const attrs = extractXmlAttributes(xml);

  return {
    href: attrs.url || attrs.href || "",
    text: attrs.text ?? "",
    linktype: attrs.linktype ?? "",
    target: attrs.target ?? "",
    title: attrs.title ?? "",
    class: attrs.class ?? "",
    anchor: attrs.anchor ?? "",
    querystring: attrs.querystring ?? "",
  };
}

/** Extract attribute key/value pairs from a single self-closing XML tag. */
function extractXmlAttributes(xml: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}
