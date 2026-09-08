import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '@/lib/supabase';

export function AdmissionForm() {
  const [parentName, setParentName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!parentName.trim() || !phoneOrEmail.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in your name and contact details.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      // Try inserting into Supabase 'inquiries' table
      const { data, error } = await supabase.from('inquiries').insert([
        {
          parent_name: parentName,
          contact_info: phoneOrEmail,
          child_name: childName,
          message: message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // If table doesn't exist yet, handle gracefully and provide informative notice
        if (error.code === 'PGRST301' || error.message.includes('find the table')) {
          setFeedback({
            type: 'info',
            text: 'Connected to Supabase! Note: Please create the "inquiries" table in your Supabase SQL Editor to store records permanently.',
          });
        } else {
          setFeedback({
            type: 'error',
            text: `Supabase Response: ${error.message}`,
          });
        }
      } else {
        setFeedback({
          type: 'success',
          text: 'Thank you! Your admission inquiry has been saved directly to Supabase.',
        });
        setParentName('');
        setPhoneOrEmail('');
        setChildName('');
        setMessage('');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'An unexpected error occurred while connecting to Supabase.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Submit Admission Inquiry</Text>
      <Text style={styles.cardSubtitle}>
        Send your details directly to our database powered by Supabase.
      </Text>

      {feedback && (
        <View
          style={[
            styles.feedbackContainer,
            feedback.type === 'success'
              ? styles.feedbackSuccess
              : feedback.type === 'info'
              ? styles.feedbackInfo
              : styles.feedbackError,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'success'
                ? styles.feedbackTextSuccess
                : feedback.type === 'info'
                ? styles.feedbackTextInfo
                : styles.feedbackTextError,
            ]}
          >
            {feedback.text}
          </Text>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Parent / Guardian Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John Doe"
          placeholderTextColor="#999"
          value={parentName}
          onChangeText={setParentName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number or Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +1 234 567 8900 or parent@email.com"
          placeholderTextColor="#999"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Child's Name & Age (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Maya (Age 4)"
          placeholderTextColor="#999"
          value={childName}
          onChangeText={setChildName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Questions or Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your child or ask any questions..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={message}
          onChangeText={setMessage}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit to Supabase</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#123f62',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  feedbackInfo: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackTextSuccess: {
    color: '#065f46',
  },
  feedbackTextInfo: {
    color: '#1e40af',
  },
  feedbackTextError: {
    color: '#991b1b',
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123f62',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#123f62',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
