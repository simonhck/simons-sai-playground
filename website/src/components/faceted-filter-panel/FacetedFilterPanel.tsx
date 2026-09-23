'use client';

import { JSX, Suspense, useMemo } from 'react';
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

type FilterControlsProps = {
  categoryOptions: string[];
  searchPlaceholder: string;
};

type FilterControlsViewProps = FilterControlsProps & {
  query: string;
  category: string;
  onQueryChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
};

/**
 * Search and category inputs. Without change handlers the inputs render disabled (used as Suspense fallback).
 *
 * @param {FilterControlsViewProps} props Current values, options and optional change handlers.
 * @returns {JSX.Element} Rendered inputs.
 */
const FilterControlsView = ({
  categoryOptions,
  searchPlaceholder,
  query,
  category,
  onQueryChange,
  onCategoryChange,
}: FilterControlsViewProps): JSX.Element => (
  <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
    <input
      value={query}
      onChange={(event) => onQueryChange?.(event.target.value)}
      disabled={!onQueryChange}
      placeholder={searchPlaceholder}
      className="h-11 rounded-md border border-black/20 px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
      aria-label="Search query"
    />
    <select
      value={category}
      onChange={(event) => onCategoryChange?.(event.target.value)}
      disabled={!onCategoryChange}
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
);

/**
 * Filter inputs bound to the `q` and `category` URL parameters.
 * Reads `useSearchParams()`, so it must be rendered inside `<Suspense>` (required by Cache Components).
 *
 * @param {FilterControlsProps} props Category options and search placeholder.
 * @returns {JSX.Element} Rendered, URL-synced inputs.
 */
const UrlSyncedFilterControls = ({ categoryOptions, searchPlaceholder }: FilterControlsProps): JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <FilterControlsView
      categoryOptions={categoryOptions}
      searchPlaceholder={searchPlaceholder}
      query={query}
      category={category}
      onQueryChange={(value) => updateParam('q', value)}
      onCategoryChange={(value) => updateParam('category', value)}
    />
  );
};

/**
 * Faceted filter panel that syncs search criteria into URL parameters.
 *
 * @param {FacetedFilterPanelProps} props Component props.
 * @returns {JSX.Element} Rendered filter controls.
 */
export const Default = ({ fields, page, params }: FacetedFilterPanelProps): JSX.Element => {
  const isEditing = page.mode.isEditing;

  const categoryOptions = useMemo(() => {
    const options = parseDelimitedField(fields?.Categories, '|');
    return options.length > 0 ? options : ['all', 'marketing', 'editorial', 'product'];
  }, [fields?.Categories]);
  const searchPlaceholder = fields?.SearchPlaceholder?.value || 'Search demos';

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

        <Suspense
          fallback={
            <FilterControlsView
              categoryOptions={categoryOptions}
              searchPlaceholder={searchPlaceholder}
              query=""
              category="all"
            />
          }
        >
          <UrlSyncedFilterControls categoryOptions={categoryOptions} searchPlaceholder={searchPlaceholder} />
        </Suspense>
      </div>
    </section>
  );
};

export default Default;
