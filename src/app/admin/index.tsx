import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  AdminAuditLog,
  AdmissionInquiry,
  checkIsAdmin,
  ContactMessage,
  EventItem,
  fetchAdmissions,
  fetchAdmins,
  fetchAuditLogs,
  fetchContactMessages,
  fetchEvents,
  fetchGallery,
  fetchNotices,
  fetchPrograms,
  fetchTeachers,
  fetchTestimonials,
  GalleryItem,
  NoticeItem,
  ProgramItem,
  TeacherItem,
  TestimonialItem,
} from '@/lib/admin-api';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';

// Sub modules
import { OverviewModule } from '@/components/admin/modules/OverviewModule';
import { LogoAndBrandingModule } from '@/components/admin/modules/LogoAndBrandingModule';
import { ThemeDesignModule } from '@/components/admin/modules/ThemeDesignModule';
import { SectionsManagerModule } from '@/components/admin/modules/SectionsManagerModule';
import { AdmissionsModule } from '@/components/admin/modules/AdmissionsModule';
import { ContactMessagesModule } from '@/components/admin/modules/ContactMessagesModule';
import { GalleryModule } from '@/components/admin/modules/GalleryModule';
import { ProgramsModule } from '@/components/admin/modules/ProgramsModule';
import { TeachersModule } from '@/components/admin/modules/TeachersModule';
import { TestimonialsModule } from '@/components/admin/modules/TestimonialsModule';
import { NoticesEventsModule } from '@/components/admin/modules/NoticesEventsModule';
import { ContactSocialModule } from '@/components/admin/modules/ContactSocialModule';
import { SeoNavFooterModule } from '@/components/admin/modules/SeoNavFooterModule';
import { AdminUsersModule } from '@/components/admin/modules/AdminUsersModule';
import { ActivityLogsModule } from '@/components/admin/modules/ActivityLogsModule';

export default function AdminScreen() {
  const router = useRouter();
  const { settings, reloadSettings } = useSiteSettings();

  // Auth & Permissions state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('super_admin');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Dashboard Data State
  const [loadingData, setLoadingData] = useState(false);
  const [admissions, setAdmissions] = useState<AdmissionInquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Verify auth and admin authorization
  const verifyAuth = async () => {
    setCheckingAuth(true);
    try {
      // 1. Check Supabase Auth session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { isAdmin: adminStatus } = await checkIsAdmin(user.id);
        if (adminStatus) {
          setCurrentUser(user);
          setIsAdmin(true);
          setCheckingAuth(false);
          return;
        }
      }

      // 2. Check localStorage session
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const savedAuth = localStorage.getItem('ksm_admin_logged_in');
        const savedEmail = localStorage.getItem('ksm_admin_email') || 'quratulainm244@gmail.com';
        if (savedAuth === 'true') {
          setCurrentUser({
            id: 'fdda878b-997c-4757-9262-fceaa5616466',
            email: savedEmail,
          });
          setIsAdmin(true);
          setCheckingAuth(false);
          return;
        }
      }

      setCurrentUser(null);
      setIsAdmin(false);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    verifyAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { isAdmin: adminStatus } = await checkIsAdmin(session.user.id);
        if (adminStatus) {
          setCurrentUser(session.user);
          setIsAdmin(true);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch all dashboard data
  const loadAllData = async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    try {
      const [
        admissionsRes,
        messagesRes,
        galleryRes,
        programsRes,
        teachersRes,
        testimonialsRes,
        noticesRes,
        eventsRes,
        adminsRes,
        logsRes,
      ] = await Promise.allSettled([
        fetchAdmissions(),
        fetchContactMessages(),
        fetchGallery(true),
        fetchPrograms(true),
        fetchTeachers(true),
        fetchTestimonials(true),
        fetchNotices(true),
        fetchEvents(true),
        fetchAdmins(),
        fetchAuditLogs(),
      ]);

      if (admissionsRes.status === 'fulfilled') setAdmissions(admissionsRes.value);
      if (messagesRes.status === 'fulfilled') setMessages(messagesRes.value);
      if (galleryRes.status === 'fulfilled') setGallery(galleryRes.value);
      if (programsRes.status === 'fulfilled') setPrograms(programsRes.value);
      if (teachersRes.status === 'fulfilled') setTeachers(teachersRes.value);
      if (testimonialsRes.status === 'fulfilled') setTestimonials(testimonialsRes.value);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value);
      if (adminsRes.status === 'fulfilled') setAdminsList(adminsRes.value);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value);
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // Handle Login using Admin Password
  const handleLogin = async () => {
    const targetEmail = email.trim();
    const cleanPassword = password.trim();

    if (!targetEmail) {
      setAuthError('Please enter your email address.');
      return;
    }
    if (!cleanPassword) {
      setAuthError('Please enter your admin password.');
      return;
    }

    setLoggingIn(true);
    setAuthError(null);

    try {
      // 1. Check dedicated School Admin Password
      const isMasterAdminPassword =
        cleanPassword === 'KsmAdmin@2026#' ||
        cleanPassword === 'KsmAdmin2026!' ||
        cleanPassword === 'KsmAdmin2026';

      // 2. Try Supabase Auth first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          const { isAdmin: adminStatus } = await checkIsAdmin(data.user.id);
          if (adminStatus) {
            setCurrentUser(data.user);
            setIsAdmin(true);
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
              localStorage.setItem('ksm_admin_logged_in', 'true');
              localStorage.setItem('ksm_admin_email', targetEmail);
            }
            return;
          }
        }
      } catch {
        // Fall through to dedicated password check
      }

      // 3. Fallback: If dedicated admin password matches, grant immediate entry
      if (isMasterAdminPassword) {
        const adminUser = {
          id: 'fdda878b-997c-4757-9262-fceaa5616466',
          email: targetEmail,
        };
        setCurrentUser(adminUser);
        setIsAdmin(true);
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          localStorage.setItem('ksm_admin_logged_in', 'true');
          localStorage.setItem('ksm_admin_email', targetEmail);
        }
        return;
      }

      setAuthError('Invalid admin password. Please enter the correct admin password.');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your admin password.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('ksm_admin_logged_in');
      localStorage.removeItem('ksm_admin_email');
    }
    setCurrentUser(null);
    setIsAdmin(false);
    router.replace('/');
  };

  // 1. Loading State
  if (checkingAuth) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#123f62" />
        <Text style={styles.centerText}>Verifying authorization...</Text>
      </View>
    );
  }

  // 2. Unauthenticated -> Supabase Sign In Screen
  if (!currentUser) {
    return (
      <View style={styles.loginPage}>
        <View style={styles.loginCard}>
          <View style={styles.loginHeader}>
            <View style={styles.loginEmblem}>
              <Text style={styles.loginEmblemText}>K</Text>
            </View>
            <Text style={styles.loginTitle}>Admin Sign In</Text>
            <Text style={styles.loginSubtitle}>
              Sign in with your Supabase administrator account
            </Text>
          </View>

          {authError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          )}

          <View style={styles.loginForm}>
            <View style={styles.field}>
              <Text style={styles.label}>Admin Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Admin Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter admin password"
                secureTextEntry
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
              onPress={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In to Admin Portal</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.returnSiteBtn}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.returnSiteText}>← Return to School Website</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // 3. Authenticated but NOT authorized admin -> redirecting away
  if (!isAdmin) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#123f62" />
        <Text style={styles.centerText}>Redirecting...</Text>
      </View>
    );
  }

  // 4. Authorized Admin Dashboard View
  const unreviewedAdmissions = admissions.filter((a) => a.status === 'new').length;
  const unreadMessages = messages.filter((m) => m.status === 'unread').length;

  return (
    <View style={styles.dashboardLayout}>
      {/* Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        adminEmail={currentUser.email}
        adminRole={adminRole}
        onSignOut={handleSignOut}
        inquiryCount={unreviewedAdmissions}
        messageCount={unreadMessages}
      />

      {/* Main Content Viewport */}
      <View style={styles.mainViewport}>
        {/* Top Navbar */}
        <View style={styles.topNavbar}>
          <View style={styles.navPathArea}>
            <Text style={styles.navPathRoot}>KSM Portal</Text>
            <Text style={styles.navPathSlash}>/</Text>
            <Text style={styles.navPathCurrent}>
              {activeTab.toUpperCase()}
            </Text>
          </View>

          <View style={styles.topNavActions}>
            <Pressable
              style={styles.publicWebsiteBtn}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.publicWebsiteText}>🌐 View Public Website</Text>
            </Pressable>

            <Pressable style={styles.refreshAllBtn} onPress={loadAllData}>
              <Text style={styles.refreshAllText}>🔄</Text>
            </Pressable>
          </View>
        </View>

        {/* Dynamic Active Module Render */}
        <View style={styles.moduleWrapper}>
          {activeTab === 'overview' && (
            <OverviewModule
              admissions={admissions}
              messages={messages}
              galleryCount={gallery.length}
              programsCount={programs.length}
              teachersCount={teachers.length}
              auditLogs={auditLogs}
              onNavigateTab={setActiveTab}
              loading={loadingData}
            />
          )}

          {activeTab === 'branding' && (
            <LogoAndBrandingModule
              settings={settings}
              onRefresh={() => {
                reloadSettings();
                loadAllData();
              }}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeDesignModule
              settings={settings}
              onRefresh={() => {
                reloadSettings();
                loadAllData();
              }}
            />
          )}

          {activeTab === 'sections' && (
            <SectionsManagerModule
              settings={settings}
              onRefresh={() => {
                reloadSettings();
                loadAllData();
              }}
            />
          )}

          {activeTab === 'admissions' && (
            <AdmissionsModule
              admissions={admissions}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'messages' && (
            <ContactMessagesModule
              messages={messages}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryModule
              items={gallery}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'programs' && (
            <ProgramsModule
              programs={programs}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersModule
              teachers={teachers}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsModule
              testimonials={testimonials}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}

          {activeTab === 'notices' || activeTab === 'events' ? (
            <NoticesEventsModule
              notices={notices}
              events={events}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          ) : null}

          {activeTab === 'contact' && (
            <ContactSocialModule
              settings={settings}
              onRefresh={() => {
                reloadSettings();
                loadAllData();
              }}
            />
          )}

          {activeTab === 'seo' && (
            <SeoNavFooterModule
              settings={settings}
              onRefresh={() => {
                reloadSettings();
                loadAllData();
              }}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersModule
              admins={adminsList}
              onRefresh={loadAllData}
              currentUserId={currentUser.id}
              loading={loadingData}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLogsModule
              logs={auditLogs}
              onRefresh={loadAllData}
              loading={loadingData}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerText: {
    color: '#123f62',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  loginPage: {
    flex: 1,
    backgroundColor: '#0a1d30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#efa91f',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginEmblem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a1d30',
    borderWidth: 2,
    borderColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loginEmblemText: {
    color: '#efa91f',
    fontSize: 28,
    fontWeight: '900',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#123f62',
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
  },
  loginForm: {
    gap: 14,
  },
  field: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#123f62',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  loginBtn: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginBtnPressed: {
    opacity: 0.85,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  returnSiteBtn: {
    marginTop: 14,
    alignSelf: 'center',
    padding: 6,
  },
  returnSiteText: {
    color: '#123f62',
    fontSize: 13,
    fontWeight: '800',
  },
  dashboardLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    height: '100%',
  },
  mainViewport: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navPathArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navPathRoot: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  navPathSlash: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  navPathCurrent: {
    fontSize: 13,
    color: '#123f62',
    fontWeight: '800',
  },
  topNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  publicWebsiteBtn: {
    backgroundColor: 'rgba(18, 63, 98, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publicWebsiteText: {
    color: '#123f62',
    fontSize: 12,
    fontWeight: '800',
  },
  refreshAllBtn: {
    backgroundColor: '#f1f5f9',
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshAllText: {
    fontSize: 14,
  },
  moduleWrapper: {
    flex: 1,
    height: '100%',
  },
});
