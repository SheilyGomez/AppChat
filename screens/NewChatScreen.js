import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { ref, onValue, off, set, push } from 'firebase/database';
import { database, auth } from '../config/firebaseConfigEjemplo';

const NewChatScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Error', 'Usuario no autenticado');
      navigation.goBack();
      return;
    }

    const usersRef = ref(database, 'Usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.keys(usersData)
          .map(key => ({
            id: key,
            ...usersData[key]
          }))
          .filter(user => user.id !== currentUser.uid); // Excluir al usuario actual
        
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });

    return () => off(usersRef, 'value', unsubscribe);
  }, [currentUser, navigation]);

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewChat = async (otherUser) => {
    try {
      // Crear nuevo chat
      const newChatRef = push(ref(database, 'Chats'));
      const chatId = newChatRef.key;

      // Estructura del chat
      const chatData = {
        participantes: {
          [currentUser.uid]: true,
          [otherUser.id]: true
        },
        mensajes: {}
      };

      await set(newChatRef, chatData);

      // Obtener nombre del usuario actual
      const currentUserRef = ref(database, `Usuarios/${currentUser.uid}`);
      let currentUserName = currentUser.email.split('@')[0];
      
      onValue(currentUserRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.nombre) {
          currentUserName = userData.nombre;
        }
      }, { onlyOnce: true });

      // Crear metadatos para ambos usuarios
      const metadata = {
        lastMessageTimestamp: Date.now(),
        ultimoMensaje: 'Chat iniciado',
        utimaParticipacionId: currentUser.uid
      };

      // Metadatos para el usuario actual (mostrar nombre del otro usuario)
      await set(
        ref(database, `metaDatosChat/${currentUser.uid}/${chatId}`),
        {
          ...metadata,
          nombreUltimoParticipante: otherUser.nombre
        }
      );

      // Metadatos para el otro usuario (mostrar nuestro nombre)
      await set(
        ref(database, `metaDatosChat/${otherUser.id}/${chatId}`),
        {
          ...metadata,
          nombreUltimoParticipante: currentUserName
        }
      );

      // Navegar al nuevo chat
      navigation.navigate('Chat', {
        chatId: chatId,
        chatName: otherUser.nombre
      });

    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el chat');
      console.error('Error creating chat:', error);
    }
  };

  const startNewChat = (user) => {
    Alert.alert(
      'Nuevo Chat',
      `¿Iniciar chat con ${user.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Iniciar',
          onPress: () => createNewChat(user)
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => startNewChat(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.nombre.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre}</Text>
        <Text style={styles.userEmail}>{item.correo}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Chat</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuarios por nombre o email..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NewChatScreen;