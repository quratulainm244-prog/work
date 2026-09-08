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
  ProgramItem,
  createProgram,
  updateProgram,
  deleteProgram,
} from '@/lib/admin-api';

interface ProgramsModuleProps {
  programs: ProgramItem[];
  onRefresh: () => void;
  loading: boolean;
}

export function ProgramsModule({
  programs,
  onRefresh,
  loading,
}: ProgramsModuleProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [number, setNumber] = useState('01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('2.5 - 4 Years');
  const [icon, setIcon] = useState('🌱');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setNumber(String(programs.length + 1).padStart(2, '0'));
    setTitle('');
    setDescription('');
    setAgeGroup('');
    setIcon('🌱');
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in the program title and description.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateProgram(editingId, {
          number,
          title: title.trim(),
          description: description.trim(),
          age_group: ageGroup.trim() || null,
          icon,
        });
        setFeedback({ type: 'success', text: 'Program updated successfully!' });
      } else {
        await createProgram({
          number: number || String(programs.length + 1).padStart(2, '0'),
          title: title.trim(),
          description: description.trim(),
          age_group: ageGroup.trim() || null,
          icon,
          sort_order: programs.length + 1,
          is_active: true,
        });
        setFeedback({ type: 'success', text: 'New program added to curriculum!' });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save program.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: ProgramItem) => {
    setEditingId(p.id);
    setNumber(p.number);
    setTitle(p.title);
    setDescription(p.description);
    setAgeGroup(p.age_group || '');
    setIcon(p.icon || '🌱');
  };

  const handleToggleActive = async (p: ProgramItem) => {
    try {
      await updateProgram(p.id, { is_active: !p.is_active });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update program status.' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete program "${name}"?`)) return;
    try {
      await deleteProgram(id);
      setFeedback({ type: 'success', text: 'Program removed.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete program.' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Programs & Educational Stages</Text>
          <Text style={styles.subtitle}>
            Manage kindergarten stages, early education classes, and descriptions.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Programs</Text>
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
          {editingId ? 'Edit Program Stage' : 'Add New Program Stage'}
        </Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Stage Number</Text>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              placeholder="e.g. 01, 02"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Icon / Emoji</Text>
            <TextInput
              style={styles.input}
              value={icon}
              onChangeText={setIcon}
              placeholder="e.g. 🌟, 🌱, 🎨"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Program Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Early Learning, Primary Education"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age Group Recommendation</Text>
          <TextInput
            style={styles.input}
            value={ageGroup}
            onChangeText={setAgeGroup}
            placeholder="e.g. 2.5 to 4 Years"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Program Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the Montessori objectives and classroom experience..."
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
                {editingId ? 'Update Program' : 'Create Program'}
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
      <Text style={styles.sectionHeader}>Active Curriculum Programs ({programs.length})</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Loading programs...</Text>
        </View>
      ) : programs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Programs Added</Text>
          <Text style={styles.emptySubtitle}>Use the form above to add your first program.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {programs.map((p) => (
            <View key={p.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNumBadge}>
                  <Text style={styles.itemNumText}>{p.number}</Text>
                </View>
                <View style={styles.itemTitleArea}>
                  <Text style={styles.itemTitle}>
                    {p.icon || '⭐'} {p.title}
                  </Text>
                  {p.age_group && (
                    <Text style={styles.itemAge}>Age Group: {p.age_group}</Text>
                  )}
                </View>
                <View style={styles.itemToggle}>
                  <Text style={styles.toggleStatus}>
                    {p.is_active ? 'Active' : 'Disabled'}
                  </Text>
                  <Switch
                    value={p.is_active}
                    onValueChange={() => handleToggleActive(p)}
                    trackColor={{ false: '#cbd5e1', true: '#efa91f' }}
                    thumbColor={p.is_active ? '#123f62' : '#f1f5f9'}
                  />
                </View>
              </View>

              <Text style={styles.itemDesc}>{p.description}</Text>

              <View style={styles.itemActions}>
                <Pressable style={styles.editBtn} onPress={() => handleEdit(p)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(p.id, p.title)}
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  itemNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 169, 31, 0.15)',
    borderWidth: 1,
    borderColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumText: {
    color: '#b45309',
    fontSize: 13,
    fontWeight: '900',
  },
  itemTitleArea: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123f62',
  },
  itemAge: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  itemToggle: {
    alignItems: 'center',
    gap: 2,
  },
  toggleStatus: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
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
