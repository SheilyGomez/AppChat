import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  Animated
} from 'react-native';
import { ref, onValue, push, set, off, query, orderByChild } from 'firebase/database';
import { database, auth } from '../config/firebaseConfigEjemplo';
import MessageBubble from '../src/components/MessageBubble';

const ChatScreen = ({ navigation, route }) => {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!chatId || !currentUser) {
      Alert.alert('Error', 'Chat no disponible');
      navigation.goBack();
      return;
    }

    // Listeners para el teclado
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        // Animación para subir el input
        Animated.timing(translateY, {
          toValue: -e.endCoordinates.height,
          duration: 250,
          useNativeDriver: true,
        }).start();
        
        // Scroll al final cuando el teclado aparece
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        // Animación para bajar el input a su posición original
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    // Referencia a los mensajes del chat
    const messagesRef = ref(database, `Chats/${chatId}/mensajes`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    // Obtener información de los participantes
    const participantsRef = ref(database, `Chats/${chatId}/participantes`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      const participantsData = snapshot.val();
      if (participantsData) {
        const participantIds = Object.keys(participantsData);
        participantIds.forEach(participantId => {
          if (participantId !== currentUser.uid) {
            const userRef = ref(database, `Usuarios/${participantId}`);
            onValue(userRef, (userSnapshot) => {
              const userData = userSnapshot.val();
              if (userData) {
                setParticipants(prev => ({
                  ...prev,
                  [participantId]: userData.nombre
                }));
              }
            }, { onlyOnce: true });
          }
        });
      }
    });

    return () => {
      off(messagesRef, 'value', unsubscribeMessages);
      off(participantsRef, 'value', unsubscribeParticipants);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [chatId, currentUser, navigation, translateY]);

  useEffect(() => {
    // Scroll al final cuando llegan nuevos mensajes
    if (messages.length > 0 && !isKeyboardVisible) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isKeyboardVisible]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser || !chatId) return;

    try {
      const messageData = {
        contenido: newMessage.trim(),
        remitente: currentUser.uid,
        timestamp: Date.now(),
      };

      // Enviar mensaje a Firebase
      const newMessageRef = push(ref(database, `Chats/${chatId}/mensajes`));
      await set(newMessageRef, messageData);

      // Actualizar metadatos del chat
      const userData = await getUserData(currentUser.uid);
      const currentUserName = userData?.nombre || currentUser.email.split('@')[0];
      
      const updateData = {
        lastMessageTimestamp: Date.now(),
        ultimoMensaje: newMessage.trim(),
        utimaParticipacionId: currentUser.uid
      };

      // Actualizar metadatos para todos los participantes
      const chatRef = ref(database, `Chats/${chatId}/participantes`);
      onValue(chatRef, async (snapshot) => {
        const participantsData = snapshot.val();
        if (participantsData) {
          const participantIds = Object.keys(participantsData);
          for (const participantId of participantIds) {
            // Para el otro participante, mostrar nuestro nombre como último participante
            const otherUserName = participantId === currentUser.uid ? 
              await getOtherParticipantName(participantIds, currentUser.uid) : 
              currentUserName;
            
            await set(
              ref(database, `metaDatosChat/${participantId}/${chatId}`),
              {
                ...updateData,
                nombreUltimoParticipante: otherUserName
              }
            );
          }
        }
      }, { onlyOnce: true });

      setNewMessage('');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      console.error('Error sending message:', error);
    }
  };

  const getUserData = async (userId) => {
    try {
      const userRef = ref(database, `Usuarios/${userId}`);
      return new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  const getOtherParticipantName = async (participantIds, currentUserId) => {
    for (const participantId of participantIds) {
      if (participantId !== currentUserId) {
        const userData = await getUserData(participantId);
        return userData?.nombre || 'Usuario';
      }
    }
    return 'Usuario';
  };

  const renderMessage = ({ item }) => {
    const senderName = item.remitente === currentUser?.uid 
      ? 'Tú' 
      : participants[item.remitente] || 'Usuario';

    return (
      <MessageBubble
        message={{
          text: item.contenido,
          sender: senderName,
          timestamp: item.timestamp
        }}
        isCurrentUser={item.remitente === currentUser?.uid}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{chatName}</Text>
            <Text style={styles.headerSubtitle}>En línea</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Lista de mensajes */}
        <View style={styles.messagesArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {/* Input de mensaje - SE MUEVE CON EL TECLADO */}
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#00C851',
    marginTop: 2,
  },
  placeholder: {
    width: 38,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 10,
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Posición inicial en la parte inferior
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: '#333',
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;