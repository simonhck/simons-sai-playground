import { JSX } from 'react';
import type { JsonLdObject } from './schema';

/**
 * Renders a JSON-LD script tag. `<` is escaped so content from Sitecore can't close the script element.
 *
 * @param {{ data: JsonLdObject }} props The schema.org object to render.
 * @returns {JSX.Element} The script element.
 */
export const JsonLd = ({ data }: { data: JsonLdObject }): JSX.Element => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);
