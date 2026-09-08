import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ContactMessage, updateMessageStatus, deleteContactMessage } from '@/lib/admin-api';

interface ContactMessagesModuleProps {
  messages: ContactMessage[];
  onRefresh: () => void;
  loading: boolean;
}

export function ContactMessagesModule({
  messages,
  onRefresh,
  loading,
}: ContactMessagesModuleProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const handleToggleRead = async (id: string, currentStatus: string) => {
    setUpdating(true);
    try {
      const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
      await updateMessageStatus(id, nextStatus as any);
      setFeedback({ type: 'success', text: `Marked as ${nextStatus}.` });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update message.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setUpdating(true);
    try {
      await deleteContactMessage(id);
      setFeedback({ type: 'success', text: 'Message deleted.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete message.' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Parent & Visitor Messages</Text>
          <Text style={styles.subtitle}>
            Inquiries received from the website contact section.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Inbox</Text>
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
        {(['all', 'unread', 'read', 'archived'] as const).map((status) => {
          const count =
            status === 'all'
              ? messages.length
              : messages.filter((m) => m.status === status).length;
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
          <Text style={styles.loadingText}>Loading inbox messages...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>✉️</Text>
          <Text style={styles.emptyTitle}>No Messages Found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Your inbox is currently empty.'
              : `No messages with status "${filter}".`}
          </Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.senderInfo}>
                  <Text style={styles.senderName}>{item.name}</Text>
                  <Text style={styles.senderContact}>
                    {item.email ? `✉️ ${item.email}` : ''}{' '}
                    {item.phone ? `📞 ${item.phone}` : ''}
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'unread' ? styles.statusUnread : styles.statusRead,
                    ]}
                  >
                    <Text style={styles.statusPillText}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.messageContentBox}>
                <Text style={styles.messageText}>"{item.message}"</Text>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.markReadBtn}
                  onPress={() => handleToggleRead(item.id, item.status)}
                  disabled={updating}
                >
                  <Text style={styles.markReadText}>
                    {item.status === 'unread' ? '✓ Mark as Read' : '↺ Mark as Unread'}
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
    gap: 14,
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
    paddingBottom: 12,
    marginBottom: 12,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123f62',
  },
  senderContact: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusUnread: {
    backgroundColor: '#eff6ff',
  },
  statusRead: {
    backgroundColor: '#f1f5f9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e40af',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageContentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markReadBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markReadText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
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
});
