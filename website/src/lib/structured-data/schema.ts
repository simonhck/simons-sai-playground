/**
 * A schema.org JSON-LD object.
 */
export type JsonLdObject = { '@context': 'https://schema.org'; '@type': string; [property: string]: unknown };

type WebPageSchemaParams = {
  name: string;
  url: string;
  description?: string;
};

type ArticleSchemaParams = {
  headline: string;
  url: string;
  image?: string;
  /** ISO 8601. Never a display-formatted date: search engines only accept ISO dates. */
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
};

/**
 * Builds the `WebPage` node rendered on every page.
 *
 * @param {WebPageSchemaParams} params Page name, canonical URL and optional description.
 * @returns {JsonLdObject} schema.org WebPage.
 */
export const buildWebPageSchema = ({ name, url, description }: WebPageSchemaParams): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  url,
  description: description || undefined,
});

/**
 * Builds the `Article` node for article pages. Empty values are left out, so a missing
 * image, date or author shows up as a missing property rather than as an empty string.
 *
 * @param {ArticleSchemaParams} params Article values from the page's components.
 * @returns {JsonLdObject} schema.org Article.
 */
export const buildArticleSchema = ({
  headline,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
}: ArticleSchemaParams): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  image: image ? [image] : undefined,
  datePublished,
  dateModified: dateModified ?? datePublished,
  author: authorName ? { '@type': 'Person', name: authorName } : undefined,
  mainEntityOfPage: url,
});
