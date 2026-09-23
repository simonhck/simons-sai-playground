import { JSX } from 'react';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { getRenderingAttributes } from 'lib/component-props/rendering-helpers';
import { getSitecoreNavigation, NavigationLink } from 'lib/cache/get-sitecore-navigation';

type HeaderProps = ComponentProps;

/**
 * Normalizes a URL path for comparison (lowercase, no trailing slash).
 *
 * @param {string | null | undefined} path URL path.
 * @returns {string} Normalized path; `/` for empty input.
 */
const normalizePath = (path: string | null | undefined): string => {
  const trimmed = (path || '/').toLowerCase().replace(/\/+$/, '');
  return trimmed || '/';
};

/**
 * Loads the navigation, falling back to an empty list so a failing Edge call never breaks the page.
 *
 * @param {string} site Site name.
 * @param {string} locale Page locale.
 * @returns {Promise<NavigationLink[]>} Navigation links, or an empty list on failure.
 */
const loadNavigation = async (site: string, locale: string): Promise<NavigationLink[]> => {
  try {
    return await getSitecoreNavigation({ site, locale });
  } catch (error) {
    console.error(`Header: failed to load navigation for site "${site}" (${locale})`, error);
    return [];
  }
};

/**
 * Site header with the site name and a flat main navigation built from the home item's child pages.
 * Needs no datasource.
 *
 * @param {HeaderProps} props Component props.
 * @returns {Promise<JSX.Element>} Rendered header.
 */
export const Default = async ({ page, params }: HeaderProps): Promise<JSX.Element> => {
  const site = page.siteName;
  const links = site ? await loadNavigation(site, page.locale) : [];
  const currentPath = normalizePath(page.layout.sitecore.context.itemPath);

  return (
    <div
      {...getRenderingAttributes(params)}
      className={`border-b border-black/10 bg-white ${params?.styles || ''}`.trim()}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700">
          {site || 'Home'}
        </Link>

        {links.length > 0 ? (
          <nav aria-label="Main">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {links.map((link) => {
                const isActive = normalizePath(link.href) === currentPath;
                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                        isActive ? 'text-slate-900 underline underline-offset-4' : 'text-slate-600'
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : (
          page.mode.isEditing && (
            <p className="text-sm text-slate-500">
              Navigation is empty: add pages directly below the Home item and publish them.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Default;
