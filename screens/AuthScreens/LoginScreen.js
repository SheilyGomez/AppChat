import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet,  Alert,  TouchableOpacity, ActivityIndicator} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../../config/firebaseConfig'; 
import { useNavigation } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const navigation = useNavigation();

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    setLoading(true); // Activa el indicador de carga
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Si el inicio de sesión es exitoso, AppNavigator detectará el cambio de estado
      // del usuario y navegará automáticamente a AppStack.
      Alert.alert('¡Éxito!', 'Has iniciado sesión correctamente.');
    } catch (error) {
      // Manejo de errores de Firebase
      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
      if (error.code === 'auth/invalid-email:' + error) {
        errorMessage = 'El formato del correo electrónico es inválido.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
      }
      Alert.alert('Error de inicio de sesión', errorMessage);
      console.error('Error de inicio de sesión:', error.message);
    } finally {
      setLoading(false); // Desactiva el indicador de carga
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido de nuevo</Text>
      <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

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
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Registro')}
      >
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
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
    backgroundColor: '#f0f2f5', // Fondo claro
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
    backgroundColor: '#007bff', // Azul brillante
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

export default LoginScreen;