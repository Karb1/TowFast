import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';

const GuinchosScreen: React.FC = () => {
    const [guinchos, setGuinchos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [distances, setDistances] = useState<{ [key: string]: { distance: string; price: string } }>({});
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

    // Função para calcular a distância entre a localização do dispositivo e o guincho
    const getDistance = async (lat1: number, lon1: number, lat2: number, lon2: number) => {
        try {
            const response = await axios.get('https://api.distancematrix.ai/maps/api/distancematrix/json', {
                params: {
                    origins: `${lat1},${lon1}`,
                    destinations: `${lat2},${lon2}`,
                    key: 'FXUKUSVIBO2kQDwmQiMGZrO4RDsimxj2dax53JHLpPQdJBEvOjyqW77kltQdMJT9',
                },
            });
            if (response.data.rows[0].elements[0].status === 'OK') {
                return response.data.rows[0].elements[0].distance.value / 1000; // Distância em quilômetros
            }
            return 0;
        } catch (error) {
            console.error('Erro ao calcular distância:', error);
            return 0;
        }
    };

    // Função para calcular o preço com base na distância
    const calculatePrice = (distance: number) => {
        const basePrice = 50; // Preço mínimo
        const pricePerKm = 100; // Preço adicional por km
        const totalPrice = basePrice + pricePerKm * distance;
        return totalPrice.toFixed(2); // Retorna o preço formatado com duas casas decimais
    };

    // Função para enviar a solicitação de guincho
    const requestGuincho = async () => {
        const { userId, idEndereco } = useLocalSearchParams();
        if (!selectedGuincho || !location) return;

        setIsRequesting(true); // Inicia a solicitação
        try {
            // Envia os dados para a API
            await axios.post('http://192.168.15.13:3000/preSolicitacao', {
                id_Motorista: userId, // Exemplo, o ID do cliente deve vir do estado ou do banco de dados
                id_Guincho: selectedGuincho.id,
                distancia: distances[selectedGuincho.id]?.distance,
                preco: distances[selectedGuincho.id]?.price,
                latLongCliente: `${location.latitude},${location.longitude}`,
                latLongGuincho: selectedGuincho.lat_long,
                status: 'Pendente',
            });

            // Alterar o estado após envio
            setIsRequesting(false);
            setSelectedGuincho(null);
            alert('Solicitação enviada! Aguardando aceitação do guincho.');
        } catch (error) {
            console.error('Erro ao solicitar guincho:', error);
            setIsRequesting(false);
        }
    };

    // Efeito para buscar guinchos e localização na inicialização
    useEffect(() => {
        fetchGuinchos();
        getLocation();
    }, []);

    // Efeito para calcular a distância e o preço entre cada guincho e a localização do dispositivo
    useEffect(() => {
        if (location && guinchos.length > 0) {
            guinchos.forEach(async (guincho) => {
                const distanceInKm = await getDistance(
                    location.latitude,
                    location.longitude,
                    parseFloat(guincho.lat_long.split(',')[0]),
                    parseFloat(guincho.lat_long.split(',')[1])
                );
                const price = calculatePrice(distanceInKm);
                setDistances((prevDistances) => ({
                    ...prevDistances,
                    [guincho.id]: {
                        distance: `${distanceInKm.toFixed(2)} km`,
                        price: `R$ ${price}`,
                    },
                }));
            });
        }
    }, [location, guinchos]);

    const renderCard = ({ item }: { item: any }) => (
      <View style={styles.card}>
          <Text style={styles.cardText}>Nome: {item.nome}</Text>
          <Text style={styles.cardText}>Telefone: {item.telefone}</Text>
          <Text style={styles.cardText}>Modelo: {item.modelo}</Text>
          <Text style={styles.cardText}>Distância: {distances[item.id]?.distance || 'Calculando...'}</Text>
          <Text style={styles.cardText}>Preço: {distances[item.id]?.price || 'Calculando...'}</Text>
          {!isRequesting && (
              <TouchableOpacity
                  style={styles.button}
                  onPress={() => setSelectedGuincho(item)}
              >
                  <Text style={styles.buttonText}>Solicitar</Text>
              </TouchableOpacity>
          )}
      </View>
  );
  

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Guinchos Ativos</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={guinchos}
                    renderItem={renderCard}
                    keyExtractor={(item, index) => index.toString()}
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
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default GuinchosScreen;
