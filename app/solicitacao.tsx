import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';

const GuinchosScreen: React.FC = () => {
    const [guinchos, setGuinchos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [distanceData, setDistanceData] = useState<{ [key: string]: any }>({});
    const [selectedGuincho, setSelectedGuincho] = useState<any | null>(null);
    const [isRequesting, setIsRequesting] = useState(false); // Para controlar o estado da solicitação

    // Função para buscar guinchos da API
    const fetchGuinchos = async () => {
        try {
            const response = await axios.get('http://192.168.15.13:3000/guinchosativos');
            if (response.status === 200) {
                setGuinchos(response.data);
            } else {
                console.error('Erro ao buscar guinchos:', response.data);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Erro ao acessar API:', error.response?.data);
            } else {
                console.error('Erro desconhecido:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Função para obter a localização do dispositivo
    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permissão para acessar a localização foi negada.');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
    };

    // Função para buscar os dados de distância e tempo da API
    const fetchDistanceData = async (guincho: any) => {
        if (!location) return;
        try {
            const response = await axios.get('https://api.distancematrix.ai/maps/api/distancematrix/json', {
                params: {
                    origins: `${location.latitude},${location.longitude}`,
                    destinations: guincho.lat_long,
                    key: 'FXUKUSVIBO2kQDwmQiMGZrO4RDsimxj2dax53JHLpPQdJBEvOjyqW77kltQdMJT9',
                },
            });
            const result = response.data.rows[0].elements[0];
            if (result.status === 'OK') {
                setDistanceData((prevData) => ({
                    ...prevData,
                    [guincho.id]: {
                        distance: result.distance.text,
                        duration: result.duration.text,
                        originAddress: response.data.origin_addresses[0],
                        destinationAddress: response.data.destination_addresses[0],
                    },
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar dados de distância:', error);
        }
    };

    // Efeito para buscar guinchos e localização na inicialização
    useEffect(() => {
        fetchGuinchos();
        getLocation();
    }, []);

    // Efeito para buscar dados de distância para cada guincho
    useEffect(() => {
        if (location && guinchos.length > 0) {
            guinchos.forEach((guincho) => {
                fetchDistanceData(guincho);
            });
        }
    }, [location, guinchos]);

    const requestGuincho = async () => {
        const { userId } = useLocalSearchParams();

        const bodyData = {
            id_Motorista: userId,
            id_Guincho:'Pendente',  //item.id,
            distancia: 'Pendente', //distanceData[item.id]?.distance,
            preco: 'Pendente', //`R$ ${(50 + 100 * parseFloat(distanceData[item.id]?.distance.split(' ')[0])).toFixed(2)}`,
            latLongCliente: 'Teste',//`${location.latitude},${location.longitude}`,
            latLongGuincho: 'Pendente',//item.lat_long,
            status: 'Pendente'            
        }

        try {
            const response = await fetch('http://192.168.15.13:3000/preSolicitacao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('solicitacao bem-sucedido!');
            } else {
                //Alert.alert('Erro ao cadastrar', data.message || 'Verifique os dados e tente novamente.');
                console.error(JSON.stringify(bodyData));
            }
        } catch (error) {
            Alert.alert('Erro de rede', 'Não foi possível conectar ao servidor.');
        }
/*            
    // Função para enviar a solicitação de guincho
    const requestGuincho = async (item: any) => {
        console.log(item);
        const { userId, idEndereco } = useLocalSearchParams();
        if (!location) return;
        
        setIsRequesting(true); // Inicia a solicitação

        const bodyData = {
            id_Motorista: userId,
            id_Guincho: item.id,
            distancia: distanceData[item.id]?.distance,
            preco: `R$ ${(50 + 100 * parseFloat(distanceData[item.id]?.distance.split(' ')[0])).toFixed(2)}`,
            latLongCliente: `${location.latitude},${location.longitude}`,
            latLongGuincho: item.lat_long,
            status: 'Pendente'            
        }

        const response = await fetch('http://192.168.15.13:3000/preSolicitacao', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        })

        const data = await response.json();

        if(response.ok){
            Alert.alert('Pré-Solicitacao enviada',data.message);
        }
        else{
            console.error(JSON.stringify(bodyData));
        }
        /*
        try {
            // Envia os dados para a API
            await axios.post('http://172.22.111.25:3000/preSolicitacao', {
                id_Motorista: userId, // Exemplo, o ID do cliente deve vir do estado ou do banco de dados
                id_Guincho: item.id,
                distancia: distanceData[item.id]?.distance,
                preco: `R$ ${(50 + 100 * parseFloat(distanceData[item.id]?.distance.split(' ')[0])).toFixed(2)}`,
                latLongCliente: `${location.latitude},${location.longitude}`,
                latLongGuincho: item.lat_long,
                status: 'Pendente',
            });

            // Alterar o estado após envio
            setIsRequesting(false);
            alert('Solicitação enviada! Aguardando aceitação do guincho.');
        } catch (error) {
            console.error('Erro ao solicitar guincho:', error);
            setIsRequesting(false);
        }*/
    };

    const renderCard = ({ item }: { item: any }) => {
        const data = distanceData[item.id];
        return (
            <View style={styles.card}>
                <Text style={styles.cardText}>Nome: {item.nome}</Text>
                <Text style={styles.cardText}>Telefone: {item.telefone}</Text>
                <Text style={styles.cardText}>Modelo: {item.modelo}</Text>
                <Text style={styles.cardText}>Distância: {data?.distance || 'Calculando...'}</Text>
                <Text style={styles.cardText}>Tempo: {data?.duration || 'Calculando...'}</Text>
                <Text style={styles.cardText}>Origem: {data?.originAddress || 'Calculando...'}</Text>
                <Text style={styles.cardText}>Destino: {data?.destinationAddress || 'Calculando...'}</Text>
                {!isRequesting && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={requestGuincho}
                    >
                        <Text style={styles.buttonText}>Solicitar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Guinchos Ativos</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                  data={guinchos}
                    renderItem={renderCard}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : `guincho-${index}`)}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
            {isRequesting && selectedGuincho && (
                <Modal
                    transparent={true}
                    visible={isRequesting}
                    animationType="fade"
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Aguardando o guincho aceitar...
                        </Text>
                    </View>
                </Modal>
            )}
            {location && (
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>
                        Sua localização: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </Text>
                </View>
            )}
            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cardText: {
        fontSize: 16,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#007aff',
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    locationContainer: {
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    locationText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#007aff',
        padding: 15,
        borderRadius: 10,
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default GuinchosScreen;
