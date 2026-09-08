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

interface ThemeDesignModuleProps {
  settings: SiteSettingsState;
  onRefresh: () => void;
}

export function ThemeDesignModule({ settings, onRefresh }: ThemeDesignModuleProps) {
  const [theme, setTheme] = useState(settings.theme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteSetting('theme', theme);
      setMessage({ type: 'success', text: 'Theme & Design settings saved successfully!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save theme settings.' });
    } finally {
      setSaving(false);
    }
  };

  const PRESET_PALETTES = [
    {
      name: 'Classic KSM Royal Gold',
      primary: '#123f62',
      secondary: '#efa91f',
      accent: '#0a1d30',
      background: '#ffffff',
    },
    {
      name: 'Montessori Forest Teal',
      primary: '#0f4c5c',
      secondary: '#fb8b24',
      accent: '#08252d',
      background: '#ffffff',
    },
    {
      name: 'Academic Sapphire',
      primary: '#1e3a8a',
      secondary: '#f59e0b',
      accent: '#0f172a',
      background: '#ffffff',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Website Design & Theme</Text>
        <Text style={styles.subtitle}>
          Customize website colors, typography, button curvature, and layout styles.
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

      {/* Preset Palettes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>One-Click Color Presets</Text>
        <View style={styles.presetsRow}>
          {PRESET_PALETTES.map((preset) => (
            <Pressable
              key={preset.name}
              style={styles.presetCard}
              onPress={() =>
                setTheme({
                  ...theme,
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent,
                  backgroundColor: preset.background,
                })
              }
            >
              <View style={styles.colorPills}>
                <View style={[styles.pill, { backgroundColor: preset.primary }]} />
                <View style={[styles.pill, { backgroundColor: preset.secondary }]} />
                <View style={[styles.pill, { backgroundColor: preset.accent }]} />
              </View>
              <Text style={styles.presetName}>{preset.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Custom Color Palette */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Custom Color Tokens</Text>

        <View style={styles.colorsGrid}>
          <View style={styles.colorField}>
            <Text style={styles.label}>Primary Brand Color (Navy)</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: theme.primaryColor }]} />
              <TextInput
                style={styles.hexInput}
                value={theme.primaryColor}
                onChangeText={(text) => setTheme({ ...theme, primaryColor: text })}
              />
            </View>
          </View>

          <View style={styles.colorField}>
            <Text style={styles.label}>Secondary Accent Color (Gold)</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: theme.secondaryColor }]} />
              <TextInput
                style={styles.hexInput}
                value={theme.secondaryColor}
                onChangeText={(text) => setTheme({ ...theme, secondaryColor: text })}
              />
            </View>
          </View>

          <View style={styles.colorField}>
            <Text style={styles.label}>Dark Accent Color (Stage)</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: theme.accentColor }]} />
              <TextInput
                style={styles.hexInput}
                value={theme.accentColor}
                onChangeText={(text) => setTheme({ ...theme, accentColor: text })}
              />
            </View>
          </View>

          <View style={styles.colorField}>
            <Text style={styles.label}>Page Background Color</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: theme.backgroundColor }]} />
              <TextInput
                style={styles.hexInput}
                value={theme.backgroundColor}
                onChangeText={(text) => setTheme({ ...theme, backgroundColor: text })}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Typography & Geometry */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Typography & Button Radius</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Heading Font Family</Text>
          <TextInput
            style={styles.input}
            value={theme.fontHeading}
            onChangeText={(text) => setTheme({ ...theme, fontHeading: text })}
            placeholder="e.g. Spline Sans, Inter, Outfit"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Body Font Family</Text>
          <TextInput
            style={styles.input}
            value={theme.fontBody}
            onChangeText={(text) => setTheme({ ...theme, fontBody: text })}
            placeholder="e.g. Inter, Roboto, sans-serif"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Corner Radius (Pixels)</Text>
          <TextInput
            style={styles.input}
            value={String(theme.buttonRadius || 8)}
            keyboardType="numeric"
            onChangeText={(text) =>
              setTheme({ ...theme, buttonRadius: parseInt(text) || 8 })
            }
          />
        </View>
      </View>

      {/* Live Preview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Component Preview</Text>
        <Text style={styles.cardSubtitle}>Real-time preview of buttons and badges with your chosen palette.</Text>

        <View style={[styles.previewContainer, { backgroundColor: theme.backgroundColor }]}>
          <Text style={[styles.previewTitle, { color: theme.primaryColor, fontFamily: theme.fontHeading }]}>
            Kindergarten Saadia's Montessori
          </Text>
          <Text style={[styles.previewBody, { color: '#64748b', fontFamily: theme.fontBody }]}>
            Building bright futures together through holistic early education.
          </Text>

          <View style={styles.previewButtonsRow}>
            <View
              style={[
                styles.previewButton,
                {
                  backgroundColor: theme.secondaryColor,
                  borderRadius: theme.buttonRadius || 8,
                },
              ]}
            >
              <Text style={styles.previewButtonTextPrimary}>Apply for Admission</Text>
            </View>

            <View
              style={[
                styles.previewButtonOutline,
                {
                  borderColor: theme.primaryColor,
                  borderRadius: theme.buttonRadius || 8,
                },
              ]}
            >
              <Text style={[styles.previewButtonTextOutline, { color: theme.primaryColor }]}>
                Discover Our School
              </Text>
            </View>
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
            <Text style={styles.saveBtnText}>Save Design Settings</Text>
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
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  presetCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    minWidth: 160,
  },
  colorPills: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  pill: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 10,
  },
  colorField: {
    flex: 1,
    minWidth: 180,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorPreview: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  hexInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  field: {
    marginBottom: 16,
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
  previewContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewButtonTextPrimary: {
    color: '#0a1d30',
    fontWeight: '800',
    fontSize: 13,
  },
  previewButtonOutline: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  previewButtonTextOutline: {
    fontWeight: '800',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#123f62',
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
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
