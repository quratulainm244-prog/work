import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AdminUser, addAdminUser, removeAdminUser } from '@/lib/admin-api';

interface AdminUsersModuleProps {
  admins: AdminUser[];
  onRefresh: () => void;
  currentUserId?: string;
  loading: boolean;
}

export function AdminUsersModule({
  admins,
  onRefresh,
  currentUserId,
  loading,
}: AdminUsersModuleProps) {
  const [newUid, setNewUid] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddAdmin = async () => {
    if (!newUid.trim()) {
      setFeedback({ type: 'error', text: 'Please enter the Supabase Auth User UID.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await addAdminUser(newUid.trim());
      setFeedback({ type: 'success', text: 'Admin UID authorized successfully!' });
      setNewUid('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to authorize admin user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (admin: AdminUser) => {
    if (admin.user_id === currentUserId) {
      alert('You cannot remove your own admin account while currently logged in.');
      return;
    }
    if (!window.confirm(`Revoke admin access for UID ${admin.user_id}?`)) return;

    try {
      await removeAdminUser(admin.id);
      setFeedback({ type: 'success', text: 'Admin authorization revoked.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Access & Role Management</Text>
          <Text style={styles.subtitle}>
            Control which Supabase user IDs (UIDs) are authorized to log into this portal.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Admins</Text>
        </Pressable>
      </View>

      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
            ]}
          >
            {feedback.text}
          </Text>
        </View>
      )}

      {/* Guide Banner */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>💡 How Supabase Admin Authorization Works:</Text>
        <Text style={styles.guideText}>
          1. The user signs up or is created in your Supabase Auth dashboard (Authentication → Users).
          {'\n'}2. Copy their unique User UID (e.g. <Text style={styles.codeText}>3b9d4e5f-1234-...</Text>).
          {'\n'}3. Paste their UID below to grant them dashboard administrator permissions.
        </Text>
      </View>

      {/* Add Admin Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Authorize New Administrator</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Supabase User ID (Auth UID) *</Text>
          <TextInput
            style={styles.input}
            value={newUid}
            onChangeText={setNewUid}
            placeholder="e.g. fdda878b-997c-4757-9262-fceaa5616466"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleAddAdmin}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Grant Administrator Privileges</Text>
          )}
        </Pressable>
      </View>

      {/* Existing Admins List */}
      <Text style={styles.sectionHeader}>Authorized Administrators ({admins.length})</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Fetching authorized administrators...</Text>
        </View>
      ) : admins.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>No Admin Users Found in Database</Text>
          <Text style={styles.emptySubtitle}>
            Run the SQL script or add your first admin UID using the form above.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {admins.map((a) => {
            const isSelf = a.user_id === currentUserId;

            return (
              <View key={a.id} style={styles.adminRow}>
                <View style={styles.adminIconBox}>
                  <Text style={styles.adminIconText}>🛡️</Text>
                </View>

                <View style={styles.adminDetails}>
                  <View style={styles.adminHeaderLine}>
                    <Text style={styles.adminEmail}>Admin Account</Text>
                    {isSelf && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.uidText}>User UID: {a.user_id}</Text>
                  <Text style={styles.dateText}>
                    Authorized on {new Date(a.created_at).toLocaleDateString()}
                  </Text>
                </View>

                {!isSelf && (
                  <Pressable
                    style={styles.revokeBtn}
                    onPress={() => handleRemove(a)}
                  >
                    <Text style={styles.revokeBtnText}>Revoke Access</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
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
  feedbackBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#065f46',
  },
  feedbackTextError: {
    color: '#991b1b',
  },
  guideCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 6,
  },
  guideText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#123f62',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  roleBtnActive: {
    backgroundColor: '#123f62',
    borderColor: '#123f62',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#123f62',
    marginBottom: 14,
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
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 169, 31, 0.15)',
    borderWidth: 1,
    borderColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminIconText: {
    fontSize: 20,
  },
  adminDetails: {
    flex: 1,
  },
  adminHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  adminEmail: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  youBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: '900',
  },
  roleBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
  },
  uidText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  revokeBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  revokeBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
