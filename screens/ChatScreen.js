import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { database as db } from '../config/firebaseConfig';
import { ref, onValue, push, set, off } from 'firebase/database';

const ChatScreen = ({ route, navigation }) => {
  const { currentUser, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  if (!currentUser || !otherUser) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>
          Error: No se recibieron los datos del usuario
        </Text>
      </View>
    );
  }

  const chatId = [currentUser.id, otherUser.id].sort().join('_');

  useEffect(() => {
    navigation.setOptions({ title: `Chat con ${otherUser.nombre}` });
    const messagesRef = ref(db, `Chats/${chatId}/mensajes`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(messagesArray.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error('Error al cargar mensajes:', error);
      Alert.alert('Error', 'No se pudo cargar el chat.');
    });
    return () => off(messagesRef);
  }, [chatId, otherUser]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    try {
      const messagesRef = ref(db, `Chats/${chatId}/mensajes`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        texto: newMessage.trim(),
        remitente: currentUser.id,
        nombreRemitente: currentUser.nombre,
        timestamp: Date.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.remitente === currentUser.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.senderName}>{isMe ? 'Yo' : item.nombreRemitente}</Text>
        <Text style={styles.messageText}>{item.texto}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, newMessage.trim() === '' && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={newMessage.trim() === ''}
        >
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
