import { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type ProductCardGridDatasource = {
  Title?: Field<string>;
  Items?: Field<string>;
};

type ProductCardGridProps = ComponentProps & {
  fields?: ProductCardGridDatasource;
};

type ProductCard = {
  name: string;
  category: string;
  price: string;
  href: string;
  ctaText: string;
};

/**
 * Parses product cards from a semicolon-delimited field.
 * Format: name|category|price|ctaText|url;name|category|price|ctaText|url
 *
 * @param {string | undefined} raw Raw datasource value.
 * @returns {ProductCard[]} Parsed product cards.
 */
const parseProductCards = (raw: string | undefined): ProductCard[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name = '', category = '', price = '', ctaText = 'View details', url = '#'] = item.split('|');
      return {
        name: name.trim(),
        category: category.trim(),
        price: price.trim(),
        href: url.trim(),
        ctaText: ctaText.trim(),
      };
    });
};

/**
 * Product listing cards for category and landing pages.
 *
 * @param {ProductCardGridProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered product card grid.
 */
export const Default = ({ fields, page, params }: ProductCardGridProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const products = parseProductCards(fields?.Items?.value);

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="space-y-6">
        {(fields?.Title || isEditing) && (
          <Text field={fields?.Title} tag="h2" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" />
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.length > 0 || isEditing) &&
            products.map((product, index) => (
              <article key={`${product.name}-${index}`} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category || 'Category'}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name || 'Product name'}</h3>
                <p className="mt-2 text-sm text-slate-600">{product.price || '$0.00'}</p>
                <div className="mt-4">
                  <a
                    href={product.href || '#'}
                    className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    {product.ctaText || 'View details'}
                  </a>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Default;
