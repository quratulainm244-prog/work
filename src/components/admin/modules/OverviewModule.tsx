import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AdmissionInquiry, ContactMessage, AdminAuditLog } from '@/lib/admin-api';

interface OverviewModuleProps {
  admissions: AdmissionInquiry[];
  messages: ContactMessage[];
  galleryCount: number;
  programsCount: number;
  teachersCount: number;
  auditLogs: AdminAuditLog[];
  onNavigateTab: (tab: any) => void;
  loading: boolean;
}

export function OverviewModule({
  admissions,
  messages,
  galleryCount,
  programsCount,
  teachersCount,
  auditLogs,
  onNavigateTab,
  loading,
}: OverviewModuleProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#efa91f" />
        <Text style={styles.loadingText}>Loading School Overview...</Text>
      </View>
    );
  }

  const newAdmissions = admissions.filter((a) => a.status === 'new').length;
  const unreadMessages = messages.filter((m) => m.status === 'unread').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>School Dashboard Overview</Text>
        <Text style={styles.subtitle}>
          Kindergarten Saadia's Montessori School (KSM) Management Portal
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.statsGrid}>
        <Pressable
          style={[styles.statCard, styles.statCardGold]}
          onPress={() => onNavigateTab('admissions')}
        >
          <View style={styles.statIconRow}>
            <Text style={styles.statIcon}>📝</Text>
            {newAdmissions > 0 && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>{newAdmissions} NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.statNumber}>{admissions.length}</Text>
          <Text style={styles.statLabel}>Total Admission Inquiries</Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() => onNavigateTab('messages')}
        >
          <View style={styles.statIconRow}>
            <Text style={styles.statIcon}>✉️</Text>
            {unreadMessages > 0 && (
              <View style={styles.urgentBadgeBlue}>
                <Text style={styles.urgentBadgeText}>{unreadMessages} UNREAD</Text>
              </View>
            )}
          </View>
          <Text style={styles.statNumber}>{messages.length}</Text>
          <Text style={styles.statLabel}>Contact Messages</Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() => onNavigateTab('gallery')}
        >
          <View style={styles.statIconRow}>
            <Text style={styles.statIcon}>🖼️</Text>
          </View>
          <Text style={styles.statNumber}>{galleryCount}</Text>
          <Text style={styles.statLabel}>Gallery Photographs</Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() => onNavigateTab('programs')}
        >
          <View style={styles.statIconRow}>
            <Text style={styles.statIcon}>📚</Text>
          </View>
          <Text style={styles.statNumber}>{programsCount}</Text>
          <Text style={styles.statLabel}>Academic Programs</Text>
        </Pressable>

        <Pressable
          style={styles.statCard}
          onPress={() => onNavigateTab('teachers')}
        >
          <View style={styles.statIconRow}>
            <Text style={styles.statIcon}>👩‍🏫</Text>
          </View>
          <Text style={styles.statNumber}>{teachersCount}</Text>
          <Text style={styles.statLabel}>Faculty & Teachers</Text>
        </Pressable>
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Management Shortcuts</Text>
        <View style={styles.shortcutsRow}>
          <Pressable
            style={styles.shortcutBtn}
            onPress={() => onNavigateTab('branding')}
          >
            <Text style={styles.shortcutIcon}>🏫</Text>
            <Text style={styles.shortcutLabel}>Update School Logo</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutBtn}
            onPress={() => onNavigateTab('gallery')}
          >
            <Text style={styles.shortcutIcon}>📸</Text>
            <Text style={styles.shortcutLabel}>Upload Photos</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutBtn}
            onPress={() => onNavigateTab('notices')}
          >
            <Text style={styles.shortcutIcon}>📢</Text>
            <Text style={styles.shortcutLabel}>Post Notice</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutBtn}
            onPress={() => onNavigateTab('sections')}
          >
            <Text style={styles.shortcutIcon}>📑</Text>
            <Text style={styles.shortcutLabel}>Toggle Sections</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Admissions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Admission Applications</Text>
          <Pressable onPress={() => onNavigateTab('admissions')}>
            <Text style={styles.viewAllText}>View All Inquiries →</Text>
          </Pressable>
        </View>

        {admissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Inquiries Received Yet</Text>
            <Text style={styles.emptySubtitle}>
              Applications submitted by parents will automatically appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.tableCard}>
            {admissions.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.rowInfo}>
                  <Text style={styles.parentName}>{item.parent_name}</Text>
                  <Text style={styles.childInfo}>
                    Child: {item.child_name || 'N/A'}{' '}
                    {item.child_age ? `(${item.child_age})` : ''}
                  </Text>
                  <Text style={styles.contactInfo}>{item.contact_info}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'new'
                        ? styles.statusPillNew
                        : item.status === 'enrolled'
                        ? styles.statusPillEnrolled
                        : styles.statusPillDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === 'new'
                          ? styles.statusPillTextNew
                          : styles.statusPillTextDefault,
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Activity Trail */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Admin Activity</Text>
        {auditLogs.length === 0 ? (
          <Text style={styles.noLogsText}>No recent activity logged.</Text>
        ) : (
          <View style={styles.logsList}>
            {auditLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logDot} />
                <View style={styles.logContent}>
                  <Text style={styles.logAction}>
                    <Text style={styles.logEmail}>{log.admin_email || 'Admin'}</Text>{' '}
                    performed <Text style={styles.logHighlight}>{log.action}</Text> on{' '}
                    <Text style={styles.logEntity}>{log.entity}</Text>
                  </Text>
                  <Text style={styles.logTime}>
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#123f62',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#123f62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardGold: {
    borderColor: '#efa91f',
    backgroundColor: '#fffdfa',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 24,
  },
  urgentBadge: {
    backgroundColor: '#efa91f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentBadgeBlue: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentBadgeText: {
    color: '#0a1d30',
    fontSize: 10,
    fontWeight: '900',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#123f62',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#123f62',
    marginBottom: 14,
  },
  viewAllText: {
    color: '#efa91f',
    fontSize: 13,
    fontWeight: '800',
  },
  shortcutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutBtn: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  shortcutIcon: {
    fontSize: 20,
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  childInfo: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  contactInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillNew: {
    backgroundColor: '#fef3c7',
  },
  statusPillEnrolled: {
    backgroundColor: '#d1fae5',
  },
  statusPillDefault: {
    backgroundColor: '#f1f5f9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusPillTextNew: {
    color: '#b45309',
  },
  statusPillTextDefault: {
    color: '#475569',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123f62',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  logsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#efa91f',
    marginTop: 5,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 13,
    color: '#334155',
  },
  logEmail: {
    fontWeight: '800',
    color: '#123f62',
  },
  logHighlight: {
    fontWeight: '700',
    color: '#b45309',
  },
  logEntity: {
    fontWeight: '700',
    color: '#0284c7',
  },
  logTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  noLogsText: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
