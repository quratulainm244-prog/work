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
import { AdmissionInquiry, updateAdmissionStatus, deleteAdmission } from '@/lib/admin-api';

interface AdmissionsModuleProps {
  admissions: AdmissionInquiry[];
  onRefresh: () => void;
  loading: boolean;
}

export function AdmissionsModule({
  admissions,
  onRefresh,
  loading,
}: AdmissionsModuleProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted' | 'enrolled' | 'archived'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredAdmissions = admissions.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleStatusChange = async (id: string, newStatus: AdmissionInquiry['status']) => {
    setUpdating(true);
    setFeedback(null);
    try {
      await updateAdmissionStatus(id, newStatus, adminNotes || undefined);
      setFeedback({ type: 'success', text: `Status updated to ${newStatus.toUpperCase()}` });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this admission application?')) return;
    setUpdating(true);
    try {
      await deleteAdmission(id);
      setFeedback({ type: 'success', text: 'Application deleted.' });
      if (selectedId === id) setSelectedId(null);
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete application.' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Student Admission Applications</Text>
          <Text style={styles.subtitle}>
            Review and manage inquiries submitted by parents from the website.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh List</Text>
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

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'new', 'reviewed', 'contacted', 'enrolled', 'archived'] as const).map((status) => {
          const count =
            status === 'all'
              ? admissions.length
              : admissions.filter((a) => a.status === status).length;
          const isActive = filter === status;

          return (
            <Pressable
              key={status}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {status.toUpperCase()} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Fetching admission applications...</Text>
        </View>
      ) : filteredAdmissions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No Applications Found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'No parents have submitted an application yet.'
              : `No applications currently have status "${filter}".`}
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {filteredAdmissions.map((item) => {
            const isExpanded = selectedId === item.id;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.applicantPrimary}>
                    <Text style={styles.parentName}>{item.parent_name}</Text>
                    <Text style={styles.contactDetails}>
                      📞 {item.contact_info}
                    </Text>
                  </View>

                  <View style={styles.cardMeta}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'new'
                          ? styles.statusBadgeNew
                          : item.status === 'enrolled'
                          ? styles.statusBadgeEnrolled
                          : styles.statusBadgeDefault,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.timestamp}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Child Info & Message */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Child Name / Age:</Text>
                    <Text style={styles.infoVal}>
                      {item.child_name || 'Not provided'}{' '}
                      {item.child_age ? `(${item.child_age})` : ''}
                    </Text>
                  </View>

                  {item.message ? (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageLabel}>Parent Message / Inquiry:</Text>
                      <Text style={styles.messageContent}>"{item.message}"</Text>
                    </View>
                  ) : null}

                  {item.admin_notes ? (
                    <View style={styles.adminNotesBox}>
                      <Text style={styles.adminNotesLabel}>Admin Notes:</Text>
                      <Text style={styles.adminNotesContent}>{item.admin_notes}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions & Status Dropdown */}
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.toggleExpandBtn}
                    onPress={() => {
                      if (isExpanded) {
                        setSelectedId(null);
                      } else {
                        setSelectedId(item.id);
                        setAdminNotes(item.admin_notes || '');
                      }
                    }}
                  >
                    <Text style={styles.toggleExpandText}>
                      {isExpanded ? '▲ Hide Update Panel' : '▼ Update Status / Add Notes'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                    disabled={updating}
                  >
                    <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                  </Pressable>
                </View>

                {/* Expanded Status & Notes Editor */}
                {isExpanded && (
                  <View style={styles.expandedPanel}>
                    <Text style={styles.panelTitle}>Change Application Status:</Text>
                    <View style={styles.statusButtonsRow}>
                      {(['new', 'reviewed', 'contacted', 'enrolled', 'archived'] as const).map(
                        (st) => (
                          <Pressable
                            key={st}
                            style={[
                              styles.statusSelectBtn,
                              item.status === st && styles.statusSelectBtnActive,
                            ]}
                            onPress={() => handleStatusChange(item.id, st)}
                            disabled={updating}
                          >
                            <Text
                              style={[
                                styles.statusSelectBtnText,
                                item.status === st && styles.statusSelectBtnTextActive,
                              ]}
                            >
                              {st.toUpperCase()}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>

                    <Text style={styles.notesInputLabel}>Add / Edit Internal Admin Notes:</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      placeholder="e.g. Called parent on Friday, invited for campus tour on Monday."
                      multiline
                    />
                    <Pressable
                      style={styles.saveNotesBtn}
                      onPress={() => handleStatusChange(item.id, item.status)}
                      disabled={updating}
                    >
                      <Text style={styles.saveNotesBtnText}>Save Notes</Text>
                    </Pressable>
                  </View>
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#123f62',
    borderColor: '#123f62',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  filterLabelActive: {
    color: '#ffffff',
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
  cardsList: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 12,
  },
  applicantPrimary: {
    flex: 1,
  },
  parentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#123f62',
  },
  contactDetails: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeNew: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeEnrolled: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeDefault: {
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0f172a',
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  infoSection: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  infoVal: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#efa91f',
    marginTop: 6,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  adminNotesBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    marginTop: 8,
  },
  adminNotesLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 4,
  },
  adminNotesContent: {
    fontSize: 13,
    color: '#166534',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  toggleExpandBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toggleExpandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123f62',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  expandedPanel: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  statusSelectBtnActive: {
    backgroundColor: '#efa91f',
    borderColor: '#efa91f',
  },
  statusSelectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  statusSelectBtnTextActive: {
    color: '#0a1d30',
  },
  notesInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    marginBottom: 10,
  },
  saveNotesBtn: {
    backgroundColor: '#123f62',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  saveNotesBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
