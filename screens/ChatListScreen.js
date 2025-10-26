import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const ChatListScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Chats</Text>
        </View>)
    ;

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ChatListScreen;  