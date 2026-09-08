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
// SITE SETTINGS
// ====================================================================

export async function fetchSiteSettings(): Promise<SiteSettingsState> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data || data.length === 0) {
      return DEFAULT_SITE_SETTINGS;
    }

    const settings: any = { ...DEFAULT_SITE_SETTINGS };
    data.forEach((row) => {
      if (row.key in settings) {
        settings[row.key] = {
          ...settings[row.key],
          ...row.value,
        };
      }
    });

    return settings as SiteSettingsState;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSetting(key: keyof SiteSettingsState, value: any) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })
    .select();

  if (error) throw error;
  await logAudit('update_setting', 'site_settings', { key, value });
  return data;
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
  let query = supabase.from('gallery').select('*').order('sort_order', { ascending: true });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as GalleryItem[];
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('gallery').insert([item]).select();
  if (error) throw error;
  await logAudit('create_gallery_item', 'gallery', item);
  return data?.[0] as GalleryItem;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>) {
  const { data, error } = await supabase.from('gallery').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_gallery_item', 'gallery', { id, updates });
  return data?.[0] as GalleryItem;
}

export async function deleteGalleryItem(id: string, imageUrl?: string) {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
  if (imageUrl) await deleteImageFromStorage(imageUrl);
  await logAudit('delete_gallery_item', 'gallery', { id });
}

// ====================================================================
// PROGRAMS CRUD
// ====================================================================

export async function fetchPrograms(adminOnly: boolean = false): Promise<ProgramItem[]> {
  let query = supabase.from('programs').select('*').order('sort_order', { ascending: true });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as ProgramItem[];
}

export async function createProgram(item: Omit<ProgramItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('programs').insert([item]).select();
  if (error) throw error;
  await logAudit('create_program', 'programs', item);
  return data?.[0] as ProgramItem;
}

export async function updateProgram(id: string, updates: Partial<ProgramItem>) {
  const { data, error } = await supabase.from('programs').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_program', 'programs', { id, updates });
  return data?.[0] as ProgramItem;
}

export async function deleteProgram(id: string) {
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_program', 'programs', { id });
}

// ====================================================================
// TEACHERS CRUD
// ====================================================================

export async function fetchTeachers(adminOnly: boolean = false): Promise<TeacherItem[]> {
  let query = supabase.from('teachers').select('*').order('sort_order', { ascending: true });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as TeacherItem[];
}

export async function createTeacher(item: Omit<TeacherItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('teachers').insert([item]).select();
  if (error) throw error;
  await logAudit('create_teacher', 'teachers', item);
  return data?.[0] as TeacherItem;
}

export async function updateTeacher(id: string, updates: Partial<TeacherItem>) {
  const { data, error } = await supabase.from('teachers').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_teacher', 'teachers', { id, updates });
  return data?.[0] as TeacherItem;
}

export async function deleteTeacher(id: string, photoUrl?: string | null) {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) throw error;
  if (photoUrl) await deleteImageFromStorage(photoUrl);
  await logAudit('delete_teacher', 'teachers', { id });
}

// ====================================================================
// TESTIMONIALS CRUD
// ====================================================================

export async function fetchTestimonials(adminOnly: boolean = false): Promise<TestimonialItem[]> {
  let query = supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as TestimonialItem[];
}

export async function createTestimonial(item: Omit<TestimonialItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('testimonials').insert([item]).select();
  if (error) throw error;
  await logAudit('create_testimonial', 'testimonials', item);
  return data?.[0] as TestimonialItem;
}

export async function updateTestimonial(id: string, updates: Partial<TestimonialItem>) {
  const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_testimonial', 'testimonials', { id, updates });
  return data?.[0] as TestimonialItem;
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_testimonial', 'testimonials', { id });
}

// ====================================================================
// NOTICES & ANNOUNCEMENTS CRUD
// ====================================================================

export async function fetchNotices(adminOnly: boolean = false): Promise<NoticeItem[]> {
  let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
  if (!adminOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as NoticeItem[];
}

export async function createNotice(item: Omit<NoticeItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('notices').insert([item]).select();
  if (error) throw error;
  await logAudit('create_notice', 'notices', item);
  return data?.[0] as NoticeItem;
}

export async function updateNotice(id: string, updates: Partial<NoticeItem>) {
  const { data, error } = await supabase.from('notices').update(updates).eq('id', id).select();
  if (error) throw error;
  await logAudit('update_notice', 'notices', { id, updates });
  return data?.[0] as NoticeItem;
}

export async function deleteNotice(id: string) {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw error;
  await logAudit('delete_notice', 'notices', { id });
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
