import { JSX } from 'react';
import { Field, Image, ImageField, Link, LinkField, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type AuthorBioCardDatasource = {
  Name?: Field<string>;
  Role?: Field<string>;
  Bio?: Field<string>;
  Avatar?: ImageField;
  ProfileLink?: LinkField;
};

type AuthorBioCardProps = ComponentProps & {
  fields?: AuthorBioCardDatasource;
};

/**
 * Author metadata card for editorial pages.
 *
 * @param {AuthorBioCardProps} props Component props.
 * @returns {JSX.Element} Rendered author card.
 */
export const Default = ({ fields, page, params }: AuthorBioCardProps): JSX.Element => {
  const isEditing = page.mode.isEditing;

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <aside {...getRenderingAttributes(params)} className={`mx-auto my-8 w-full max-w-3xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm sm:flex-row sm:items-start">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100">
          {(fields?.Avatar || isEditing) && (
            <Image field={fields?.Avatar} className="h-full w-full object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {(fields?.Name || isEditing) && (
            <Text field={fields?.Name} tag="h3" className="text-lg font-semibold text-slate-900" />
          )}
          {(fields?.Role || isEditing) && (
            <Text field={fields?.Role} tag="p" className="text-sm text-slate-500" />
          )}
          {(fields?.Bio || isEditing) && (
            <RichText field={fields?.Bio} className="prose prose-sm max-w-none text-slate-700" />
          )}
          {fields?.ProfileLink && (
            <Link field={fields.ProfileLink} className="inline-flex text-sm font-medium text-slate-900 hover:text-slate-700" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Default;
