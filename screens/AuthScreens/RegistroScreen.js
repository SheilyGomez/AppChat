import React, { useState } from 'react';
import {  View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { ref, set } from 'firebase/database';
//La función ref() es utilizada para crear una referencia a una ubicación 
//específica dentro de tu Firebase Realtime Database

//La función set() se utiliza para escribir o sobrescribir datos en la ubicación a 
// la que apunta una referencia de base de datos. Si ya existen datos en esa ubicación, 
// set() los reemplazará completamente con los nuevos datos que le proporciones.


import { auth, database } from '../../config/firebaseConfig'; // Importa 'database' también
import { useNavigation } from '@react-navigation/native';

const RegistroScreen = () => {
  const [name, setName] = useState(''); // Estado para el nombre del usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Obtenemos el objeto de usuario autenticado

      // 2. Guardar el usuario en Realtime Database usando su UID
      //'Usuarios/' + user.uid: Esta es la ruta. Significa que estamos creando una referencia 
      //a un nodo que está bajo el nodo principal llamado Usuarios, y dentro de Usuarios,
      //habrá otro nodo cuyo nombre será el uid (User ID) del usuario recién registrado.
      //Usuarios/UID 
      const userRef = ref(database, 'Usuarios/' + user.uid); // Ruta en la DB: Usuarios/UID
      
      //set(): La función que escribe los datos en esa ubicación. Necesita la ruta que establecimos 
      // con userRef y los datos que queremos guardar.
      await set(userRef, {
        correo: email,
        nombre: name, 
      });

      Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada. ¡Ahora puedes iniciar sesión!');
      //La funcion auth de AppNavigator detectará el cambio de estado y navegará automáticamente al AuthStack
      // en otras palabras no tendra que pasar por el login
    } catch (error) {
      let errorMessage = 'Error al registrarte. Inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico es inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil.';
      }
      Alert.alert('Error de registro', errorMessage);
      console.error('Error de registro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>
      <Text style={styles.subtitle}>Regístrate para empezar a chatear</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu Nombre Completo"
        placeholderTextColor="#999"
        autoCapitalize="words" // Capitaliza la primera letra de cada palabra
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" />
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '90%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default RegistroScreen;