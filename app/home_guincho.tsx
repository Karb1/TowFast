import React, { useState } from 'react';
import { useLocalSearchParams} from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Importação de ícones
import axios from 'axios'; // Ou use o método de API que você usa


const SupportScreen: React.FC = () => {
    const router = useRouter();
    const {userId} = useLocalSearchParams();
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    // Função para ativar o guincho e enviá-lo ao mapa
    const handleSetOnline = async () => {
        try {
            // Supondo que você tenha uma API para alterar o status do guincho
            const response = await axios.put('http://192.168.15.13:3000/updatestatus', {
                id_cliente: userId,
                status: 1,
                ultimoStatus: currentTime
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                alert('Você está agora online! Motoristas podem te ver no mapa.');
            } else {
                alert('Erro ao tentar ficar online.');
            }
        } catch (error) {
            console.error('Erro ao atualizar o status online:', error);
            alert('Erro ao tentar ficar online.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={['rgba(196, 238, 242, 1)', 'rgba(235, 216, 134, 1)', 'rgba(235, 201, 77, 1)']} // Cores do background
                    style={styles.container}
                >
                    <Image
                        source={require('@/assets/images/logo.png')} // Atualizar para o seu logo
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    {/* Linha 1 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleSetOnline}>
                            <Icon name="car" size={50} color="#FAF3F3" />
                            <Text style={styles.boxText}>{'Você está Online'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box}>
                            <Icon name="book" size={50} color="#FAF3F3" />
                            <Text style={styles.boxText}>Política e Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box}>
                            <Icon name="headset" size={50} color="#FAF3F3" />
                            <Text style={styles.boxText}>HelpDesk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box}>
                            <Icon name="information-circle" size={50} color="#FAF3F3" />
                            <Text style={styles.boxText}>Informações</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botão de Sair */}
                    <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Estilização padronizada
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 40,
        marginTop: -50, // Ajustar conforme o layout
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    box: {
        backgroundColor: '#F0F0F0',
        padding: 20,
        margin: 10,
        borderRadius: 25,
        alignItems: 'center',
        width: '40%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    boxText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    logoutButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        marginTop: 40,
        width: '80%',
        alignItems: 'center'
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    }
});

export default SupportScreen;
