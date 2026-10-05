import { createClient } from '../../lib/supabase/client';

// Hardcoded fallback list for local development / quick setup
const DEFAULT_SUPER_ADMIN_EMAILS = [
  'rwinjember@gmail.com',
  '4bangboy9999@gmail.com',
];

export const isSuperAdmin = async (email?: string | null): Promise<boolean> => {
  console.log('Checking super admin for email:', email);
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check fallback/hardcoded list first
  if (DEFAULT_SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    console.log('Found in fallback super admin list!');
    return true;
  }

  // 2. Check environment variable VITE_SUPER_ADMIN_EMAILS if provided
  const envSuperAdmins = import.meta.env.VITE_SUPER_ADMIN_EMAILS;
  if (envSuperAdmins) {
    const adminList = envSuperAdmins.split(',').map((e: string) => e.trim().toLowerCase());
    if (adminList.includes(normalizedEmail)) {
      return true;
    }
  }

  // 3. Fallback to Supabase super_admins table query
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('super_admins')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
};
