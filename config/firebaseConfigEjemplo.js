import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa el servicio de autenticación de Firebase (Firebase Auth).
// Se le pasa la instancia de la aplicación 'app' y un objeto de configuración.
// 'persistence': Configura cómo se mantiene la sesión del usuario.
//   'getReactNativePersistence(ReactNativeAsyncStorage)': Indica a Firebase Auth
//   que use AsyncStorage de React Native para guardar y restaurar el estado de autenticación
//   (ej. token del usuario) entre sesiones de la aplicación.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicializa el servicio de Realtime Database de Firebase.
// Se le pasa la instancia de la aplicación 'app'.
// Esta instancia 'database' se usará para interactuar con tu base de datos en tiempo real.
export const database = getDatabase(app); 

export default app;