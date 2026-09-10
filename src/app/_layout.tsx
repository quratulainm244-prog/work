import '@/global.css';
import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
  usePathname,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />

      {/* Show the actual website instead of the Expo Starter tabs */}
      <Slot />
    </ThemeProvider>
  );
}