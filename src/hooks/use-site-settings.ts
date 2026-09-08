import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettings,
  SiteSettingsState,
} from '@/lib/admin-api';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsState>(DEFAULT_SITE_SETTINGS);
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
  }, []);

  return { settings, loading, reloadSettings };
}
