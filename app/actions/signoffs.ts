'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Signoff, Project, Agency } from '@/lib/types';

// Demo data for instant testing / preview when Supabase is in local setup
const DEMO_AGENCY: Agency = {
  id: 'a0000000-0000-0000-0000-000000000001',
  user_id: 'u0000000-0000-0000-0000-000000000001',
  name: 'PixelForge Ajans',
  email: 'ajans@pixelforge.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_PROJECTS: Project[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    agency_id: DEMO_AGENCY.id,
    name: 'E-Ticaret Dönüşüm Projesi',
    client_name: 'Ahmet Yılmaz',
    client_email: 'ahmet@acmecommerce.com',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    agency_id: DEMO_AGENCY.id,
    name: 'Mobil Uygulama Tasarımı',
    client_name: 'Selin Kaya',
    client_email: 'selin@techstart.io',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEMO_SIGNOFFS: (Signoff & { project: Project })[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    project_id: DEMO_PROJECTS[0].id,
    agency_id: DEMO_AGENCY.id,
    title: 'Ana Sayfa Banner ve Kampanya Alanı Revizyonu v2',
    description: 'Black Friday kampanyası için ana sayfa kahraman (hero) alanı ve 3 adet dinamik kampanya bannerı hazırlandı. Mobil ve masaüstü duyarlılık testleri yapıldı.',
    additional_fee: 250,
    file_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    status: 'beklemede',
    token: 'b87d2105-1a89-493e-a89c-3fa84bc67412',
    signature_data: null,
    signed_at: null,
    signer_ip: null,
    revision_notes: null,
    pdf_url: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    project: DEMO_PROJECTS[0],
  },
  {
    id: 's0000000-0000-0000-0000-000000000002',
    project_id: DEMO_PROJECTS[1].id,
    agency_id: DEMO_AGENCY.id,
    title: 'Onboarding Adımları & İki Aşamalı Doğrulama Ekranları',
    description: 'Kullanıcı karşılama akışına SMS doğrulama ve profil tamamlama adımları eklendi. Figma tasarım spesifikasyonları güncellendi.',
    additional_fee: 400,
    file_url: null,
    status: 'onaylandi',
    token: 'f41e9821-4d32-474e-9b62-9e4a3b7c8e11',
    signature_data: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJncmVlbiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJ5ZWxsb3ciIC8+PC9zdmc+',
    signed_at: new Date(Date.now() - 86400000).toISOString(),
    signer_ip: '88.241.12.94',
    revision_notes: null,
    pdf_url: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    project: DEMO_PROJECTS[1],
  },
];

// Helper to get or create current agency
export async function getCurrentAgency(): Promise<Agency | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return DEMO_AGENCY;
    }

    const { data: agency, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Auto-create agency for new user
      const { data: newAgency, error: insertError } = await supabase
        .from('agencies')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.agency_name || user.email?.split('@')[0] + ' Ajans',
          email: user.email!,
        })
        .select()
        .single();

      if (!insertError && newAgency) return newAgency;
    }

    return agency || DEMO_AGENCY;
  } catch {
    return DEMO_AGENCY;
  }
}

// Fetch all projects for the agency
export async function getProjects(): Promise<Project[]> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) return DEMO_PROJECTS;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEMO_PROJECTS;
    }

    return data;
  } catch {
    return DEMO_PROJECTS;
  }
}

// Fetch all signoffs with project details
export async function getSignoffs(): Promise<(Signoff & { project: Project })[]> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) return DEMO_SIGNOFFS;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('signoffs')
      .select('*, project:projects(*)')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEMO_SIGNOFFS;
    }

    return data as (Signoff & { project: Project })[];
  } catch {
    return DEMO_SIGNOFFS;
  }
}

// Create a new project
export async function createProject(formData: FormData): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const name = formData.get('name') as string;
    const client_name = formData.get('client_name') as string;
    const client_email = formData.get('client_email') as string;

    if (!name || !client_name || !client_email) {
      return { success: false, error: 'Tüm alanları doldurmanız gerekmektedir.' };
    }

    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Ajans bilgisi bulunamadı.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        agency_id: agency.id,
        name,
        client_name,
        client_email,
      })
      .select()
      .single();

    if (error) {
      // In demo mode fallback
      const newProj: Project = {
        id: 'p-' + Math.random().toString(36).substring(2, 9),
        agency_id: agency.id,
        name,
        client_name,
        client_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      DEMO_PROJECTS.unshift(newProj);
      revalidatePath('/dashboard');
      return { success: true, project: newProj };
    }

    revalidatePath('/dashboard');
    return { success: true, project: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Proje oluşturulamadı.' };
  }
}

// Create a new signoff request and generate unique magic link token
export async function createSignoff(formData: FormData): Promise<{ success: boolean; token?: string; signoff?: Signoff; error?: string }> {
  try {
    const project_id = formData.get('project_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const additional_fee = parseFloat((formData.get('additional_fee') as string) || '0');
    const file_url = (formData.get('file_url') as string) || null;

    if (!project_id || !title || !description) {
      return { success: false, error: 'Başlık, açıklama ve proje seçimi zorunludur.' };
    }

    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Ajans bilgisi bulunamadı.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('signoffs')
      .insert({
        project_id,
        agency_id: agency.id,
        title,
        description,
        additional_fee,
        file_url,
        status: 'beklemede',
      })
      .select('*, project:projects(*)')
      .single();

    if (error) {
      // Fallback for mock/local demo environment
      const generatedToken = crypto.randomUUID();
      const project = DEMO_PROJECTS.find(p => p.id === project_id) || DEMO_PROJECTS[0];
      const newSignoff: Signoff & { project: Project } = {
        id: 's-' + Math.random().toString(36).substring(2, 9),
        project_id,
        agency_id: agency.id,
        title,
        description,
        additional_fee,
        file_url,
        status: 'beklemede',
        token: generatedToken,
        signature_data: null,
        signed_at: null,
        signer_ip: null,
        revision_notes: null,
        pdf_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project,
      };
      DEMO_SIGNOFFS.unshift(newSignoff);
      revalidatePath('/dashboard');
      return { success: true, token: generatedToken, signoff: newSignoff };
    }

    revalidatePath('/dashboard');
    return { success: true, token: data.token, signoff: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Onay talebi oluşturulamadı.' };
  }
}
