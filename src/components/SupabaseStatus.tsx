import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabaseUrl, testSupabaseConnection } from '@/lib/supabase';

export function SupabaseStatus() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    testSupabaseConnection().then((res) => {
      if (res.success) {
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorMessage(res.message);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        {status === 'testing' && (
          <>
            <ActivityIndicator size="small" color="#efa91f" />
            <Text style={styles.text}>Connecting to Supabase...</Text>
          </>
        )}
        {status === 'connected' && (
          <>
            <View style={styles.dotConnected} />
            <Text style={styles.textConnected}>
              Supabase Connected ({supabaseUrl.replace('https://', '')})
            </Text>
          </>
        )}
        {status === 'error' && (
          <>
            <View style={styles.dotError} />
            <Text style={styles.textError}>Supabase Error: {errorMessage}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f2b42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  text: {
    color: '#d6d6d6',
    fontSize: 12,
    fontWeight: '600',
  },
  dotConnected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  textConnected: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  dotError: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  textError: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
});
