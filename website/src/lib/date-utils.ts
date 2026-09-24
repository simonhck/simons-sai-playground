const COMPACT_SITECORE_DATE = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/;
const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;
const SITECORE_EMPTY_DATE_YEAR = '0001';

/**
 * Normalizes a Sitecore Date field value to an ISO 8601 string.
 * Accepts ISO values (layout service) and the compact Sitecore format (`20260923T000000Z`).
 * Anything else, including free text and Sitecore's empty date (`0001-01-01`), returns undefined.
 *
 * @param {string | undefined} value Raw field value.
 * @returns {string | undefined} ISO 8601 date-time, or undefined when the value is not a date.
 */
export const toIsoDate = (value: string | undefined): string | undefined => {
  const raw = value?.trim();
  if (!raw) {
    return undefined;
  }

  const compact = raw.match(COMPACT_SITECORE_DATE);
  const normalized = compact
    ? `${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}:${compact[5]}:${compact[6]}Z`
    : raw;
  if (!ISO_DATE_PREFIX.test(normalized) || normalized.startsWith(SITECORE_EMPTY_DATE_YEAR)) {
    return undefined;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

/**
 * Formats an ISO date for display, in UTC so the calendar day never shifts with the server's time zone.
 *
 * @param {string | undefined} isoDate ISO 8601 date-time.
 * @param {string} locale BCP 47 locale. Defaults to `en-US` ("September 23, 2026").
 * @returns {string | undefined} Long date, or undefined when no date is given.
 */
export const formatDisplayDate = (isoDate: string | undefined, locale = 'en-US'): string | undefined =>
  isoDate
    ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
        new Date(isoDate)
      )
    : undefined;
