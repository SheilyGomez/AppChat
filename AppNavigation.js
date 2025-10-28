import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importaciones de pantallas de la aplicación principal
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import NewChatScreen from './screens/NewChatScreen';

// Importaciones de pantallas de autenticación
import LoginScreen from './screens/AuthScreens/LoginScreen';
import RegistroScreen from './screens/AuthScreens/RegistroScreen';

import { auth } from './config/firebaseConfigEjemplo';

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
      headerShown: false,
      tabBarActiveTintColor: '#007bff',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingVertical: 5,
        height: 70,
      },
      tabBarLabelStyle: {
        fontSize: 12,
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
    <Tab.Screen name="Ajustes" component={SettingsScreen} />
  </Tab.Navigator>
);

// --- Stack principal de la aplicación ---
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={AppTabs} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen 
      name="NewChat" 
      component={NewChatScreen}
      options={{ title: 'Nuevo Chat' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = useState(null);
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
