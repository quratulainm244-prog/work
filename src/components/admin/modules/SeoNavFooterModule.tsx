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
import { saveSiteSetting, SiteSettingsState } from '@/lib/admin-api';

interface SeoNavFooterModuleProps {
  settings: SiteSettingsState;
  onRefresh: () => void;
}

export function SeoNavFooterModule({
  settings,
  onRefresh,
}: SeoNavFooterModuleProps) {
  const [seo, setSeo] = useState(settings.seo);
  const [footerTagline, setFooterTagline] = useState(settings.branding.tagline);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteSetting('seo', seo);
      await saveSiteSetting('branding', {
        ...settings.branding,
        tagline: footerTagline,
      });
      setMessage({ type: 'success', text: 'SEO & Footer settings updated successfully!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save SEO settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>SEO & Footer Configuration</Text>
        <Text style={styles.subtitle}>
          Optimize school search rankings on Google and configure footer copyright details.
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

      {/* SEO Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Search Engine Optimization (SEO)</Text>
        <Text style={styles.cardSubtitle}>
          These details are indexed by Google, Bing, and shown when sharing links on Facebook or WhatsApp.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Meta Browser Title</Text>
          <TextInput
            style={styles.input}
            value={seo.metaTitle}
            onChangeText={(text) => setSeo({ ...seo, metaTitle: text })}
            placeholder="Kindergarten Saadia's Montessori School | Haripur"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Meta Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={seo.metaDescription}
            onChangeText={(text) => setSeo({ ...seo, metaDescription: text })}
            placeholder="Brief summary of your Montessori school for search results..."
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Search Keywords (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={seo.keywords}
            onChangeText={(text) => setSeo({ ...seo, keywords: text })}
            placeholder="Montessori, Haripur, kindergarten, primary school"
          />
        </View>
      </View>

      {/* Footer Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Footer Content</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Footer Motto / Slogan</Text>
          <TextInput
            style={styles.input}
            value={footerTagline}
            onChangeText={setFooterTagline}
            placeholder="Learn • Grow • Succeed"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Copyright Notice Preview</Text>
          <View style={styles.copyrightBox}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} {settings.branding.fullName || "Kindergarten Saadia's Montessori School"}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Save SEO & Footer Settings</Text>
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
  copyrightBox: {
    backgroundColor: '#0a1d30',
    padding: 14,
    borderRadius: 8,
  },
  copyrightText: {
    color: '#d6d6d6',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
