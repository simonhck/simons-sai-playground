import { JSX } from 'react';
import { DateField, Field, Image, ImageField, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';
import { formatDisplayDate, toIsoDate } from 'lib/date-utils';
import { findRendering, getCanonicalUrl, toAbsoluteImageUrl } from 'lib/page-seo';
import { JsonLd } from 'lib/structured-data/JsonLd';
import { buildArticleSchema } from 'lib/structured-data/schema';

type ArticleHeroDatasource = {
  Kicker?: Field<string>;
  Title?: Field<string>;
  Summary?: Field<string>;
  HeroImage?: ImageField;
  ReadTime?: Field<string>;
  PublishDate?: Field<string>;
};

type ArticleHeroProps = ComponentProps & {
  fields?: ArticleHeroDatasource;
};

/**
 * Editorial hero block for article pages. Also renders the page's `Article` structured data,
 * with the author taken from the AuthorBioCard on the same page.
 *
 * @param {ArticleHeroProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered article hero.
 */
export const Default = ({ fields, page, params }: ArticleHeroProps): JSX.Element => {
  const isEditing = page.mode.isEditing;

  if (!fields && !isEditing) {
    return <></>;
  }

  const publishDateIso = toIsoDate(fields?.PublishDate?.value);
  // One formatted date for everything
  const publishedDate = formatDisplayDate(publishDateIso, 'de-DE');
  const authorName = (
    findRendering(page.layout.sitecore.route?.placeholders, 'AuthorBioCard')?.fields?.Name as Field<string> | undefined
  )?.value;

  const articleSchema =
    fields?.Title?.value && !isEditing && !page.mode.isDesignLibrary
      ? buildArticleSchema({
          headline: fields.Title.value,
          url: getCanonicalUrl(page),
          image: toAbsoluteImageUrl(fields.HeroImage?.value?.src),
          datePublished: publishedDate,
          dateModified: publishedDate,
          authorName,
        })
      : undefined;

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      {articleSchema && <JsonLd data={articleSchema} />}
      <article className="grid items-start gap-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div className="space-y-4">
          {(fields?.Kicker || isEditing) && (
            <Text field={fields?.Kicker} tag="p" className="text-xs font-semibold uppercase tracking-wide text-slate-500" />
          )}
          {(fields?.Title || isEditing) && (
            <Text field={fields?.Title} tag="h1" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl" />
          )}
          {(fields?.Summary || isEditing) && (
            <RichText field={fields?.Summary} className="prose prose-sm max-w-none text-slate-700 sm:prose-base" />
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {isEditing ? (
              <DateField
                field={fields?.PublishDate ?? { value: '' }}
                tag="p"
                render={(date) =>
                  date && !Number.isNaN(date.getTime()) ? formatDisplayDate(date.toISOString()) : null
                }
              />
            ) : publishDateIso ? (
              <time dateTime={publishDateIso}>{publishedDate}</time>
            ) : (
              // Not a date (e.g. legacy text value): show it as entered.
              fields?.PublishDate?.value && <Text field={fields.PublishDate} tag="p" />
            )}
            {(fields?.ReadTime || isEditing) && <Text field={fields?.ReadTime} tag="p" />}
          </div>
        </div>
        <div className="h-72 overflow-hidden rounded-xl bg-slate-100 md:h-full md:min-h-80">
          {(fields?.HeroImage || isEditing) && (
            <Image field={fields?.HeroImage} className="h-full w-full object-cover" />
          )}
        </div>
      </article>
    </section>
  );
};

export default Default;
