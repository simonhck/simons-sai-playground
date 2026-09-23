import { JSX } from 'react';
import { Field, Link, LinkField, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type CtaBandDatasource = {
  Headline?: Field<string>;
  Description?: Field<string>;
  PrimaryCta?: LinkField;
  SecondaryCta?: LinkField;
};

type CtaBandProps = ComponentProps & {
  fields?: CtaBandDatasource;
};

/**
 * Call-to-action strip used across marketing and editorial pages.
 *
 * @param {CtaBandProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered CTA band.
 */
export const Default = ({ fields, page, params }: CtaBandProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const primaryCta = fields?.PrimaryCta;
  const secondaryCta = fields?.SecondaryCta;

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="rounded-2xl border border-black/10 bg-slate-900 p-6 text-white shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            {(fields?.Headline || isEditing) && (
              <Text field={fields?.Headline} tag="h2" className="text-2xl font-semibold tracking-tight sm:text-3xl" />
            )}
            {(fields?.Description || isEditing) && (
              <RichText field={fields?.Description} className="prose prose-invert prose-sm max-w-none sm:prose-base" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(primaryCta || isEditing) && primaryCta && (
              <Link
                field={primaryCta}
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              />
            )}
            {(secondaryCta || isEditing) && secondaryCta && (
              <Link
                field={secondaryCta}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Default;
