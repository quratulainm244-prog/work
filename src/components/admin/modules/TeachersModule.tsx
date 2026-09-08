import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  TeacherItem,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadImageToStorage,
} from '@/lib/admin-api';

interface TeachersModuleProps {
  teachers: TeacherItem[];
  onRefresh: () => void;
  loading: boolean;
}

const webTeacherUploadStyle: any = {
  backgroundColor: '#123f62',
  color: '#ffffff',
  padding: '8px 14px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'inline-block',
};

export function TeachersModule({
  teachers,
  onRefresh,
  loading,
}: TeachersModuleProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSubject('');
    setPhone('');
    setEmail('');
    setBio('');
    setPhotoUrl('');
  };

  const handlePhotoUpload = async (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'teachers');
      setPhotoUrl(url);
      setFeedback({ type: 'success', text: 'Teacher portrait uploaded to Supabase Storage!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to upload photo.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      setFeedback({ type: 'error', text: 'Please provide teacher name and teaching subject/role.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateTeacher(editingId, {
          name: name.trim(),
          subject: subject.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          bio: bio.trim() || null,
          photo_url: photoUrl.trim() || null,
        });
        setFeedback({ type: 'success', text: 'Teacher profile updated!' });
      } else {
        await createTeacher({
          name: name.trim(),
          subject: subject.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          bio: bio.trim() || null,
          photo_url: photoUrl.trim() || null,
          sort_order: teachers.length + 1,
          is_active: true,
        });
        setFeedback({ type: 'success', text: 'New teacher added to faculty roster!' });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save teacher profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: TeacherItem) => {
    setEditingId(t.id);
    setName(t.name);
    setSubject(t.subject);
    setPhone(t.phone || '');
    setEmail(t.email || '');
    setBio(t.bio || '');
    setPhotoUrl(t.photo_url || '');
  };

  const handleToggleActive = async (t: TeacherItem) => {
    try {
      await updateTeacher(t.id, { is_active: !t.is_active });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to toggle teacher visibility.' });
    }
  };

  const handleDelete = async (t: TeacherItem) => {
    if (!window.confirm(`Delete teacher profile "${t.name}"?`)) return;
    try {
      await deleteTeacher(t.id, t.photo_url);
      setFeedback({ type: 'success', text: 'Teacher removed from roster.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete teacher.' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Teachers & School Staff</Text>
          <Text style={styles.subtitle}>
            Manage faculty profiles, subjects taught, and staff contact details.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Staff</Text>
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

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {editingId ? 'Edit Teacher Profile' : 'Add New Teacher / Staff'}
        </Text>

        <View style={styles.photoUploadRow}>
          <View style={styles.photoPreviewBox}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
            ) : (
              <Text style={styles.photoPlaceholderText}>👩‍🏫</Text>
            )}
          </View>

          <View style={styles.photoUploadActions}>
            {Platform.OS === 'web' && (
              <label style={webTeacherUploadStyle}>
                {uploading ? 'Uploading...' : '📁 Upload Staff Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            )}
            {photoUrl ? (
              <Pressable style={styles.removePhotoBtn} onPress={() => setPhotoUrl('')}>
                <Text style={styles.removePhotoBtnText}>Remove Photo</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Mrs. Ayesha Khan"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Subject / Department *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Montessori Head / English"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +92 300 1234567"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. ayesha@ksmschool.edu.pk"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Biography / Experience</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Montessori certifications, teaching philosophy, background..."
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
                {editingId ? 'Update Profile' : 'Save Teacher Profile'}
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

      {/* Staff Roster */}
      <Text style={styles.sectionHeader}>Staff Directory ({teachers.length})</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Loading faculty directory...</Text>
        </View>
      ) : teachers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👩‍🏫</Text>
          <Text style={styles.emptyTitle}>No Teachers Added Yet</Text>
          <Text style={styles.emptySubtitle}>Add your teachers and staff members using the form above.</Text>
        </View>
      ) : (
        <View style={styles.teachersGrid}>
          {teachers.map((t) => (
            <View key={t.id} style={styles.teacherCard}>
              <View style={styles.teacherTop}>
                {t.photo_url ? (
                  <Image source={{ uri: t.photo_url }} style={styles.teacherAvatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{t.name.charAt(0)}</Text>
                  </View>
                )}

                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{t.name}</Text>
                  <Text style={styles.teacherSubject}>{t.subject}</Text>
                  {t.phone && <Text style={styles.teacherContact}>📞 {t.phone}</Text>}
                  {t.email && <Text style={styles.teacherContact}>✉️ {t.email}</Text>}
                </View>

                <View style={styles.statusToggle}>
                  <Switch
                    value={t.is_active}
                    onValueChange={() => handleToggleActive(t)}
                    trackColor={{ false: '#cbd5e1', true: '#efa91f' }}
                    thumbColor={t.is_active ? '#123f62' : '#f1f5f9'}
                  />
                </View>
              </View>

              {t.bio && <Text style={styles.teacherBio}>"{t.bio}"</Text>}

              <View style={styles.teacherActions}>
                <Pressable style={styles.editBtn} onPress={() => handleEdit(t)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(t)}>
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
  photoUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  photoPreviewBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#efa91f',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderText: {
    fontSize: 28,
  },
  photoUploadActions: {
    gap: 8,
  },
  removePhotoBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removePhotoBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
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
  teachersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 30,
  },
  teacherCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  teacherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  teacherAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#efa91f',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 169, 31, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: '#123f62',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  teacherSubject: {
    fontSize: 12,
    color: '#efa91f',
    fontWeight: '700',
    marginTop: 1,
  },
  teacherContact: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  statusToggle: {},
  teacherBio: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 12,
  },
  teacherActions: {
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
