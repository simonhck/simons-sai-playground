import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { setCachedPageParams, SiteInfo } from '@sitecore-content-sdk/nextjs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import sites from '.sitecore/sites.json';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import { getSitecorePage } from 'src/lib/cache/get-sitecore-page';
import { BUILD_VALIDATION_SITE, isBuildValidationSite } from 'src/lib/sitecore-build-validation';
import { buildPageMetadata, getCanonicalUrl, getPageDescription, getPageTitle } from 'src/lib/page-seo';
import { JsonLd } from 'src/lib/structured-data/JsonLd';
import { buildWebPageSchema } from 'src/lib/structured-data/schema';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type PageProps = {
  params: Promise<{ site: string; locale: string; path?: string[]; [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;

  if (isBuildValidationSite(site)) {
    setCachedPageParams({ site, locale });
    notFound();
  }

  // Cached fetch first so missing routes can notFound() without dynamic APIs in the ancestor tree.
  const cachedPage = await getSitecorePage({ site, locale, path: path ?? [] });

  if (!cachedPage) {
    setCachedPageParams({ site, locale });
    notFound();
  }

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  const draft = await draftMode();

  // Fetch the page data from Sitecore; preview and Design Library reads must stay uncached
  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview(editingParams);
    }
  } else {
    page = cachedPage;
  }

  // If the page is not found, return a 404
  if (!page) {
    setCachedPageParams({ site, locale });
    notFound();
  }

  // Structured data describes the published page, so it's left out while editing.
  const renderStructuredData = !page.mode.isEditing && !page.mode.isDesignLibrary;

  return (
    <NextIntlClientProvider>
      {renderStructuredData && (
        <JsonLd
          data={buildWebPageSchema({
            name: getPageTitle(page),
            url: getCanonicalUrl(page),
            description: getPageDescription(page),
          })}
        />
      )}
      <Providers page={page}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
// Cache Components forbids returning [], so a build-only placeholder site is returned when static paths are disabled.
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    return await client.getAppRouterStaticParams(
      sites.map((site: SiteInfo) => site.name),
      routing.locales.slice()
    );
  }
  return [
    {
      site: BUILD_VALIDATION_SITE,
      locale: routing.defaultLocale || scConfig.defaultLanguage,
      path: [],
    },
  ];
};

// Metadata fields for the page. Mirrors the Page draft-mode branching so the <title> matches the body.
export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const { path, site, locale } = await params;

  if (isBuildValidationSite(site)) {
    return { title: 'Page' };
  }

  const draft = await draftMode();

  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview(editingParams);
    }
  } else {
    page = await getSitecorePage({ site, locale, path: path ?? [] });
  }

  return page ? buildPageMetadata(page) : { title: 'Page' };
};
