import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message, isCurrentUser }) => {
  return (
    <View style={[
      styles.bubbleContainer,
      isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
    ]}>
      {!isCurrentUser && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUser : styles.otherUser
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 10,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  currentUser: {
    backgroundColor: '#007AFF',
  },
  otherUser: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: 'black',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    marginHorizontal: 10,
  },
});

export default MessageBubble;