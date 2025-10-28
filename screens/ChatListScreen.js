import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { ref, onValue, off, query, orderByChild } from 'firebase/database';
import { database, auth } from '../config/firebaseConfigEjemplo';

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'Usuario no autenticado');
      navigation.navigate('Login');
      return;
    }

    // Referencia a los metadatos del chat del usuario actual
    const userChatsRef = ref(database, `metaDatosChat/${currentUser.uid}`);
    const chatsQuery = query(userChatsRef, orderByChild('lastMessageTimestamp'));

    const unsubscribe = onValue(chatsQuery, (snapshot) => {
      const chatsData = snapshot.val();
      if (chatsData) {
        const chatsArray = Object.keys(chatsData).map(chatId => ({
          id: chatId,
          ...chatsData[chatId]
        })).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        
        setChats(chatsArray);
      } else {
        setChats([]);
      }
      setLoading(false);
    });

    return () => off(userChatsRef, 'value', unsubscribe);
  }, [navigation]);

  const openChat = (chat) => {
    navigation.navigate('Chat', { 
      chatId: chat.id,
      chatName: chat.nombreUltimoParticipante || 'Chat'
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.nombreUltimoParticipante || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>
          {item.nombreUltimoParticipante || 'Usuario'}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.ultimoMensaje || 'Nuevo chat'}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {item.lastMessageTimestamp ? 
          new Date(item.lastMessageTimestamp).toLocaleDateString() : 
          'Nuevo'
        }
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando chats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Espacio para la barra de estado */}
      <View style={styles.statusBarPlaceholder} />
      
      {/* Header - AHORA DEBAJO DE LA BARRA DE ESTADO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Chats</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Text style={styles.newChatButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de chats */}
      <View style={styles.listContainer}>
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes chats</Text>
              <Text style={styles.emptySubtext}>
                Presiona "+ Nuevo" para empezar una conversación
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // Sombras sutiles para el header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  newChatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Sombras sutiles para cada item
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 13,
    color: '#999',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatListScreen;