import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  NoticeItem,
  EventItem,
  createNotice,
  updateNotice,
  deleteNotice,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/admin-api';

interface NoticesEventsModuleProps {
  notices: NoticeItem[];
  events: EventItem[];
  onRefresh: () => void;
  loading: boolean;
}

export function NoticesEventsModule({
  notices,
  events,
  onRefresh,
  loading,
}: NoticesEventsModuleProps) {
  const [subTab, setSubTab] = useState<'notices' | 'events'>('notices');

  // Notice form states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [noticeBadge, setNoticeBadge] = useState('Important');

  // Event form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventLocation, setEventLocation] = useState('KSM Campus Haripur');
  const [eventDesc, setEventDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateNotice = async () => {
    if (!noticeTitle.trim() || !noticeDesc.trim()) {
      setFeedback({ type: 'error', text: 'Please enter notice title and details.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await createNotice({
        title: noticeTitle.trim(),
        description: noticeDesc.trim(),
        badge: noticeBadge.trim() || 'Notice',
        is_active: true,
      });
      setFeedback({ type: 'success', text: 'Notice published successfully!' });
      setNoticeTitle('');
      setNoticeDesc('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish notice.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim()) {
      setFeedback({ type: 'error', text: 'Please enter event title and date (YYYY-MM-DD).' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await createEvent({
        title: eventTitle.trim(),
        event_date: eventDate.trim(),
        location: eventLocation.trim() || 'KSM Campus',
        description: eventDesc.trim() || null,
        is_active: true,
      });
      setFeedback({ type: 'success', text: 'School event added to calendar!' });
      setEventTitle('');
      setEventDesc('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to add event.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await deleteEvent(id);
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notices & School Calendar</Text>
          <Text style={styles.subtitle}>
            Post school bulletins, holidays, exam dates, and upcoming events.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </Pressable>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabsRow}>
        <Pressable
          style={[styles.subTab, subTab === 'notices' && styles.subTabActive]}
          onPress={() => setSubTab('notices')}
        >
          <Text style={[styles.subTabText, subTab === 'notices' && styles.subTabTextActive]}>
            📢 Announcements ({notices.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.subTab, subTab === 'events' && styles.subTabActive]}
          onPress={() => setSubTab('events')}
        >
          <Text style={[styles.subTabText, subTab === 'events' && styles.subTabTextActive]}>
            📅 School Calendar ({events.length})
          </Text>
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

      {/* NOTICES SECTION */}
      {subTab === 'notices' ? (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Post New Notice / Announcement</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 2 }]}>
                <Text style={styles.label}>Notice Title *</Text>
                <TextInput
                  style={styles.input}
                  value={noticeTitle}
                  onChangeText={setNoticeTitle}
                  placeholder="e.g. Admissions Open for Session 2026-2027"
                />
              </View>

              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Tag / Badge</Text>
                <TextInput
                  style={styles.input}
                  value={noticeBadge}
                  onChangeText={setNoticeBadge}
                  placeholder="e.g. Important, Holiday, Exam"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Notice Details *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={noticeDesc}
                onChangeText={setNoticeDesc}
                placeholder="Write the full announcement message for parents..."
                multiline
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
              onPress={handleCreateNotice}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Publish Notice</Text>
              )}
            </Pressable>
          </View>

          {/* Notices List */}
          <Text style={styles.sectionHeader}>Active Notices</Text>
          {notices.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No notices published yet.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {notices.map((n) => (
                <View key={n.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.badgeBox}>
                      <Text style={styles.badgeText}>{n.badge}</Text>
                    </View>
                    <Text style={styles.noticeTitle}>{n.title}</Text>
                  </View>
                  <Text style={styles.noticeDesc}>{n.description}</Text>
                  <View style={styles.footerRow}>
                    <Text style={styles.dateText}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </Text>
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteNotice(n.id)}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        /* EVENTS SECTION */
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Calendar Event</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 2 }]}>
                <Text style={styles.label}>Event Title *</Text>
                <TextInput
                  style={styles.input}
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  placeholder="e.g. Annual Sports Day / PTM"
                />
              </View>

              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  value={eventDate}
                  onChangeText={setEventDate}
                  placeholder="2026-09-15"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location / Venue</Text>
              <TextInput
                style={styles.input}
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder="e.g. School Auditorium / Campus Grounds"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={eventDesc}
                onChangeText={setEventDesc}
                placeholder="Event agenda, dress code, timings..."
                multiline
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
              onPress={handleCreateEvent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Event</Text>
              )}
            </Pressable>
          </View>

          {/* Events List */}
          <Text style={styles.sectionHeader}>Upcoming Events</Text>
          {events.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No calendar events scheduled.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {events.map((e) => (
                <View key={e.id} style={styles.itemCard}>
                  <View style={styles.eventRow}>
                    <View style={styles.eventDateBox}>
                      <Text style={styles.eventDateText}>{e.event_date}</Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.noticeTitle}>{e.title}</Text>
                      <Text style={styles.eventLoc}>📍 {e.location}</Text>
                      {e.description ? (
                        <Text style={styles.noticeDesc}>{e.description}</Text>
                      ) : null}
                    </View>
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteEvent(e.id)}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
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
    marginBottom: 16,
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
  subTabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subTabActive: {
    backgroundColor: '#123f62',
    borderColor: '#123f62',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  subTabTextActive: {
    color: '#ffffff',
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 12,
    marginBottom: 30,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  badgeBox: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  noticeDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  eventDateBox: {
    backgroundColor: 'rgba(239, 169, 31, 0.15)',
    borderWidth: 1,
    borderColor: '#efa91f',
    borderRadius: 8,
    padding: 8,
  },
  eventDateText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
  eventInfo: {
    flex: 1,
  },
  eventLoc: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginVertical: 2,
  },
});
