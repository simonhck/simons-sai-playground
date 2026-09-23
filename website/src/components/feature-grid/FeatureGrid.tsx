import { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { CheckCircle2, Sparkles, Target, Zap } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type FeatureGridDatasource = {
  Title?: Field<string>;
  Items?: Field<string>;
};

type FeatureGridProps = ComponentProps & {
  fields?: FeatureGridDatasource;
};

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

const iconMap = {
  check: CheckCircle2,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
} as const;

/**
 * Parses a semicolon-delimited field into structured feature items.
 * Format: title|description|icon;title|description|icon
 *
 * @param {string | undefined} raw Raw datasource field value.
 * @returns {FeatureItem[]} Parsed feature items.
 */
const parseFeatureItems = (raw: string | undefined): FeatureItem[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [title = '', description = '', icon = 'check'] = item.split('|');
      return {
        title: title.trim(),
        description: description.trim(),
        icon: icon.trim().toLowerCase(),
      };
    });
};

/**
 * Feature cards component for campaign and product pages.
 *
 * @param {FeatureGridProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered feature grid.
 */
export const Default = ({ fields, page, params }: FeatureGridProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const items = parseFeatureItems(fields?.Items?.value);

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="space-y-6">
        {(fields?.Title || isEditing) && (
          <Text field={fields?.Title} tag="h2" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" />
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(items.length > 0 || isEditing) &&
            items.map((item, index) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? CheckCircle2;
              return (
                <article key={`${item.title}-${index}`} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                  <Icon className="mb-3 h-5 w-5 text-slate-600" aria-hidden />
                  <h3 className="text-base font-semibold text-slate-900">{item.title || 'Feature title'}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description || 'Feature description.'}</p>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Default;
