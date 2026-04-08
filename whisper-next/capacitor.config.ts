import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whisperapp.social',
  appName: 'Whisper',
  // Kada deplojojes na Vercel, zameni ovu URL sa tvojom produkcijskom URL
  server: {
    url: 'https://your-app.vercel.app',
    cleartext: false,
  },
  // Za lokalni development, zakomentariši server blok gore i otkomentariši ovo:
  // webDir: 'out',
  ios: {
    contentInset: 'always',
    backgroundColor: '#0E0E0F',
  },
  android: {
    backgroundColor: '#0E0E0F',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0E0E0F',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0E0E0F',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
