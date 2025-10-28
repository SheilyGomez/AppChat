import React from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native'; 

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar tu sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, Cerrar Sesión",
          onPress: async () => {
            try {
              await auth.signOut();
              // El `AppNarigator` detectará que `user` es `null`
              // y automáticamente navegará al `AuthStack`.
              Alert.alert("¡Adiós!", "Has cerrado sesión correctamente.");
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar sesión. Inténtalo de nuevo.");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#dc3545', // Rojo para cerrar sesión
    width: '80%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;