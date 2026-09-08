import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { saveSiteSetting, SiteSettingsState } from '@/lib/admin-api';

interface SectionsManagerModuleProps {
  settings: SiteSettingsState;
  onRefresh: () => void;
}

const SECTION_DESCRIPTIONS: Record<string, { label: string; desc: string; icon: string }> = {
  hero: {
    label: 'Hero & 3D Crest Animation',
    desc: 'Main welcome headline, CTA buttons, and 3D rabbit mascot animation stage.',
    icon: '✨',
  },
  features: {
    label: 'Key Features Cards',
    desc: 'Quality Education, Caring Teachers, and Bright Future value cards.',
    icon: '🎓',
  },
  about: {
    label: 'About Our School',
    desc: 'Montessori mission statement, learning philosophy, and history.',
    icon: '🏫',
  },
  programs: {
    label: 'Programs & Levels',
    desc: 'Early Learning, Primary Education, and Student Development curricula.',
    icon: '📚',
  },
  why: {
    label: 'Why Choose Us',
    desc: 'Student-focused care, positive environment, and holistic growth.',
    icon: '⭐',
  },
  activities: {
    label: 'Montessori Activities',
    desc: 'Practical life exercises, sensory development, and language activities.',
    icon: '🎨',
  },
  gallery: {
    label: 'School Gallery',
    desc: 'Photographs of campus life, classroom moments, and student work.',
    icon: '🖼️',
  },
  testimonials: {
    label: 'Parent Testimonials',
    desc: 'Quotes and reviews from families and alumni.',
    icon: '💬',
  },
  admissions: {
    label: 'Admissions Call to Action',
    desc: 'Admissions open banner and button that triggers online application modal.',
    icon: '📝',
  },
  contact: {
    label: 'Contact & Location Info',
    desc: 'Haripur campus address, official Facebook button, and school phone.',
    icon: '📍',
  },
};

export function SectionsManagerModule({
  settings,
  onRefresh,
}: SectionsManagerModuleProps) {
  const [sections, setSections] = useState(settings.sections);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = (key: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteSetting('sections', sections);
      setMessage({ type: 'success', text: 'Homepage section visibility updated!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update section visibility.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Homepage Sections Manager</Text>
        <Text style={styles.subtitle}>
          Turn sections on or off to control what visitors see on the public homepage.
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

      <View style={styles.listCard}>
        {Object.entries(SECTION_DESCRIPTIONS).map(([key, info]) => {
          const isEnabled = sections[key as keyof typeof sections] ?? true;

          return (
            <View key={key} style={styles.sectionRow}>
              <Text style={styles.sectionIcon}>{info.icon}</Text>
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionLabel}>{info.label}</Text>
                <Text style={styles.sectionDesc}>{info.desc}</Text>
              </View>

              <Switch
                value={isEnabled}
                onValueChange={() => handleToggle(key as keyof typeof sections)}
                trackColor={{ false: '#cbd5e1', true: '#efa91f' }}
                thumbColor={isEnabled ? '#123f62' : '#f1f5f9'}
              />
            </View>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Section Visibility</Text>
        )}
      </Pressable>
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
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 14,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#123f62',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
