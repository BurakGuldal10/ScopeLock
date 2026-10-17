import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { getSignoffByToken } from '@/app/actions/client-signoff';
import { SignoffDocument } from '@/components/pdf/signoff-document';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const signoff = await getSignoffByToken(token);

    if (!signoff) {
      return new NextResponse('Belge bulunamadı.', { status: 404 });
    }

    // Render PDF buffer using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      React.createElement(SignoffDocument, { signoff })
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="ScopeLock-Onay-${token.substring(0, 8)}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return new NextResponse(
      `PDF belgesi oluşturulurken bir hata oluştu: ${error.message}`,
      { status: 500 }
    );
  }
}
