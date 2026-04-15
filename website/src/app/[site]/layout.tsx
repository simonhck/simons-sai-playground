import { draftMode } from "next/headers";
import Bootstrap from "src/Bootstrap";

export default async function SiteLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const { isEnabled } = await draftMode();

  return (
    <>
      <Bootstrap siteName={site} isPreviewMode={isEnabled} />
      {children}
    </>
  );
}
