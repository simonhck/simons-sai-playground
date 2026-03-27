/**
 * Timed Preview — Override Store Endpoint (App Router variant for Content SDK)
 *
 * POST /api/timed-preview/store
 *
 * Accepts a JSON body with field-level overrides from the Timed Preview
 * Marketplace App and stores them in the in-memory override store.
 * Returns a one-time-use retrieval key that the page-props plugin
 * will consume during the subsequent editing render.
 *
 * Request body:
 *   {
 *     "fieldOverrides": {
 *       "<normalised-component-uid>": { "<FieldName>": "<raw-sitecore-value>", ... },
 *       ...
 *     }
 *   }
 *
 * Response:
 *   { "key": "<uuid>" }
 */

import { NextRequest, NextResponse } from "next/server";
import { storeOverrides } from "src/lib/timed-preview/override-store";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Validate shared editing secret ─────────────────────────────────────
  const secret =
    request.headers.get("x-editing-secret") ?? undefined;

  const editingSecret = process.env.JSS_EDITING_SECRET;
  if (!editingSecret || secret !== editingSecret) {
    // Also check body
    const body = await request.clone().json().catch(() => ({}));
    if (body?.secret !== editingSecret) {
      return NextResponse.json(
        { error: "Unauthorized — invalid editing secret" },
        { status: 401 }
      );
    }
  }

  // ── Store the overrides ────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}));
  const { fieldOverrides } = body as {
    fieldOverrides?: Record<string, Record<string, string>>;
  };

  if (!fieldOverrides || Object.keys(fieldOverrides).length === 0) {
    return NextResponse.json(
      { error: "Missing or empty fieldOverrides" },
      { status: 400 }
    );
  }

  const key = storeOverrides(fieldOverrides);
  return NextResponse.json({ key });
}
