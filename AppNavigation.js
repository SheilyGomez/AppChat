import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// Importaciones de pantallas de la aplicación principal
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import UsersListScreen from './screens/UsersListScreen';
import SettingsScreen from './screens/SettingsScreen';

// Importaciones de pantallas de autenticación
import LoginScreen from './screens/AuthScreens/LoginScreen';
import RegistroScreen from './screens/AuthScreens/RegistroScreen';

import { auth } from './config/firebaseConfig'; // Importa auth

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Stack para Autenticación ---
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Registro" component={RegistroScreen} />
  </Stack.Navigator>
);

// --- Bottom Tab Navigator para la Aplicación Principal ---
const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false, // Oculta el encabezado de las pantallas individuales en las pestañas
      tabBarActiveTintColor: '#007bff', // Color de los íconos/texto activos
      tabBarInactiveTintColor: 'gray', // Color de los íconos/texto inactivos
      tabBarStyle: {
        backgroundColor: '#fff', // Color de fondo de la barra de pestañas
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingVertical: 5,
        height: 70, // Altura de la barra
      },
      tabBarLabelStyle: {
        fontSize: 12, // Tamaño del texto de la etiqueta
        marginBottom: 5,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Chats') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'Usuarios') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Ajustes') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Chats" component={ChatListScreen} />
    <Tab.Screen name="Usuarios" component={UsersListScreen} />
    <Tab.Screen name="Ajustes" component={SettingsScreen} />
  </Tab.Navigator>
);


const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={AppTabs} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);


const AppNavigator = () => {
  const [user, setUser] = useState(null); // Inicialmente null, no ""
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(user => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) {
    return null; 
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;