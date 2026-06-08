import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: 'AIzaSyAONK_kRVNGLjI_k3jIR9jyG-1kre5pzl8',
  authDomain: 'veste-app-bffb0.firebaseapp.com',
  projectId: 'veste-app-bffb0',
  storageBucket: 'veste-app-bffb0.firebasestorage.app',
  messagingSenderId: '1029398639222',
  appId: '1:1029398639222:web:e19ff90b8b8c8155592557',
  measurementId: 'G-GJVH5YKLXD',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

if (process.env.NODE_ENV === 'development' || typeof __DEV__ !== 'undefined') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export const db = getFirestore(app);

export { getFirestore };

export let analytics = null;

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  });
}
