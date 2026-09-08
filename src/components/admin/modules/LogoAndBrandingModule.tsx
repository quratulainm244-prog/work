import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  saveSiteSetting,
  SiteSettingsState,
  uploadImageToStorage,
  deleteImageFromStorage,
} from '@/lib/admin-api';

interface LogoAndBrandingModuleProps {
  settings: SiteSettingsState;
  onRefresh: () => void;
}

const webUploadLabelStyle: any = {
  backgroundColor: '#123f62',
  color: '#ffffff',
  padding: '10px 16px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-block',
};

export function LogoAndBrandingModule({
  settings,
  onRefresh,
}: LogoAndBrandingModuleProps) {
  const [branding, setBranding] = useState(settings.branding);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteSetting('branding', branding);
      setMessage({ type: 'success', text: 'School branding updated successfully!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update branding.' });
    } finally {
      setSaving(false);
    }
  };

  const handleWebFileUpload = async (event: any) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const publicUrl = await uploadImageToStorage(file, 'logos');
      const updated = { ...branding, logoUrl: publicUrl };
      setBranding(updated);
      await saveSiteSetting('branding', updated);
      setMessage({ type: 'success', text: 'New school logo uploaded and saved to Supabase Storage!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload logo image.' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!branding.logoUrl) return;
    setSaving(true);
    try {
      await deleteImageFromStorage(branding.logoUrl);
      const updated = { ...branding, logoUrl: '' };
      setBranding(updated);
      await saveSiteSetting('branding', updated);
      setMessage({ type: 'success', text: 'Logo removed. School emblem will be used.' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove logo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>School Logo & Brand Identity</Text>
        <Text style={styles.subtitle}>
          Manage your official school logo, display names, and motto.
        </Text>
      </View>

      {message && (
        <View
          style={[
            styles.messageBox,
            message.type === 'success' ? styles.messageSuccess : styles.messageError,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.type === 'success' ? styles.messageTextSuccess : styles.messageTextError,
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}

      {/* Logo Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Official School Logo</Text>
        <Text style={styles.cardSubtitle}>
          Upload your high-resolution crest or emblem (PNG, JPG, or SVG recommended).
        </Text>

        <View style={styles.logoPreviewRow}>
          <View style={styles.logoBox}>
            {branding.logoUrl ? (
              <Image source={{ uri: branding.logoUrl }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <View style={styles.defaultEmblem}>
                <Text style={styles.defaultEmblemText}>K</Text>
              </View>
            )}
          </View>

          <View style={styles.logoActions}>
            <Text style={styles.logoStatusText}>
              {branding.logoUrl ? 'Active Logo Loaded from Storage' : 'Default Montessori Emblem in use'}
            </Text>

            <View style={styles.buttonGroup}>
              {Platform.OS === 'web' && (
                <label style={webUploadLabelStyle}>
                  {uploading ? 'Uploading...' : '📁 Upload New Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWebFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              )}

              {branding.logoUrl ? (
                <Pressable
                  style={styles.removeButton}
                  onPress={handleRemoveLogo}
                  disabled={saving}
                >
                  <Text style={styles.removeButtonText}>Remove Logo</Text>
                </Pressable>
              ) : null}
            </View>

            {uploading && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator size="small" color="#efa91f" />
                <Text style={styles.uploadingText}>Uploading to Supabase Storage...</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Brand Text Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>School Name & Titles</Text>

        <View style={styles.field}>
          <Text style={styles.label}>School Name (Header Title)</Text>
          <TextInput
            style={styles.input}
            value={branding.schoolName}
            onChangeText={(text) => setBranding({ ...branding, schoolName: text })}
            placeholder="e.g. KINDERGARTEN SAADIA'S"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Official School Name</Text>
          <TextInput
            style={styles.input}
            value={branding.fullName}
            onChangeText={(text) => setBranding({ ...branding, fullName: text })}
            placeholder="e.g. Kindergarten Saadia's Montessori School"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>School Motto / Tagline</Text>
          <TextInput
            style={styles.input}
            value={branding.tagline}
            onChangeText={(text) => setBranding({ ...branding, tagline: text })}
            placeholder="e.g. Learn • Grow • Succeed"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mascot Title / 3D Animation Name</Text>
          <TextInput
            style={styles.input}
            value={branding.mascotName}
            onChangeText={(text) => setBranding({ ...branding, mascotName: text })}
            placeholder="e.g. KSM Rabbit Mascot"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Brand Settings</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 20,
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
  messageBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  messageSuccess: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  messageError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageTextSuccess: {
    color: '#065f46',
  },
  messageTextError: {
    color: '#991b1b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 22,
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  logoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#0a1d30',
    borderWidth: 2,
    borderColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 84,
    height: 84,
  },
  defaultEmblem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#efa91f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultEmblemText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0a1d30',
  },
  logoActions: {
    flex: 1,
    minWidth: 220,
  },
  logoStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  uploadingText: {
    fontSize: 12,
    color: '#efa91f',
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
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
  saveBtn: {
    backgroundColor: '#efa91f',
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
    color: '#0a1d30',
    fontSize: 15,
    fontWeight: '900',
  },
});
