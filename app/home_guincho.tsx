import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import axios, { AxiosError } from 'axios'; // Importando AxiosError
import * as Location from 'expo-location'; // Importando expo-location

const SupportScreen: React.FC = () => {
    const router = useRouter();
    const { userId, idEndereco } = useLocalSearchParams();
    const currentTime = new Date().toISOString();

    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<string>(''); // Para exibir mensagens de status

    // Função para ativar o guincho e enviá-lo ao mapa
    const handleSetOnline = async () => {
        try {
            const response = await axios.put('http://192.168.15.13:3000/updatestatus', {
                id_cliente: userId,
                status: 1,
                ultimoStatus: currentTime,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                alert('Você está agora online! Motoristas podem te ver no mapa.');
            } else {
                alert('Erro ao tentar ficar online.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Erro ao atualizar o status online:', error.response?.data);
                alert('Erro ao tentar ficar online.');
            } else {
                console.error('Erro desconhecido:', error);
                alert('Erro desconhecido ao tentar ficar online.');
            }
        }
    };

    // Função para atualizar localização em tempo real
    const updateLocation = async (latitude: number, longitude: number) => {
        console.log('Enviando localização para o servidor...');
        console.log('ID Endereço:', idEndereco);
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
    
        // Criando a string de lat_long
        const latLongString = `${latitude},${longitude}`;
    
        try {
            const response = await axios.put('http://192.168.15.13:3000/updatelocal', {
                id_Endereco: idEndereco,
                local_real_time: 'Atual', // Envia "Atual" como valor de local_real_time
                lat_long: latLongString, // Envia a localização como string
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

    // Função para obter permissão de localização e começar o rastreamento
    useEffect(() => {
        let locationWatcher: Location.LocationSubscription | null = null; // Declarando a variável no escopo

        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permissão para acessar a localização foi negada.');
                return;
            }

            locationWatcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,  // A cada 5 segundos
                    distanceInterval: 10, // A cada 10 metros
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setLocation({ latitude, longitude });

                    // Atualiza a localização no servidor
                    updateLocation(latitude, longitude);
                }
            );
        };

        getLocation();

        // Limpeza do rastreamento
        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
        };
    }, []);

    const handleLinkReturn = () => {
        router.push('/home');
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
                            <Text style={styles.boxText}>{'Ficar Online'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box}>
                            <Icon name="book" size={50} color="#025159" />
                            <Text style={styles.boxText}>Política e Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box}>
                            <Icon name="headset" size={50} color="#025159" />
                            <Text style={styles.boxText}>HelpDesk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box}>
                            <Icon name="information-circle" size={50} color="#025159" />
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

// Estilização
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
    bubble: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        marginBottom: 20,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    bubbleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#025159',
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