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

interface ContactSocialModuleProps {
  settings: SiteSettingsState;
  onRefresh: () => void;
}

export function ContactSocialModule({
  settings,
  onRefresh,
}: ContactSocialModuleProps) {
  const [contact, setContact] = useState(settings.contact);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteSetting('contact', contact);
      setMessage({ type: 'success', text: 'Contact & Social media links updated successfully!' });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update contact info.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Information & Social Links</Text>
        <Text style={styles.subtitle}>
          Manage campus location, telephone, official Facebook page, WhatsApp, and email.
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

      {/* Campus Location & Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Campus Location & Info</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Campus Physical Location</Text>
          <TextInput
            style={styles.input}
            value={contact.location}
            onChangeText={(text) => setContact({ ...contact, location: text })}
            placeholder="e.g. Haripur, Khyber Pakhtunkhwa, Pakistan"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>School Level / Classification</Text>
          <TextInput
            style={styles.input}
            value={contact.level}
            onChangeText={(text) => setContact({ ...contact, level: text })}
            placeholder="e.g. Primary / Montessori education"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Telephone / Mobile</Text>
            <TextInput
              style={styles.input}
              value={contact.phone}
              onChangeText={(text) => setContact({ ...contact, phone: text })}
              placeholder="e.g. +92 995 000000"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Official School Email</Text>
            <TextInput
              style={styles.input}
              value={contact.email}
              onChangeText={(text) => setContact({ ...contact, email: text })}
              placeholder="e.g. info@ksmschool.edu.pk"
            />
          </View>
        </View>
      </View>

      {/* Social Media Links */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Social Media & Messenger Integrations</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Facebook Page Display Name</Text>
          <TextInput
            style={styles.input}
            value={contact.facebookName}
            onChangeText={(text) => setContact({ ...contact, facebookName: text })}
            placeholder="e.g. Kindergarten Saadia's Montessori School"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Facebook Page URL</Text>
          <TextInput
            style={styles.input}
            value={contact.facebookUrl}
            onChangeText={(text) => setContact({ ...contact, facebookUrl: text })}
            placeholder="https://www.facebook.com/Kindergarten786/"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>WhatsApp Number (with country code)</Text>
            <TextInput
              style={styles.input}
              value={contact.whatsappNumber}
              onChangeText={(text) => setContact({ ...contact, whatsappNumber: text })}
              placeholder="+92 300 1234567"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Instagram Profile URL (Optional)</Text>
            <TextInput
              style={styles.input}
              value={contact.instagramUrl}
              onChangeText={(text) => setContact({ ...contact, instagramUrl: text })}
              placeholder="https://instagram.com/ksmschool"
            />
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
            <Text style={styles.saveBtnText}>Save Contact & Social Details</Text>
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
  saveBtn: {
    backgroundColor: '#efa91f',
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
    color: '#0a1d30',
    fontSize: 15,
    fontWeight: '900',
  },
});
