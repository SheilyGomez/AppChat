import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ123456789",
  authDomain: "appchat-51fdf.firebaseapp.com",
  databaseURL: "https://appchat-51fdf-default-rtdb.firebaseio.com",
  projectId: "appchat-51fdf",
  storageBucket: "appchat-51fdf.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ CAMBIA ESTO - usa getAuth en lugar de initializeAuth
import { getAuth } from 'firebase/auth';

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;