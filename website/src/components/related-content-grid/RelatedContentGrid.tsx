import { JSX } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { parseRowsField } from 'lib/component-props/field-parsers';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type RelatedContentGridDatasource = {
  Title?: Field<string>;
  IntroText?: Field<string>;
  Items?: Field<string>;
};

type RelatedContentGridProps = ComponentProps & {
  fields?: RelatedContentGridDatasource;
};

/**
 * Related content card grid for editorial cross-linking.
 *
 * Items format: title::category::summary::url|...
 *
 * @param {RelatedContentGridProps} props Component props.
 * @returns {JSX.Element} Rendered related content grid.
 */
export const Default = ({ fields, page, params }: RelatedContentGridProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const rows = parseRowsField(fields?.Items);

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="space-y-4">
        {(fields?.Title || isEditing) && (
          <Text field={fields?.Title} tag="h2" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" />
        )}
        {(fields?.IntroText || isEditing) && (
          <RichText field={fields?.IntroText} className="prose prose-sm max-w-none text-slate-700 sm:prose-base" />
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(rows.length > 0 || isEditing) &&
          rows.map((row, index) => {
            const title = row[0] || `Related article ${index + 1}`;
            const category = row[1] || 'Editorial';
            const summary = row[2] || '';
            const url = row[3] || '#';

            return (
              <article key={`${title}-${index}`} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
                {summary && <p className="mt-2 text-sm text-slate-600">{summary}</p>}
                <a href={url} className="mt-4 inline-flex text-sm font-medium text-slate-900 hover:text-slate-700">
                  Read more
                </a>
              </article>
            );
          })}
      </div>
    </section>
  );
};

export default Default;
