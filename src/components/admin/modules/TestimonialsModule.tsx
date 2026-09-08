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
  TestimonialItem,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/admin-api';

interface TestimonialsModuleProps {
  testimonials: TestimonialItem[];
  onRefresh: () => void;
  loading: boolean;
}

export function TestimonialsModule({
  testimonials,
  onRefresh,
  loading,
}: TestimonialsModuleProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('KSM Parent');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRelationship('KSM Parent');
    setMessage('');
    setRating(5);
  };

  const handleSave = async () => {
    if (!name.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Please provide reviewer name and testimonial message.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateTestimonial(editingId, {
          name: name.trim(),
          relationship: relationship.trim(),
          message: message.trim(),
          rating,
        });
        setFeedback({ type: 'success', text: 'Testimonial updated!' });
      } else {
        await createTestimonial({
          name: name.trim(),
          relationship: relationship.trim() || 'KSM Parent',
          message: message.trim(),
          rating,
          sort_order: testimonials.length + 1,
          is_active: true,
        });
        setFeedback({ type: 'success', text: 'New testimonial published!' });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save testimonial.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: TestimonialItem) => {
    setEditingId(t.id);
    setName(t.name);
    setRelationship(t.relationship);
    setMessage(t.message);
    setRating(t.rating);
  };

  const handleToggleActive = async (t: TestimonialItem) => {
    try {
      await updateTestimonial(t.id, { is_active: !t.is_active });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to toggle testimonial.' });
    }
  };

  const handleDelete = async (id: string, reviewer: string) => {
    if (!window.confirm(`Delete review from "${reviewer}"?`)) return;
    try {
      await deleteTestimonial(id);
      setFeedback({ type: 'success', text: 'Testimonial removed.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete review.' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Parent Reviews & Testimonials</Text>
          <Text style={styles.subtitle}>
            Manage endorsements and quotes from KSM school families.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
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

      {/* Editor Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {editingId ? 'Edit Parent Review' : 'Add New Parent Testimonial'}
        </Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Parent / Reviewer Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Fatima Tariq"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Relationship / Grade</Text>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="e.g. KSM Parent (Montessori Junior)"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Star Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Text style={[styles.starIcon, star <= rating && styles.starActive]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Testimonial Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="What does the parent value about their child's experience at Kindergarten Saadia's?"
            multiline
          />
        </View>

        <View style={styles.formActions}>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {editingId ? 'Update Review' : 'Publish Testimonial'}
              </Text>
            )}
          </Pressable>

          {editingId && (
            <Pressable style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Existing List */}
      <Text style={styles.sectionHeader}>Published Reviews ({testimonials.length})</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Loading testimonials...</Text>
        </View>
      ) : testimonials.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No Testimonials Found</Text>
          <Text style={styles.emptySubtitle}>Use the form above to add your first testimonial.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {testimonials.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={styles.itemAuthor}>
                  <Text style={styles.authorName}>{item.name}</Text>
                  <Text style={styles.authorRelation}>{item.relationship}</Text>
                </View>

                <View style={styles.itemStars}>
                  <Text style={styles.starsText}>
                    {'★'.repeat(item.rating)}
                    {'☆'.repeat(Math.max(0, 5 - item.rating))}
                  </Text>
                </View>

                <View style={styles.itemToggle}>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => handleToggleActive(item)}
                    trackColor={{ false: '#cbd5e1', true: '#efa91f' }}
                    thumbColor={item.is_active ? '#123f62' : '#f1f5f9'}
                  />
                </View>
              </View>

              <Text style={styles.itemMessage}>"{item.message}"</Text>

              <View style={styles.itemActions}>
                <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.name)}
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
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starIcon: {
    fontSize: 26,
    color: '#cbd5e1',
  },
  starActive: {
    color: '#efa91f',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
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
  },
  list: {
    gap: 14,
    marginBottom: 30,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  authorRelation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  itemStars: {
    marginRight: 14,
  },
  starsText: {
    fontSize: 15,
    color: '#efa91f',
    letterSpacing: 2,
  },
  itemToggle: {},
  itemMessage: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  editBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
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
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
});
