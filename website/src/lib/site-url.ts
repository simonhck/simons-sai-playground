const LOCAL_FALLBACK_URL = 'http://localhost:3000';

/**
 * Production base URL of the site, used for canonical URLs, Open Graph and structured data.
 * Set `NEXT_PUBLIC_SITE_URL` to the production URL in every deploy context, including Deploy Previews,
 * so previews never present themselves as the canonical site. Falls back to localhost when unset.
 *
 * @returns {string} Base URL without trailing slash.
 */
export const getSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL?.trim() || LOCAL_FALLBACK_URL).replace(/\/+$/, '');

/**
 * Builds an absolute production URL for a site-relative path. Absolute URLs are returned unchanged.
 *
 * @param {string} path Site-relative path (e.g. `/Blog/my-post`) or absolute URL.
 * @returns {string} Absolute URL.
 */
export const toAbsoluteUrl = (path = '/'): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return new URL(path.startsWith('/') ? path : `/${path}`, `${getSiteUrl()}/`).href;
};
