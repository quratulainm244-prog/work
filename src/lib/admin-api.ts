import { supabase } from './supabase';

// ====================================================================
// TYPES
// ====================================================================

export interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  user_id: string | null;
  admin_email: string | null;
  action: string;
  entity: string;
  details: Record<string, any>;
  created_at: string;
}

export interface AdmissionInquiry {
  id: string;
  parent_name: string;
  contact_info: string;
  child_name: string | null;
  child_age: string | null;
  message: string | null;
  status: 'new' | 'reviewed' | 'contacted' | 'enrolled' | 'archived';
  admin_notes: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProgramItem {
  id: string;
  number: string;
  title: string;
  description: string;
  age_group: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  subject: string;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  relationship: string;
  message: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  is_active: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SiteSettingsState {
  branding: {
    schoolName: string;
    fullName: string;
    tagline: string;
    logoUrl: string;
    mascotName: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontHeading: string;
    fontBody: string;
    buttonRadius: number;
  };
  sections: {
    hero: boolean;
    features: boolean;
    about: boolean;
    programs: boolean;
    why: boolean;
    activities: boolean;
    gallery: boolean;
    testimonials: boolean;
    admissions: boolean;
    contact: boolean;
  };
  contact: {
    location: string;
    level: string;
    facebookName: string;
    facebookUrl: string;
    instagramUrl: string;
    whatsappNumber: string;
    email: string;
    phone: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsState = {
  branding: {
    schoolName: "KINDERGARTEN SAADIA'S",
    fullName: "Kindergarten Saadia's Montessori School",
    tagline: "Learn • Grow • Succeed",
    logoUrl: "",
    mascotName: "KSM Mascot",
  },
  theme: {
    primaryColor: "#123f62",
    secondaryColor: "#efa91f",
    accentColor: "#0a1d30",
    backgroundColor: "#ffffff",
    fontHeading: "Spline Sans",
    fontBody: "Inter",
    buttonRadius: 8,
  },
  sections: {
    hero: true,
    features: true,
    about: true,
    programs: true,
    why: true,
    activities: true,
    gallery: true,
    testimonials: true,
    admissions: true,
    contact: true,
  },
  contact: {
    location: "Haripur, Khyber Pakhtunkhwa, Pakistan",
    level: "Primary / Montessori education",
    facebookName: "Kindergarten Saadia's Montessori School",
    facebookUrl: "https://www.facebook.com/Kindergarten786/",
    instagramUrl: "",
    whatsappNumber: "+923000000000",
    email: "info@ksmschool.edu.pk",
    phone: "+92 995 000000",
  },
  seo: {
    metaTitle: "Kindergarten Saadia's Montessori School | Haripur",
    metaDescription: "Nurturing Montessori and primary learning environment in Haripur, Khyber Pakhtunkhwa.",
    keywords: "Montessori school, kindergarten, Haripur, primary school, early childhood education",
  },
};

// ====================================================================
// AUTH & ACCESS CONTROL
// ====================================================================

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function checkIsAdmin(userId?: string): Promise<{ isAdmin: boolean; adminRecord: AdminUser | null }> {
  try {
    let targetUid = userId;
    if (!targetUid) {
      const user = await getCurrentUser();
      if (!user) return { isAdmin: false, adminRecord: null };
      targetUid = user.id;
    }

    const { data, error } = await supabase
      .from('admins')
      .select('id, user_id, created_at')
      .eq('user_id', targetUid)
      .maybeSingle();

    if (error || !data) {
      return { isAdmin: false, adminRecord: null };
    }

    return { isAdmin: true, adminRecord: data as AdminUser };
  } catch {
    return { isAdmin: false, adminRecord: null };
  }
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ====================================================================
// AUDIT LOGGING
// ====================================================================

export async function logAudit(action: string, entity: string, details: Record<string, any> = {}) {
  try {
    const user = await getCurrentUser();
    await supabase.from('admin_audit_logs').insert([
      {
        user_id: user?.id || null,
        admin_email: user?.email || 'admin',
        action,
        entity,
        details,
      },
    ]);
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}

// ====================================================================
// STORAGE: IMAGE UPLOAD & DELETION
// ====================================================================

export async function uploadImageToStorage(
  file: Blob | File,
  folder: 'logos' | 'gallery' | 'teachers' | 'events',
  fileName?: string
): Promise<string> {
  const ext = (file as any).name ? (file as any).name.split('.').pop() : 'png';
  const name = fileName || `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const path = `${folder}/${name}`;

  const { data, error } = await supabase.storage
    .from('school-assets')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('school-assets')
    .getPublicUrl(path);

  await logAudit('upload_image', 'storage', { path, url: publicUrlData.publicUrl });
  return publicUrlData.publicUrl;
}

export async function deleteImageFromStorage(url: string) {
  try {
    // Extract path from public URL
    const marker = '/storage/v1/object/public/school-assets/';
    const index = url.indexOf(marker);
    if (index === -1) return;
    const path = url.substring(index + marker.length);

    await supabase.storage.from('school-assets').remove([path]);
    await logAudit('delete_image', 'storage', { path });
  } catch (err) {
    console.warn('Failed to delete storage asset:', err);
  }
}

// ====================================================================
// CACHING & LOCAL STORAGE UTILITIES
// ====================================================================

function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return fallback;
}

function setLocalCache<T>(key: string, val: T): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }
}

export const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-default-1',
    number: '01',
    title: 'Early Learning',
    description: 'Fun, creative and engaging learning experiences for young children.',
    age_group: '2.5 - 4 Years',
    icon: '🌱',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prog-default-2',
    number: '02',
    title: 'Primary Education',
    description: 'Building strong academic and personal foundations.',
    age_group: '4 - 7 Years',
    icon: '📚',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prog-default-3',
    number: '03',
    title: 'Student Development',
    description: 'Encouraging confidence, creativity and important life skills.',
    age_group: 'All Ages',
    icon: '🌟',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-default-1',
    title: 'Learning Together',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
    category: 'Campus Life',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-default-2',
    title: 'Young Learners',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    category: 'Classroom',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-default-3',
    title: 'Creative Activities',
    image_url: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80',
    category: 'Activities',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-default-4',
    title: 'Classroom Life',
    image_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80',
    category: 'Campus Life',
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-default-1',
    name: 'KSM Parent',
    relationship: 'KSM Parent',
    message: 'A warm and caring environment where children can learn with confidence.',
    rating: 5,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'test-default-2',
    name: 'KSM Family',
    relationship: 'KSM Family',
    message: 'The focus on early development, activities and individual attention makes learning enjoyable.',
    rating: 5,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'test-default-3',
    name: 'KSM Parent',
    relationship: 'KSM Parent',
    message: 'A positive beginning for a child\'s educational journey.',
    rating: 5,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// ====================================================================
// SITE SETTINGS
// ====================================================================

export async function fetchSiteSettings(): Promise<SiteSettingsState> {
  const cached = getLocalCache<SiteSettingsState>('ksm_site_settings_cache', DEFAULT_SITE_SETTINGS);

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (!error && data && data.length > 0) {
      const settings: any = { ...cached };
      data.forEach((row) => {
        if (row.key in settings) {
          settings[row.key] = {
            ...settings[row.key],
            ...row.value,
          };
        }
      });
      setLocalCache('ksm_site_settings_cache', settings);
      return settings as SiteSettingsState;
    }
  } catch (err) {
    console.warn('Error fetching site_settings from Supabase:', err);
  }

  return cached;
}

export async function saveSiteSetting(key: keyof SiteSettingsState, value: any) {
  // 1. Immediately update localStorage cache
  const current = getLocalCache<SiteSettingsState>('ksm_site_settings_cache', DEFAULT_SITE_SETTINGS);
  const updatedSettings: SiteSettingsState = {
    ...current,
    [key]: {
      ...(current as any)[key],
      ...value,
    },
  };
  setLocalCache('ksm_site_settings_cache', updatedSettings);

  // 2. Dispatch event for instant UI update across tabs/screens
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('ksm_settings_updated', {
          detail: { key, value, all: updatedSettings },
        })
      );
    } catch {}
  }

  // 3. Persist to Supabase
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select();

    if (!error) {
      await logAudit('update_setting', 'site_settings', { key, value });
      return data;
    } else {
      // Fallback: try direct update if row already exists
      const { data: updateData, error: updateError } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select();

      if (!updateError && updateData) {
        await logAudit('update_setting', 'site_settings', { key, value });
        return updateData;
      }
      console.warn('Supabase site_settings save warning:', error.message);
    }
  } catch (err: any) {
    console.warn('Failed to sync site_setting to Supabase:', err.message);
  }

  return [updatedSettings];
}

// ====================================================================
// ADMISSIONS / INQUIRIES
// ====================================================================

export async function fetchAdmissions(): Promise<AdmissionInquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AdmissionInquiry[];
}

export async function updateAdmissionStatus(
  id: string,
  status: AdmissionInquiry['status'],
  notes?: string
) {
  const payload: any = { status };
  if (notes !== undefined) payload.admin_notes = notes;

  const { data, error } = await supabase
    .from('inquiries')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;
  await logAudit('update_status', 'inquiries', { id, status });
  return data;
}

export async function deleteAdmission(id: string) {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_inquiry', 'inquiries', { id });
}

// ====================================================================
// CONTACT MESSAGES
// ====================================================================

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ContactMessage[];
}

export async function updateMessageStatus(id: string, status: ContactMessage['status']) {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) throw error;
  await logAudit('update_status', 'contact_messages', { id, status });
  return data;
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_message', 'contact_messages', { id });
}

// ====================================================================
// GALLERY CRUD
// ====================================================================

export async function fetchGallery(adminOnly: boolean = false): Promise<GalleryItem[]> {
  const cached = getLocalCache<GalleryItem[]>('ksm_gallery_cache', DEFAULT_GALLERY);

  try {
    let query = supabase.from('gallery').select('*');
    let res = await query.order('sort_order', { ascending: true });
    if (res.error && (res.error.code === '42703' || res.error.message?.includes('sort_order'))) {
      res = await supabase.from('gallery').select('*').order('created_at', { ascending: true });
    }

    if (!res.error && res.data && res.data.length > 0) {
      const filtered = adminOnly ? res.data : res.data.filter((item: any) => item.is_active !== false);
      const mapped: GalleryItem[] = filtered.map((item: any, idx: number) => ({
        id: item.id || `gal-${idx}`,
        title: item.title || 'KSM Campus Life',
        image_url: item.image_url || '',
        category: item.category || 'Campus Life',
        sort_order: item.sort_order ?? idx + 1,
        is_active: item.is_active !== false,
        created_at: item.created_at || new Date().toISOString(),
      }));
      setLocalCache('ksm_gallery_cache', mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Error fetching gallery:', err);
  }

  return cached;
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>) {
  const newItem: GalleryItem = {
    ...item,
    id: 'gal_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const current = getLocalCache<GalleryItem[]>('ksm_gallery_cache', DEFAULT_GALLERY);
  const updated = [...current, newItem];
  setLocalCache('ksm_gallery_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_gallery_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('gallery').insert([item]).select();
    if (!error && data?.[0]) {
      await logAudit('create_gallery_item', 'gallery', item);
      return data[0] as GalleryItem;
    }
  } catch (err: any) {
    console.warn('Failed to insert gallery item to Supabase:', err.message);
  }

  return newItem;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>) {
  const current = getLocalCache<GalleryItem[]>('ksm_gallery_cache', DEFAULT_GALLERY);
  const updated = current.map((g) => (g.id === id ? { ...g, ...updates } : g));
  setLocalCache('ksm_gallery_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_gallery_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('gallery').update(updates).eq('id', id).select();
    if (!error && data?.[0]) {
      await logAudit('update_gallery_item', 'gallery', { id, updates });
      return data[0] as GalleryItem;
    }
  } catch (err: any) {
    console.warn('Failed to update gallery item in Supabase:', err.message);
  }

  return updated.find((g) => g.id === id) as GalleryItem;
}

export async function deleteGalleryItem(id: string, imageUrl?: string) {
  const current = getLocalCache<GalleryItem[]>('ksm_gallery_cache', DEFAULT_GALLERY);
  const updated = current.filter((g) => g.id !== id);
  setLocalCache('ksm_gallery_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_gallery_updated', { detail: updated }));
    } catch {}
  }

  try {
    await supabase.from('gallery').delete().eq('id', id);
    if (imageUrl) await deleteImageFromStorage(imageUrl);
    await logAudit('delete_gallery_item', 'gallery', { id });
  } catch (err: any) {
    console.warn('Failed to delete gallery item from Supabase:', err.message);
  }
}

// ====================================================================
// PROGRAMS CRUD
// ====================================================================

export async function fetchPrograms(adminOnly: boolean = false): Promise<ProgramItem[]> {
  const cached = getLocalCache<ProgramItem[]>('ksm_programs_cache', DEFAULT_PROGRAMS);

  try {
    let res = await supabase.from('programs').select('*').order('sort_order', { ascending: true });
    if (res.error && (res.error.code === '42703' || res.error.message?.includes('sort_order'))) {
      res = await supabase.from('programs').select('*').order('created_at', { ascending: true });
    }

    if (!res.error && res.data && res.data.length > 0) {
      const filtered = adminOnly ? res.data : res.data.filter((p: any) => p.is_active !== false);
      const mapped: ProgramItem[] = filtered.map((p: any, idx: number) => ({
        id: p.id || `prog-${idx}`,
        number: p.number || String(idx + 1).padStart(2, '0'),
        title: p.title || '',
        description: p.description || '',
        age_group: p.age_group || null,
        icon: p.icon || '🌟',
        sort_order: p.sort_order ?? idx + 1,
        is_active: p.is_active !== false,
        created_at: p.created_at || new Date().toISOString(),
      }));
      setLocalCache('ksm_programs_cache', mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Error fetching programs:', err);
  }

  return cached;
}

export async function createProgram(item: Omit<ProgramItem, 'id' | 'created_at'>) {
  const newItem: ProgramItem = {
    ...item,
    id: 'prog_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const current = getLocalCache<ProgramItem[]>('ksm_programs_cache', DEFAULT_PROGRAMS);
  const updated = [...current, newItem];
  setLocalCache('ksm_programs_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_programs_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('programs').insert([item]).select();
    if (!error && data?.[0]) {
      await logAudit('create_program', 'programs', item);
      return data[0] as ProgramItem;
    }
  } catch (err: any) {
    console.warn('Failed to insert program to Supabase:', err.message);
  }

  return newItem;
}

export async function updateProgram(id: string, updates: Partial<ProgramItem>) {
  const current = getLocalCache<ProgramItem[]>('ksm_programs_cache', DEFAULT_PROGRAMS);
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setLocalCache('ksm_programs_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_programs_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('programs').update(updates).eq('id', id).select();
    if (!error && data?.[0]) {
      await logAudit('update_program', 'programs', { id, updates });
      return data[0] as ProgramItem;
    }
  } catch (err: any) {
    console.warn('Failed to update program in Supabase:', err.message);
  }

  return updated.find((p) => p.id === id) as ProgramItem;
}

export async function deleteProgram(id: string) {
  const current = getLocalCache<ProgramItem[]>('ksm_programs_cache', DEFAULT_PROGRAMS);
  const updated = current.filter((p) => p.id !== id);
  setLocalCache('ksm_programs_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_programs_updated', { detail: updated }));
    } catch {}
  }

  try {
    await supabase.from('programs').delete().eq('id', id);
    await logAudit('delete_program', 'programs', { id });
  } catch (err: any) {
    console.warn('Failed to delete program from Supabase:', err.message);
  }
}

// ====================================================================
// TEACHERS CRUD
// ====================================================================

export async function fetchTeachers(adminOnly: boolean = false): Promise<TeacherItem[]> {
  try {
    let res = await supabase.from('teachers').select('*').order('sort_order', { ascending: true });
    if (res.error && (res.error.code === '42703' || res.error.message?.includes('sort_order'))) {
      res = await supabase.from('teachers').select('*').order('created_at', { ascending: true });
    }

    if (!res.error && res.data) {
      return res.data as TeacherItem[];
    }
  } catch (err) {
    console.warn('Error fetching teachers:', err);
  }
  return [];
}

export async function createTeacher(item: Omit<TeacherItem, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase.from('teachers').insert([item]).select();
    if (error) throw error;
    await logAudit('create_teacher', 'teachers', item);
    return data?.[0] as TeacherItem;
  } catch (err: any) {
    console.warn('Failed to create teacher:', err.message);
    return null;
  }
}

export async function updateTeacher(id: string, updates: Partial<TeacherItem>) {
  try {
    const { data, error } = await supabase.from('teachers').update(updates).eq('id', id).select();
    if (error) throw error;
    await logAudit('update_teacher', 'teachers', { id, updates });
    return data?.[0] as TeacherItem;
  } catch (err: any) {
    console.warn('Failed to update teacher:', err.message);
    return null;
  }
}

export async function deleteTeacher(id: string, photoUrl?: string | null) {
  try {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;
    if (photoUrl) await deleteImageFromStorage(photoUrl);
    await logAudit('delete_teacher', 'teachers', { id });
  } catch (err: any) {
    console.warn('Failed to delete teacher:', err.message);
  }
}

// ====================================================================
// TESTIMONIALS CRUD
// ====================================================================

export async function fetchTestimonials(adminOnly: boolean = false): Promise<TestimonialItem[]> {
  const cached = getLocalCache<TestimonialItem[]>('ksm_testimonials_cache', DEFAULT_TESTIMONIALS);

  try {
    let res = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    if (res.error && (res.error.code === '42703' || res.error.message?.includes('sort_order'))) {
      res = await supabase.from('testimonials').select('*').order('created_at', { ascending: true });
    }

    if (!res.error && res.data && res.data.length > 0) {
      const filtered = adminOnly ? res.data : res.data.filter((t: any) => t.is_active !== false);
      const mapped: TestimonialItem[] = filtered.map((t: any, idx: number) => ({
        id: t.id || `test-${idx}`,
        name: t.name || 'KSM Parent',
        relationship: t.relationship || 'KSM Parent',
        message: t.message || '',
        rating: t.rating ?? 5,
        sort_order: t.sort_order ?? idx + 1,
        is_active: t.is_active !== false,
        created_at: t.created_at || new Date().toISOString(),
      }));
      setLocalCache('ksm_testimonials_cache', mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Error fetching testimonials:', err);
  }

  return cached;
}

export async function createTestimonial(item: Omit<TestimonialItem, 'id' | 'created_at'>) {
  const newItem: TestimonialItem = {
    ...item,
    id: 'test_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const current = getLocalCache<TestimonialItem[]>('ksm_testimonials_cache', DEFAULT_TESTIMONIALS);
  const updated = [...current, newItem];
  setLocalCache('ksm_testimonials_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_testimonials_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('testimonials').insert([item]).select();
    if (!error && data?.[0]) {
      await logAudit('create_testimonial', 'testimonials', item);
      return data[0] as TestimonialItem;
    }
  } catch (err: any) {
    console.warn('Failed to insert testimonial to Supabase:', err.message);
  }

  return newItem;
}

export async function updateTestimonial(id: string, updates: Partial<TestimonialItem>) {
  const current = getLocalCache<TestimonialItem[]>('ksm_testimonials_cache', DEFAULT_TESTIMONIALS);
  const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
  setLocalCache('ksm_testimonials_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_testimonials_updated', { detail: updated }));
    } catch {}
  }

  try {
    const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select();
    if (!error && data?.[0]) {
      await logAudit('update_testimonial', 'testimonials', { id, updates });
      return data[0] as TestimonialItem;
    }
  } catch (err: any) {
    console.warn('Failed to update testimonial in Supabase:', err.message);
  }

  return updated.find((t) => t.id === id) as TestimonialItem;
}

export async function deleteTestimonial(id: string) {
  const current = getLocalCache<TestimonialItem[]>('ksm_testimonials_cache', DEFAULT_TESTIMONIALS);
  const updated = current.filter((t) => t.id !== id);
  setLocalCache('ksm_testimonials_cache', updated);

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ksm_testimonials_updated', { detail: updated }));
    } catch {}
  }

  try {
    await supabase.from('testimonials').delete().eq('id', id);
    await logAudit('delete_testimonial', 'testimonials', { id });
  } catch (err: any) {
    console.warn('Failed to delete testimonial from Supabase:', err.message);
  }
}

// ====================================================================
// NOTICES & ANNOUNCEMENTS CRUD
// ====================================================================

export async function fetchNotices(adminOnly: boolean = false): Promise<NoticeItem[]> {
  try {
    let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
    const { data, error } = await query;
    if (!error && data) {
      if (!adminOnly) {
        return data.filter((n: any) => n.is_active !== false) as NoticeItem[];
      }
      return data as NoticeItem[];
    }
  } catch (err) {
    console.warn('Error fetching notices:', err);
  }
  return [];
}

export async function createNotice(item: Omit<NoticeItem, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase.from('notices').insert([item]).select();
    if (error) throw error;
    await logAudit('create_notice', 'notices', item);
    return data?.[0] as NoticeItem;
  } catch (err: any) {
    console.warn('Failed to create notice:', err.message);
    return null;
  }
}

export async function updateNotice(id: string, updates: Partial<NoticeItem>) {
  try {
    const { data, error } = await supabase.from('notices').update(updates).eq('id', id).select();
    if (error) throw error;
    await logAudit('update_notice', 'notices', { id, updates });
    return data?.[0] as NoticeItem;
  } catch (err: any) {
    console.warn('Failed to update notice:', err.message);
    return null;
  }
}

export async function deleteNotice(id: string) {
  try {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) throw error;
    await logAudit('delete_notice', 'notices', { id });
  } catch (err: any) {
    console.warn('Failed to delete notice:', err.message);
  }
}

// ====================================================================
// EVENTS & CALENDAR CRUD
// ====================================================================

export async function fetchEvents(adminOnly: boolean = false): Promise<EventItem[]> {
  let query = supabase.from('events').select('*').order('event_date', { ascending: true });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as EventItem[];
}

export async function createEvent(item: Omit<EventItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('events').insert([item]).select();
  if (error) throw error;
  await logAudit('create_event', 'events', item);
  return data?.[0] as EventItem;
}

export async function updateEvent(id: string, updates: Partial<EventItem>) {
  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_event', 'events', { id, updates });
  return data?.[0] as EventItem;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_event', 'events', { id });
}

// ====================================================================
// ADMIN USERS & AUDIT LOGS
// ====================================================================

export async function fetchAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase.from('admins').select('id, user_id, created_at').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as AdminUser[];
}

export async function addAdminUser(userId: string) {
  const { data, error } = await supabase
    .from('admins')
    .insert([{ user_id: userId.trim() }])
    .select('id, user_id, created_at');

  if (error) throw error;
  await logAudit('add_admin', 'admins', { user_id: userId.trim() });
  return data?.[0] as AdminUser;
}

export async function removeAdminUser(id: string) {
  const { error } = await supabase.from('admins').delete().eq('id', id);
  if (error) throw error;
  await logAudit('remove_admin', 'admins', { id });
}

export async function fetchAuditLogs(): Promise<AdminAuditLog[]> {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data as AdminAuditLog[];
}
