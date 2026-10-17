'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err: any) {
    return { error: err.message || 'Giriş yapılamadı.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const agencyName = formData.get('agency_name') as string;

  if (!email || !password || !agencyName) {
    return { error: 'Tüm alanları doldurmanız gerekmektedir.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          agency_name: agencyName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err: any) {
    return { error: err.message || 'Kayıt oluşturulamadı.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignored
  }
  redirect('/login');
}
