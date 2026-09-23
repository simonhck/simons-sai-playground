'use client';

import { JSX, useMemo, useState } from 'react';
import { Field, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { ChevronDown } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';

type FaqAccordionDatasource = {
  Title?: Field<string>;
  Items?: Field<string>;
};

type FaqAccordionProps = ComponentProps & {
  fields?: FaqAccordionDatasource;
};

type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Parses a semicolon-delimited field into FAQ items.
 * Format: question|answer;question|answer
 *
 * @param {string | undefined} raw Raw datasource field value.
 * @returns {FaqItem[]} Parsed FAQ items.
 */
const parseFaqItems = (raw: string | undefined): FaqItem[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [question = '', answer = ''] = item.split('|');
      return {
        question: question.trim(),
        answer: answer.trim(),
      };
    });
};

/**
 * FAQ accordion with keyboard-accessible buttons.
 *
 * @param {FaqAccordionProps} props Component props and datasource fields.
 * @returns {JSX.Element} Rendered FAQ accordion.
 */
export const Default = ({ fields, page, params }: FaqAccordionProps): JSX.Element => {
  const isEditing = page.mode.isEditing;
  const items = useMemo(() => parseFaqItems(fields?.Items?.value), [fields?.Items?.value]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!fields && !isEditing) {
    return <></>;
  }

  return (
    <section {...getRenderingAttributes(params)} className={`mx-auto my-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${params?.styles || ''}`.trim()}>
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        {(fields?.Title || isEditing) && (
          <Text field={fields?.Title} tag="h2" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" />
        )}
        <div className="divide-y divide-black/10">
          {(items.length > 0 || isEditing) &&
            items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={`${item.question}-${index}`} className="py-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="text-base font-medium text-slate-900">{item.question || 'Question'}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <div className="pb-3 text-sm text-slate-700">
                      <RichText field={{ value: item.answer || 'Answer text' }} />
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Default;
