import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeBulkImportItems } from '@/lib/bulk-import-shared';

/**
 * POST /api/twojastara/pages/bulk-import/validate
 * Same body as bulk-import: { items: [...] } or JSON array.
 * Returns analysis without creating rows (static repo route, duplicate in file, exists in DB, invalid).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : Array.isArray(body) ? body : [];

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items. Provide { items: [...] } or a JSON array.' },
        { status: 400 }
      );
    }

    const rows = await analyzeBulkImportItems(prisma, items);

    const toImport = rows.filter((r) => r.status === 'import').length;
    const skippedExists = rows.filter((r) => r.status === 'skipped_exists').length;
    const skippedStatic = rows.filter((r) => r.status === 'skipped_static_calculator').length;
    const skippedDup = rows.filter((r) => r.status === 'skipped_duplicate_in_file').length;
    const errors = rows.filter((r) => r.status === 'error');

    return NextResponse.json({
      ok: true,
      summary: {
        total: rows.length,
        toImport,
        skippedExists,
        skippedStaticCalculator: skippedStatic,
        skippedDuplicateInFile: skippedDup,
        errors: errors.length,
      },
      rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed';
    console.error('POST /api/twojastara/pages/bulk-import/validate:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
