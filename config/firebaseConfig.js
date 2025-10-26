import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0INdj2IUUa-LKoCXH9Y-0BCxF4NyB7t8",
  authDomain: "appchat-51fdf.firebaseapp.com",
  databaseURL: "https://appchat-51fdf-default-rtdb.firebaseio.com",
  projectId: "appchat-51fdf",
  storageBucket: "appchat-51fdf.firebasestorage.app",
  messagingSenderId: "614833571557",
  appId: "1:614833571557:web:f2dce513b17bb46378b60c",
  measurementId: "G-S2L4FJ5DJL"
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