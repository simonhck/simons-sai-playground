'use client';

import { JSX, useMemo } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentProps } from 'lib/component-props';
import { parseDelimitedField } from 'lib/component-props/field-parsers';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type FacetedFilterPanelDatasource = {
  Title?: Field<string>;
  IntroText?: Field<string>;
  Categories?: Field<string>;
  SearchPlaceholder?: Field<string>;
};

type FacetedFilterPanelProps = ComponentProps & {
  fields?: FacetedFilterPanelDatasource;
};

/**
 * Faceted filter panel that syncs search criteria into URL parameters.
 *
 * @param {FacetedFilterPanelProps} props Component props.
 * @returns {JSX.Element} Rendered filter controls.
 */
export const Default = ({ fields, page, params }: FacetedFilterPanelProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryOptions = useMemo(() => {
    const options = parseDelimitedField(fields?.Categories, '|');
    return options.length > 0 ? options : ['all', 'marketing', 'editorial', 'product'];
  }, [fields?.Categories]);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  const updateParam = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    if (key !== 'page') {
      next.delete('page');
    }

    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="space-y-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
        {(fields?.Title || isEditing) && (
          <Text field={fields?.Title} tag="h2" className="text-xl font-semibold tracking-tight text-slate-900" />
        )}
        {(fields?.IntroText || isEditing) && (
          <RichText field={fields?.IntroText} className="prose prose-sm max-w-none text-slate-700" />
        )}

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <input
            value={query}
            onChange={(event) => updateParam('q', event.target.value)}
            placeholder={fields?.SearchPlaceholder?.value || 'Search demos'}
            className="h-11 rounded-md border border-black/20 px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="Search query"
          />
          <select
            value={category}
            onChange={(event) => updateParam('category', event.target.value)}
            className="h-11 rounded-md border border-black/20 px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="Category"
          >
            {categoryOptions.map((entry) => (
              <option key={entry} value={entry}>
                {entry === 'all' ? 'All categories' : entry}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default Default;
