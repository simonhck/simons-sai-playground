import { JSX } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Check } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { parseRowsField } from 'lib/component-props/field-parsers';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type PricingPlansDatasource = {
  Title?: Field<string>;
  IntroText?: Field<string>;
  Plans?: Field<string>;
};

type PricingPlansProps = ComponentProps & {
  fields?: PricingPlansDatasource;
};

/**
 * Pricing plan cards for product and service demos.
 *
 * Plans format: name::price::period::features(comma separated)::ctaText::url|...
 *
 * @param {PricingPlansProps} props Component props.
 * @returns {JSX.Element} Rendered pricing plans.
 */
export const Default = ({ fields, page, params }: PricingPlansProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const rows = parseRowsField(fields?.Plans);

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
            const name = row[0] || `Plan ${index + 1}`;
            const price = row[1] || '$0';
            const period = row[2] || '/month';
            const features = (row[3] || '').split(',').map((entry) => entry.trim()).filter(Boolean);
            const ctaText = row[4] || 'Select plan';
            const url = row[5] || '#';

            return (
              <article key={`${name}-${index}`} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {price}
                  <span className="ml-1 text-sm font-medium text-slate-500">{period}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-slate-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={url}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {ctaText}
                </a>
              </article>
            );
          })}
      </div>
    </section>
  );
};

export default Default;
