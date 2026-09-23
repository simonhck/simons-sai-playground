'use client';
import Link from 'next/link';

/**
 * Last-resort error boundary that replaces the root layout.
 *
 * It is a Client Component, so it must not import `src/Layout` or `.sitecore/component-map`: those pull server
 * components and Cache Components helpers (`'use cache'`) into the browser bundle, which fails the build.
 * See "Enable Cache Components" in the Content SDK docs. It therefore renders a static page instead of the
 * Sitecore-managed server error page.
 *
 * @param {{ reset: () => void }} props Next.js error boundary props.
 * @returns {JSX.Element} Static server error page.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: 10 }}>
          <h1>500 Internal Server Error</h1>
          <p>There is a problem with the resource you are looking for, and it cannot be displayed.</p>
          <p>
            <button type="button" onClick={() => reset()}>
              Try again
            </button>{' '}
            or <Link href="/">go to the Home page</Link>.
          </p>
        </div>
      </body>
    </html>
  );
}
