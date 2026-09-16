import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettings,
  SiteSettingsState,
} from '@/lib/admin-api';

function getInitialSettings(): SiteSettingsState {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('ksm_site_settings_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return DEFAULT_SITE_SETTINGS;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsState>(getInitialSettings);
  const [loading, setLoading] = useState(true);

  const reloadSettings = async () => {
    try {
      const data = await fetchSiteSettings();
      setSettings(data);
    } catch {
      // fallback retained
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail?.all) {
        setSettings(e.detail.all);
      } else if (e?.detail?.key && e?.detail?.value) {
        setSettings((prev) => ({
          ...prev,
          [e.detail.key]: {
            ...(prev as any)[e.detail.key],
            ...e.detail.value,
          },
        }));
      } else {
        reloadSettings();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ksm_site_settings_cache' && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ksm_settings_updated', handleSettingsUpdated);
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ksm_settings_updated', handleSettingsUpdated);
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  return { settings, loading, reloadSettings };
}
