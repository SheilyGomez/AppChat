import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { database } from '../config/firebaseConfig';
import { ref, onValue, off } from 'firebase/database';
import { auth } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const chatsRef = ref(database, 'metaDatosChat');
    
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      try {
        const chatsData = snapshot.val();
        const chatsArray = [];

        if (chatsData) {
          Object.keys(chatsData).forEach(userId => {
            const userChats = chatsData[userId];
            
            if (userChats && typeof userChats === 'object') {
              Object.keys(userChats).forEach(chatId => {
                const chat = userChats[chatId];
                
                if (chat && (
                  userId === currentUser.uid || 
                  chat.utimaParticipacionId === currentUser.uid
                )) {
                  chatsArray.push({
                    id: chatId,
                    userId: userId,
                    lastMessageTimestamp: chat.lastMessageTimestamp || 0,
                    nombreUltimoParticipante: chat.nombreUltimoParticipante || 'Usuario',
                    ultimoMensaje: chat.ultimoMensaje || 'Nuevo chat',
                    utimaParticipacionId: chat.utimaParticipacionId || ''
                  });
                }
              });
            }
          });
        }

        chatsArray.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        setChats(chatsArray);
        setLoading(false);
      } catch (error) {
        console.error('Error procesando chats:', error);
        Alert.alert('Error', 'Error al cargar los chats');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error leyendo chats:', error);
      Alert.alert('Error', 'No se pudieron cargar los chats');
      setLoading(false);
    });


    return () => off(chatsRef);
  }, [currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp || timestamp === 0) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays === 1) {
        return 'Ayer';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('es-ES', { 
          weekday: 'short' 
        });
      } else {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        });
      }
    } catch (error) {
      return '';
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        navigation.navigate('Chat', { 
          chatId: item.id,
          otherUserId: item.userId === currentUser.uid ? item.utimaParticipacionId : item.userId
        });
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.nombreUltimoParticipante.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.nombreUltimoParticipante}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(item.lastMessageTimestamp)}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.ultimoMensaje}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay chats disponibles</Text>
          <Text style={styles.emptySubtext}>
            Inicia una conversación con alguien desde la pestaña "Usuarios"
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f0f2f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

export default ChatListScreen;