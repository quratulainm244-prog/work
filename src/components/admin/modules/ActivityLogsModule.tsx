import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AdminAuditLog } from '@/lib/admin-api';

interface ActivityLogsModuleProps {
  logs: AdminAuditLog[];
  onRefresh: () => void;
  loading: boolean;
}

export function ActivityLogsModule({
  logs,
  onRefresh,
  loading,
}: ActivityLogsModuleProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Activity Audit Trail</Text>
          <Text style={styles.subtitle}>
            A permanent record of modifications, uploads, and status changes made in this portal.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Logs</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Loading audit logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyTitle}>No Activity Logs Recorded Yet</Text>
          <Text style={styles.emptySubtitle}>
            Actions like updating settings, uploading photos, or changing admission statuses will be logged here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {logs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logTop}>
                <View style={styles.actionBadge}>
                  <Text style={styles.actionText}>{log.action.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.entityText}>Target: {log.entity}</Text>
                <Text style={styles.timeText}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.emailLine}>
                Initiator: <Text style={styles.emailText}>{log.admin_email || 'Administrator'}</Text>
              </Text>

              {log.details && Object.keys(log.details).length > 0 && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(log.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#123f62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  refreshBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#123f62',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 36,
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
  list: {
    gap: 12,
    marginBottom: 30,
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  actionBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#123f62',
  },
  entityText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emailLine: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  emailText: {
    fontWeight: '700',
    color: '#1e293b',
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#334155',
  },
});
