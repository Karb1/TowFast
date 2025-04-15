import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/ApiConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UserData {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    tipo: string;
}

export default function InfoPage() {
    const router = useRouter();
    const { userType } = useLocalSearchParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<UserData>>({});

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('@user_data');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const response = await fetch(`${API_BASE_URL}/user/${parsedData.id}`);
                const userData = await response.json();
                setUserData(userData);
                setEditedData(userData);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
        }
    };

    const handleSave = async () => {
        try {
            if (!userData?.id) return;

            const response = await fetch(`${API_BASE_URL}/user/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: editedData.nome,
                    telefone: editedData.telefone,
                }),
            });

            if (response.ok) {
                setUserData({ ...userData, ...editedData });
                setIsEditing(false);
                Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
            } else {
                throw new Error('Falha ao atualizar dados');
            }
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            Alert.alert('Erro', 'Não foi possível atualizar os dados.');
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#025159" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Informações do {userType}</Text>
            </View>

            {userData && (
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nome:</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={editedData.nome}
                                onChangeText={(text) => setEditedData({ ...editedData, nome: text })}
                            />
                        ) : (
                            <Text style={styles.value}>{userData.nome}</Text>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{userData.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Telefone:</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={editedData.telefone}
                                onChangeText={(text) => setEditedData({ ...editedData, telefone: text })}
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.value}>{userData.telefone}</Text>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <TouchableOpacity style={styles.button} onPress={handleSave}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={() => setIsEditing(false)}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
        elevation: 2
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#025159',
        marginLeft: 16
    },
    infoContainer: {
        padding: 16,
        width: '100%'
    },
    infoRow: {
        marginBottom: 16
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#025159',
        marginBottom: 8
    },
    value: {
        fontSize: 16,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: '#333'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 16,
        gap: 16
    },
    button: {
        backgroundColor: '#025159',
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#FF6B6B'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});