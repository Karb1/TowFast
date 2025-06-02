import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router'; // useFocusEffect para resetar popupAberto
import Icon from 'react-native-vector-icons/Ionicons';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/ApiConfig';
import * as Location from 'expo-location';

const SupportScreen: React.FC = () => {
    const router = useRouter();
    const { userId: userIdParam } = useLocalSearchParams();

    const [userId, setUserId] = useState<string | null>(null);
    const [idEndereco, setIdEndereco] = useState<string | null>(null);

    const [popupAberto, setPopupAberto] = useState(false);

    // Pega userId e idEndereco do AsyncStorage no carregamento
    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (userIdParam) {
                    await AsyncStorage.setItem('@user_id', userIdParam.toString());
                    setUserId(userIdParam.toString());
                } else {
                    const storedUserId = await AsyncStorage.getItem('@user_id');
                    setUserId(storedUserId);
                }

                const storedEndereco = await AsyncStorage.getItem('@endereco_id');
                setIdEndereco(storedEndereco);
            } catch (error) {
                console.error('Erro ao carregar dados do AsyncStorage:', error);
            }
        };
        loadUserData();
    }, [userIdParam]);

    // Atualiza idEndereco do AsyncStorage sempre que ele muda (caso precise atualizar)
    useEffect(() => {
        const saveEndereco = async () => {
            if (idEndereco) {
                try {
                    await AsyncStorage.setItem('@endereco_id', idEndereco);
                } catch (error) {
                    console.error('Erro ao salvar idEndereco no AsyncStorage:', error);
                }
            }
        };
        saveEndereco();
    }, [idEndereco]);

    const currentTime = new Date().toISOString();

    // Função para verificar novas solicitações, bloqueia se popupAberto == true
    const checkNewRequests = async () => {
        if (popupAberto) {
            return; // Popup já está aberto, não abre outro
        }

        try {
            if (!userId) {
                console.error('Erro: ID do guincho não fornecido');
                return;
            }
            console.log('Verificando solicitações para o guincho ID:', userId);

            const response = await fetch(`${API_BASE_URL}/popupsolicitacao?id_guincho=${userId}`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta do servidor não está em formato JSON');
            }

            const data = await response.json();
            console.log('Resposta da API:', data);

            if (data && data.length > 0) {
                console.log('Solicitações encontradas, redirecionando para popup...');
                setPopupAberto(true);
                router.push(`/popup?userId=${userId}`);
            }
        } catch (error) {
            console.error('Erro ao verificar solicitações:', error);
            if (error instanceof Error) {
                console.error('Detalhes do erro:', error.message);
            }
        }
    };

    // Polling para verificar novas solicitações a cada 5 segundos
    useEffect(() => {
        const pollInterval = setInterval(checkNewRequests, 5000);
        return () => clearInterval(pollInterval);
    }, [userId, popupAberto]);

    // Resetar popupAberto quando a tela SupportScreen ganhar foco
    useFocusEffect(
        useCallback(() => {
            setPopupAberto(false);
        }, [])
    );

    // Estado para localização
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Função para atualizar localização no servidor
    const updateLocation = async (latitude: number, longitude: number) => {
        if (!idEndereco) {
            setStatusMessage('ID do endereço não disponível.');
            return;
        }

        console.log('Enviando localização para o servidor...');
        console.log('ID Endereço:', idEndereco);
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        const latLongString = `${latitude},${longitude}`;

        try {
            const response = await axios.put(`${API_BASE_URL}/updatelocal`, {
                id_Endereco: idEndereco,
                local_real_time: 'Atual',
                lat_long: latLongString,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                console.log('Localização atualizada com sucesso.');
                setStatusMessage('Localização atualizada com sucesso.');
            } else {
                console.error('Erro ao atualizar localização:', response.data);
                setStatusMessage('Erro ao atualizar localização.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Erro ao enviar localização:', error.response?.data);
                setStatusMessage(`Erro ao enviar localização: ${error.response?.data?.message || error.message}`);
            } else {
                console.error('Erro desconhecido:', error);
                setStatusMessage('Erro desconhecido ao enviar localização.');
            }
        }
    };

    // Pegar permissão e rastrear localização automaticamente
    useEffect(() => {
        let locationWatcher: Location.LocationSubscription | null = null;

        const getLocationPermissionAndTrack = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permissão para acessar a localização foi negada.');
                return;
            }

            locationWatcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (loc) => {
                    const { latitude, longitude } = loc.coords;
                    setLocation({ latitude, longitude });
                    updateLocation(latitude, longitude);
                }
            );
        };

        getLocationPermissionAndTrack();

        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
        };
    }, [idEndereco]); // Dependência para garantir idEndereco atualizado

    // Função para ativar guincho e ficar online
    const handleSetOnline = async () => {
        if (!userId) {
            alert('Usuário não identificado.');
            return;
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/updatestatus`, {
                id_cliente: userId,
                status: 1,
                ultimoStatus: currentTime,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 200) {
                alert('Você está agora online! Motoristas podem te ver no mapa.');
            } else {
                alert('Erro ao tentar ficar online.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Erro ao atualizar status online:', error.response?.data);
                alert('Erro ao tentar ficar online.');
            } else {
                console.error('Erro desconhecido:', error);
                alert('Erro desconhecido ao tentar ficar online.');
            }
        }
    };

    const handleLinkReturn = () => {
        router.push('/home');
    };

    const handleLinkFinalizadas = () => {
        router.push(`/GuinchoFinalizadasScreen?userId=${userId}`);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={['rgba(196, 238, 242, 1)', 'rgba(235, 216, 134, 1)', 'rgba(235, 201, 77, 1)']}
                    style={styles.container}
                >
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Linha 1 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleSetOnline}>
                            <Icon name="car" size={50} color="#025159" />
                            <Text style={styles.boxText}>Ficar Online</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={() => router.push(`/document_guincho`)}>
                            <Icon name="book" size={50} color="#025159" />
                            <Text style={styles.boxText}>Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleLinkFinalizadas}>
                            <Icon name="list-outline" size={50} color="#025159" />
                            <Text style={styles.boxText}>Historico</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={() => router.push(`/Info_Guincho?userId=${userId}`)}>
                            <Icon name="person-outline" size={50} color="#025159" />
                            <Text style={styles.boxText}>Informações</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botão de Sair */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLinkReturn}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 40,
        marginTop: -50,
    },
    statusContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        color: '#025159',
        fontWeight: 'bold',
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
        color: '#025159',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        marginTop: 40,
        width: '80%',
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default SupportScreen;
