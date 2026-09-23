import { JSX } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { parseRowsField } from 'lib/component-props/field-parsers';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type ComparisonTableDatasource = {
  Title?: Field<string>;
  IntroText?: Field<string>;
  HeaderColumns?: Field<string>;
  Rows?: Field<string>;
};

type ComparisonTableProps = ComponentProps & {
  fields?: ComparisonTableDatasource;
};

/**
 * Comparison table for product and plan scenarios.
 *
 * HeaderColumns format: Feature::Basic::Pro::Enterprise
 * Rows format: Feature A::Yes::Yes::Priority|Feature B::No::Yes::Yes
 *
 * @param {ComparisonTableProps} props Component props.
 * @returns {JSX.Element} Rendered comparison table.
 */
export const Default = ({ fields, page, params }: ComparisonTableProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const headers = parseRowsField(fields?.HeaderColumns, '|', '::')[0] || ['Feature', 'Option A', 'Option B'];
  const rows = parseRowsField(fields?.Rows);

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

      <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/10">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-slate-800">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {(rows.length > 0 || isEditing) &&
              rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {headers.map((_, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="px-4 py-3 text-sm text-slate-600">
                      {row[colIndex] || (colIndex === 0 ? `Feature ${rowIndex + 1}` : '-')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Default;
