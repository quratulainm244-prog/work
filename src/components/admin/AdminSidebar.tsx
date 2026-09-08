import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type AdminTab =
  | 'overview'
  | 'branding'
  | 'theme'
  | 'sections'
  | 'gallery'
  | 'programs'
  | 'teachers'
  | 'testimonials'
  | 'notices'
  | 'events'
  | 'admissions'
  | 'messages'
  | 'contact'
  | 'seo'
  | 'users'
  | 'logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminEmail?: string | null;
  adminRole?: string | null;
  onSignOut: () => void;
  inquiryCount?: number;
  messageCount?: number;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: 'DASHBOARD',
    items: [
      { id: 'overview', label: 'Overview', icon: '📊' },
    ],
  },
  {
    group: 'SCHOOL & BRANDING',
    items: [
      { id: 'branding', label: 'School Logo', icon: '🏫' },
      { id: 'theme', label: 'Theme & Design', icon: '🎨' },
      { id: 'sections', label: 'Homepage Sections', icon: '📑' },
    ],
  },
  {
    group: 'ACADEMIC & MEDIA',
    items: [
      { id: 'gallery', label: 'Gallery Photos', icon: '🖼️' },
      { id: 'programs', label: 'Programs & Classes', icon: '📚' },
      { id: 'teachers', label: 'Teachers & Staff', icon: '👩‍🏫' },
      { id: 'testimonials', label: 'Testimonials', icon: '💬' },
    ],
  },
  {
    group: 'COMMUNICATIONS',
    items: [
      { id: 'admissions', label: 'Admissions', icon: '📝' },
      { id: 'messages', label: 'Contact Messages', icon: '✉️' },
      { id: 'notices', label: 'Notices / Alerts', icon: '📢' },
      { id: 'events', label: 'Events & Calendar', icon: '📅' },
    ],
  },
  {
    group: 'SETTINGS & SECURITY',
    items: [
      { id: 'contact', label: 'Contact & Socials', icon: '🌐' },
      { id: 'seo', label: 'SEO & Footer', icon: '⚙️' },
      { id: 'users', label: 'Admin Users & Roles', icon: '🛡️' },
      { id: 'logs', label: 'Activity Logs', icon: '📜' },
    ],
  },
];

export function AdminSidebar({
  activeTab,
  onSelectTab,
  adminEmail,
  adminRole,
  onSignOut,
  inquiryCount = 0,
  messageCount = 0,
}: AdminSidebarProps) {
  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>KSM</Text>
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandTitle}>KSM Portal</Text>
          <Text style={styles.brandSubtitle}>Admin Dashboard</Text>
        </View>
      </View>

      {/* Admin User Chip */}
      <View style={styles.userChip}>
        <View style={styles.statusDot} />
        <View style={styles.userInfo}>
          <Text style={styles.userEmail} numberOfLines={1}>
            {adminEmail || 'Admin'}
          </Text>
          <Text style={styles.userRole}>
            {adminRole ? adminRole.replace('_', ' ').toUpperCase() : 'SUPER ADMIN'}
          </Text>
        </View>
      </View>

      {/* Navigation List */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {NAV_GROUPS.map((group) => (
          <View key={group.group} style={styles.navGroup}>
            <Text style={styles.groupTitle}>{group.group}</Text>
            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              const badgeCount =
                item.id === 'admissions'
                  ? inquiryCount
                  : item.id === 'messages'
                  ? messageCount
                  : 0;

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.navItem,
                    isActive && styles.navItemActive,
                    pressed && styles.navItemPressed,
                  ]}
                  onPress={() => onSelectTab(item.id)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {badgeCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Sign Out Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
          onPress={onSignOut}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 270,
    backgroundColor: '#0a1d30',
    borderRightWidth: 1,
    borderRightColor: 'rgba(239, 169, 31, 0.25)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#efa91f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  logoText: {
    color: '#0a1d30',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandInfo: {
    flex: 1,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#efa91f',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userRole: {
    color: '#efa91f',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  navList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navGroup: {
    marginBottom: 18,
  },
  groupTitle: {
    color: '#6b7c93',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(239, 169, 31, 0.16)',
    borderLeftWidth: 3,
    borderLeftColor: '#efa91f',
  },
  navItemPressed: {
    opacity: 0.8,
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  badgeContainer: {
    backgroundColor: '#efa91f',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#0a1d30',
    fontSize: 11,
    fontWeight: '900',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  signOutButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutIcon: {
    fontSize: 15,
  },
  signOutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
});
