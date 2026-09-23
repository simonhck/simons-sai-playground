import { Field } from '@sitecore-content-sdk/nextjs';

type TextField = Field<string> | undefined;

/**
 * Escapes a literal separator so it can be used inside a RegExp.
 *
 * @param {string} value Literal separator.
 * @returns {string} RegExp-safe separator.
 */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits a delimited text field into a list of trimmed, non-empty entries.
 * Line breaks are treated as separators too, so Multi-Line Text fields can hold one entry per line.
 *
 * @param {TextField} field Sitecore text field, e.g. `all|marketing|editorial`.
 * @param {string} separator Entry separator. Defaults to `|`.
 * @returns {string[]} Parsed entries; empty when the field has no value.
 */
export const parseDelimitedField = (field: TextField, separator = '|'): string[] => {
  const raw = field?.value;
  if (!raw) {
    return [];
  }

  return raw
    .split(new RegExp(`${escapeRegExp(separator)}|\\r?\\n`))
    .map((entry) => entry.trim())
    .filter(Boolean);
};

/**
 * Parses a text field into rows of columns, e.g. `A::1::2|B::3::4` becomes `[['A','1','2'],['B','3','4']]`.
 * Line breaks also separate rows, so Multi-Line Text fields can hold one row per line.
 * Empty columns are kept so column positions stay stable.
 *
 * @param {TextField} field Sitecore text field holding the rows.
 * @param {string} rowSeparator Row separator. Defaults to `|`.
 * @param {string} columnSeparator Column separator. Defaults to `::`.
 * @returns {string[][]} Parsed rows; empty when the field has no value.
 */
export const parseRowsField = (field: TextField, rowSeparator = '|', columnSeparator = '::'): string[][] =>
  parseDelimitedField(field, rowSeparator).map((row) => row.split(columnSeparator).map((column) => column.trim()));
