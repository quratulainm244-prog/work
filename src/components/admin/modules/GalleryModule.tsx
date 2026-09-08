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
  GalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImageToStorage,
} from '@/lib/admin-api';

interface GalleryModuleProps {
  items: GalleryItem[];
  onRefresh: () => void;
  loading: boolean;
}

const webGalleryUploadStyle: any = {
  backgroundColor: '#efa91f',
  color: '#0a1d30',
  padding: '12px 18px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: '900',
  cursor: 'pointer',
  textAlign: 'center',
  display: 'inline-block',
  marginTop: 6,
};

export function GalleryModule({ items, onRefresh, loading }: GalleryModuleProps) {
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Campus Life');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    try {
      const publicUrl = await uploadImageToStorage(file, 'gallery');
      await createGalleryItem({
        title: newTitle.trim() || 'KSM Campus Life',
        category: newCategory,
        image_url: publicUrl,
        sort_order: items.length + 1,
        is_active: true,
      });

      setFeedback({ type: 'success', text: 'Photo uploaded to Supabase Storage and published!' });
      setNewTitle('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to upload photo.' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { is_active: !item.is_active });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update visibility.' });
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm(`Delete photo "${item.title || 'Untitled'}"?`)) return;
    try {
      await deleteGalleryItem(item.id, item.image_url);
      setFeedback({ type: 'success', text: 'Photo deleted from database and storage.' });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete photo.' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>School Photo Gallery</Text>
          <Text style={styles.subtitle}>
            Upload, order, and toggle photographs displayed in the school gallery.
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Gallery</Text>
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

      {/* Upload Card */}
      <View style={styles.uploadCard}>
        <Text style={styles.uploadCardTitle}>Add New Photograph</Text>
        <Text style={styles.uploadCardSubtitle}>
          Select an image from your computer to store in Supabase Storage.
        </Text>

        <View style={styles.uploadForm}>
          <View style={styles.field}>
            <Text style={styles.label}>Photo Title / Caption</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Creative Montessori Activities"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g. Campus, Activities, Events, Art"
            />
          </View>

          {Platform.OS === 'web' && (
            <label style={webGalleryUploadStyle}>
              {uploading ? 'Uploading to Supabase...' : '📁 Select & Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          )}

          {uploading && (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color="#efa91f" />
              <Text style={styles.uploadingText}>Uploading file to school-assets bucket...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Photos Grid */}
      <Text style={styles.sectionHeader}>Existing Photographs ({items.length})</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#efa91f" />
          <Text style={styles.loadingText}>Loading gallery images...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyTitle}>No Photos in Gallery</Text>
          <Text style={styles.emptySubtitle}>
            Upload photographs above to showcase student activities.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />

              <View style={styles.cardDetails}>
                <Text style={styles.photoTitle} numberOfLines={1}>
                  {item.title || 'Untitled Photo'}
                </Text>
                <Text style={styles.photoCategory}>{item.category || 'General'}</Text>

                <View style={styles.cardRow}>
                  <Text style={styles.visibleLabel}>
                    {item.is_active ? 'Visible on Website' : 'Hidden'}
                  </Text>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => handleToggleActive(item)}
                    trackColor={{ false: '#cbd5e1', true: '#efa91f' }}
                    thumbColor={item.is_active ? '#123f62' : '#f1f5f9'}
                  />
                </View>

                <Pressable
                  style={styles.deletePhotoBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deletePhotoText}>Delete Photo</Text>
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
  uploadCard: {
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
  uploadCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#123f62',
    marginBottom: 4,
  },
  uploadCardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  uploadForm: {
    gap: 12,
  },
  field: {},
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
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  uploadingText: {
    fontSize: 12,
    color: '#efa91f',
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
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 30,
  },
  gridCard: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  cardDetails: {
    padding: 14,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#123f62',
  },
  photoCategory: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 10,
  },
  visibleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  deletePhotoBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  deletePhotoText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
