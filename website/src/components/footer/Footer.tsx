import { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type FooterDatasource = {
  CopyrightText?: Field<string>;
};

type FooterProps = ComponentProps & {
  fields?: FooterDatasource;
};

/**
 * Site footer showing a copyright line. Falls back to the site name when no datasource is set.
 *
 * @param {FooterProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered footer.
 */
export const Default = ({ fields, page, params }: FooterProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const copyrightText = fields?.CopyrightText;

  return (
    <div
      {...getRenderingAttributes(params)}
      className={`mt-12 border-t border-black/10 bg-slate-100 ${params?.styles || ''}`.trim()}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8">
        {copyrightText?.value || isEditing ? (
          <Text field={copyrightText} tag="p" />
        ) : (
          <p>&copy; {page.siteName}</p>
        )}
      </div>
    </div>
  );
};

export default Default;
