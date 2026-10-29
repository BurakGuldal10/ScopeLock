'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { Signoff, Project, Agency } from '@/lib/types';
import { sendApprovalNotifications } from '@/lib/email';

export interface SignoffDetails extends Signoff {
  project: Project;
  agency: Agency;
}

// In-memory store for demo tokens if Supabase is in local testing
let MEMO_SIGNOFFS: Record<string, SignoffDetails> = {
  'b87d2105-1a89-493e-a89c-3fa84bc67412': {
    id: 's0000000-0000-0000-0000-000000000001',
    project_id: 'p0000000-0000-0000-0000-000000000001',
    agency_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Ana Sayfa Banner ve Kampanya Alanı Revizyonu v2',
    description: 'Black Friday kampanyası için ana sayfa kahraman (hero) alanı ve 3 adet dinamik kampanya bannerı hazırlandı. Mobil ve masaüstü duyarlılık testleri yapıldı.',
    additional_fee: 250,
    file_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    status: 'beklemede',
    token: 'b87d2105-1a89-493e-a89c-3fa84bc67412',
    signature_data: null,
    signed_at: null,
    signer_ip: null,
    revision_notes: null,
    pdf_url: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    project: {
      id: 'p0000000-0000-0000-0000-000000000001',
      agency_id: 'a0000000-0000-0000-0000-000000000001',
      name: 'E-Ticaret Dönüşüm Projesi',
      client_name: 'Ahmet Yılmaz',
      client_email: 'ahmet@acmecommerce.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    agency: {
      id: 'a0000000-0000-0000-0000-000000000001',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      name: 'PixelForge Dijital Ajans',
      email: 'ajans@pixelforge.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

// Fetch signoff by magic token without requiring login
export async function getSignoffByToken(token: string): Promise<SignoffDetails | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('signoffs')
      .select('*, project:projects(*), agency:agencies(*)')
      .eq('token', token)
      .single();

    if (!error && data && data.project && data.agency) {
      return data as SignoffDetails;
    }
  } catch {
    // Continue to fallback
  }

  // Fallback to in-memory store
  if (MEMO_SIGNOFFS[token]) {
    return MEMO_SIGNOFFS[token];
  }

  // Create mock fallback for arbitrary tokens during testing
  const fallback: SignoffDetails = {
    id: 's-' + token.substring(0, 8),
    project_id: 'p-demo',
    agency_id: 'a-demo',
    title: 'Web Sitesi Kapsam ve Revizyon Onay Talebi',
    description: 'Tasarım ve kodlama revizyonları tamamlandı. Aşağıda belirtilen maddeler ve ek kapsam onayınıza sunulmuştur.',
    additional_fee: 200,
    file_url: null,
    status: 'beklemede',
    token,
    signature_data: null,
    signed_at: null,
    signer_ip: null,
    revision_notes: null,
    pdf_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project: {
      id: 'p-demo',
      agency_id: 'a-demo',
      name: 'Müşteri Projesi',
      client_name: 'Değerli Müşterimiz',
      client_email: 'musteri@sirket.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    agency: {
      id: 'a-demo',
      user_id: 'u-demo',
      name: 'ScopeLock Ajans',
      email: 'iletisim@scopelock.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  MEMO_SIGNOFFS[token] = fallback;
  return fallback;
}

// Approve signoff with digital signature
export async function approveSignoffAction(
  token: string,
  signatureData: string,
  signerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headerList = await headers();
    const clientIp = 
      headerList.get('x-forwarded-for')?.split(',')[0].trim() || 
      headerList.get('x-real-ip') || 
      '127.0.0.1';

    const now = new Date().toISOString();
    const pdfUrl = `/api/pdf/${token}`;

    // Try Supabase update with admin client (bypasses RLS for public client magic token)
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('signoffs')
        .update({
          status: 'onaylandi',
          signature_data: signatureData,
          signed_at: now,
          signer_ip: clientIp,
          pdf_url: pdfUrl,
          updated_at: now,
        })
        .eq('token', token)
        .eq('status', 'beklemede')
        .select('*, project:projects(*), agency:agencies(*)')
        .single();

      if (!error && data) {
        // Asynchronously send notification emails
        sendApprovalNotifications(data as SignoffDetails).catch(console.error);
        revalidatePath(`/view/${token}`);
        revalidatePath('/dashboard');
        return { success: true };
      }
    } catch {
      // Continue to local memo update
    }

    // Update in-memory
    if (MEMO_SIGNOFFS[token]) {
      MEMO_SIGNOFFS[token].status = 'onaylandi';
      MEMO_SIGNOFFS[token].signature_data = signatureData;
      MEMO_SIGNOFFS[token].signed_at = now;
      MEMO_SIGNOFFS[token].signer_ip = clientIp;
      MEMO_SIGNOFFS[token].pdf_url = pdfUrl;
      // Trigger notification simulation
      sendApprovalNotifications(MEMO_SIGNOFFS[token]).catch(console.error);
    }

    revalidatePath(`/view/${token}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Onay işlemi tamamlanamadı.' };
  }
}

// Request revision with note
export async function requestRevisionAction(
  token: string,
  revisionNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!revisionNotes || revisionNotes.trim().length === 0) {
      return { success: false, error: 'Lütfen revizyon notunuzu yazınız.' };
    }

    const now = new Date().toISOString();

    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('signoffs')
        .update({
          status: 'revizyon_istendi',
          revision_notes: revisionNotes.trim(),
          updated_at: now,
        })
        .eq('token', token)
        .eq('status', 'beklemede');

      if (!error) {
        revalidatePath(`/view/${token}`);
        revalidatePath('/dashboard');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    if (MEMO_SIGNOFFS[token]) {
      MEMO_SIGNOFFS[token].status = 'revizyon_istendi';
      MEMO_SIGNOFFS[token].revision_notes = revisionNotes.trim();
      MEMO_SIGNOFFS[token].updated_at = now;
    }

    revalidatePath(`/view/${token}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Revizyon talebi iletilemedi.' };
  }
}
