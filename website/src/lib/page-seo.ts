import type { Metadata } from 'next';
import type { ComponentRendering, Field, ImageField, Page, PlaceholdersData } from '@sitecore-content-sdk/nextjs';
import { toAbsoluteUrl } from 'src/lib/site-url';

/**
 * SEO fields of the SXA page template (`_Seo Metadata` / `_OpenGraph` base templates).
 */
export type PageSeoFields = {
  Title?: Field<string>;
  baseMetadataTitle?: Field<string>;
  baseMetadataDescription?: Field<string>;
  baseOgTitle?: Field<string>;
  baseOgDescription?: Field<string>;
  baseOgImage?: ImageField;
  baseOgType?: Field<string>;
};

/** Components whose image field serves as the Open Graph fallback, in order of preference. */
const HERO_IMAGE_FIELDS: ReadonlyArray<[componentName: string, fieldName: string]> = [
  ['ArticleHero', 'HeroImage'],
  ['HeroBanner', 'Image'],
];

const fieldText = (field: Field<string> | undefined): string => field?.value?.trim() ?? '';

/**
 * Finds the first rendering of a component anywhere in the placeholder tree (depth-first, in page order).
 *
 * @param {PlaceholdersData | undefined} placeholders Placeholders to search.
 * @param {string} componentName Component name as registered in the component map.
 * @returns {ComponentRendering | undefined} The rendering, or undefined when the page doesn't contain it.
 */
export const findRendering = (
  placeholders: PlaceholdersData | undefined,
  componentName: string
): ComponentRendering | undefined => {
  for (const renderings of Object.values(placeholders ?? {})) {
    for (const rendering of renderings as ComponentRendering[]) {
      if (rendering.componentName === componentName) {
        return rendering;
      }
      const nested = findRendering(rendering.placeholders, componentName);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
};

/**
 * Canonical production URL of a page, built from the layout's item path rather than the request,
 * so previews, personalization rewrites and odd casing in the request can't leak into it.
 *
 * @param {Page} page Sitecore page.
 * @returns {string} Absolute canonical URL.
 */
export const getCanonicalUrl = (page: Page): string => toAbsoluteUrl(page.layout.sitecore.context.itemPath || '/');

/**
 * Resolves an image URL to an absolute URL.
 *
 * @param {string | undefined} src Image source from an image field.
 * @returns {string | undefined} Absolute URL, or undefined when there is no image.
 */
export const toAbsoluteImageUrl = (src: string | undefined): string | undefined =>
  src ? toAbsoluteUrl(src) : undefined;

/**
 * Open Graph image of a page: the page's OG image field, else the first hero image on the page.
 *
 * @param {Page} page Sitecore page.
 * @returns {string | undefined} Absolute image URL, or undefined when the page has no suitable image.
 */
export const getPageImageUrl = (page: Page): string | undefined => {
  const route = page.layout.sitecore.route;
  const ogImage = (route?.fields as PageSeoFields | undefined)?.baseOgImage?.value?.src;
  if (ogImage) {
    return toAbsoluteImageUrl(ogImage);
  }

  for (const [componentName, fieldName] of HERO_IMAGE_FIELDS) {
    const image = findRendering(route?.placeholders, componentName)?.fields?.[fieldName] as ImageField | undefined;
    if (image?.value?.src) {
      return toAbsoluteImageUrl(image.value.src);
    }
  }
  return undefined;
};

/**
 * Page title for `<title>` and structured data: the SEO title if set, else the page's Title field.
 *
 * @param {Page} page Sitecore page.
 * @returns {string} Page title.
 */
export const getPageTitle = (page: Page): string => {
  const fields = page.layout.sitecore.route?.fields as PageSeoFields | undefined;
  return fieldText(fields?.baseMetadataTitle) || fieldText(fields?.Title) || 'Page';
};

/**
 * Meta description of a page from the SXA metadata field. No fallback on purpose: a missing description
 * is a content gap that the quality gates should report.
 *
 * @param {Page} page Sitecore page.
 * @returns {string | undefined} Description, or undefined when empty.
 */
export const getPageDescription = (page: Page): string | undefined => {
  const fields = page.layout.sitecore.route?.fields as PageSeoFields | undefined;
  return fieldText(fields?.baseMetadataDescription) || undefined;
};

/**
 * Builds the Next.js metadata of a Sitecore page: title, description, canonical and Open Graph.
 *
 * @param {Page} page Sitecore page.
 * @returns {Metadata} Metadata for `generateMetadata`.
 */
export const buildPageMetadata = (page: Page): Metadata => {
  const fields = page.layout.sitecore.route?.fields as PageSeoFields | undefined;
  const title = getPageTitle(page);
  const description = getPageDescription(page);
  const canonical = getCanonicalUrl(page);
  const image = getPageImageUrl(page);
  const ogType = fieldText(fields?.baseOgType) === 'article' ? 'article' : 'website';

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: fieldText(fields?.baseOgTitle) || title,
      description: fieldText(fields?.baseOgDescription) || description,
      url: canonical,
      type: ogType,
      images: image ? [{ url: image }] : undefined,
    },
  };
};
