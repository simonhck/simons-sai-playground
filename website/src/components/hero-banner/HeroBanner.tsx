import { JSX } from "react";
import {
  Field,
  Image,
  ImageField,
  Link,
  LinkField,
  RichText,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { Check, Info } from "lucide-react";
import { ComponentProps } from "lib/component-props";

type HeroBannerDatasource = {
  Headline?: Field<string>;
  IntroText?: Field<string>;
  Benefits?: Field<string>;
  Image?: ImageField;
  CTA?: LinkField;
};

type HeroBannerProps = ComponentProps & {
  fields: HeroBannerDatasource;
};

export const Intro = ({ fields, page }: HeroBannerProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const headlineField = fields?.Headline;
  const introTextField = fields?.IntroText;
  const benefitsField = fields?.Benefits?.value.split("&");
  const ctaField = fields?.CTA;
  const imageField = fields?.Image;

  console.log("fields", fields);

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div className="space-y-4">
          {(headlineField || isEditing) && (
            <Text
              field={headlineField}
              tag="h1"
              className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
            />
          )}

          {(introTextField || isEditing) && (
            <RichText
              field={introTextField}
              className="prose prose-sm max-w-none text-slate-700 sm:prose-base"
            />
          )}

          <ul>
            {(benefitsField || isEditing) &&
              benefitsField?.map((benefit, index) => {
                const benefitPair = decodeURIComponent(benefit).split("=");
                const benefitTitle = benefitPair[0];
                const benefitDescription =
                  benefitPair.length > 1 ? benefitPair[1] : "";
                return (
                    <li key={benefitTitle} className="flex items-center gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    <span className="text-slate-500">{benefitTitle}</span>
                    {benefitDescription && (
                      <a
                      href={benefitDescription}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-slate-500 transition-colors hover:text-slate-700"
                      aria-label="More info"
                      >
                      <Info className="h-4 w-4" />
                      </a>
                    )}
                    </li>
                );
              })}
          </ul>

          {ctaField && (
            <Link
              field={ctaField}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            />
          )}
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100 md:h-full md:min-h-80">
          {imageField || isEditing ? (
            <Image field={imageField} className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full bg-linear-to-br from-slate-200 to-slate-300"
              aria-hidden
            />
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default variant – registered as the primary React implementation in the
 * XM Cloud Pages editor via the component map spreading this module's named exports.
 * The Pages editor expects a named `Default` export; a `default` export alone
 * is not detected and causes the "missing React implementation" warning.
 */
export const Default = (props: HeroBannerProps): JSX.Element => (
  <Intro {...props} />
);

export default Default;
