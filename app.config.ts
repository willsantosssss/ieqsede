import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';
import church from './config/church.json';
const config: ExpoConfig = {
  name: church.name, slug: church.slug, scheme: church.scheme,
  version: '0.1.0', orientation: 'default', userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: { bundleIdentifier: church.iosBundleId, supportsTablet: true },
  android: {
    package: church.androidPackage, versionCode: 1,
    permissions: ['POST_NOTIFICATIONS'],
    blockedPermissions: ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.RECORD_AUDIO'],
  },
  web: { bundler: 'metro', output: 'single' },
  plugins: ['expo-router', 'expo-secure-store', 'expo-notifications', 'expo-splash-screen'],
  experiments: { typedRoutes: true },
};
export default config;
