import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../config/firebaseConfigEjemplo';
import { ref, onValue } from 'firebase/database';

const UsersListScreen = ({ navigation, route }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const currentUser = route.params?.currentUser;

    useEffect(() => {
        const usersRef = ref(db, 'Usuarios');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                const otherUsers = usersArray.filter(user => user.id !== currentUser?.id);
                setUsers(otherUsers);
            }
        });
    }, [currentUser]);

    const filteredUsers = users.filter(user =>
        user.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        user.correo?.toLowerCase().includes(search.toLowerCase())
    );

    const startChat = (user) => {
        navigation.navigate('ChatScreen', { 
            otherUser: user,
            currentUser: currentUser
        });
    };

    const renderUser = ({ item }) => (
        <TouchableOpacity style={styles.userCard} onPress={() => startChat(item)}>
            <Text style={styles.userName}>{item.nombre}</Text>
            <Text style={styles.userEmail}>{item.correo}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Usuarios</Text>
            <TextInput
                style={styles.search}
                placeholder="Buscar usuario..."
                value={search}
                onChangeText={setSearch}
            />
            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    search: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    userCard: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
});

export default UsersListScreen;