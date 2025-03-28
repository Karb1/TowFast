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
    SafeAreaView,
    Platform,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const GuinchosScreen: React.FC = () => {
    const [guinchos, setGuinchos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [distanceData, setDistanceData] = useState<{ [key: string]: any }>({});
    const [selectedGuincho, setSelectedGuincho] = useState<any | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const { IdMotorista, LatPre, LongPre, enderecoatual } = useLocalSearchParams();
    const router = useRouter();

    const voltarHome = () => {
        router.push(`/home_motorista`);
    };

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

    const fetchDistanceData = async (guincho: any) => {
        if (!location) {
            console.error('Localização não definida');
            return;
        }

        try {
            const response = await axios.get('https://api.distancematrix.ai/maps/api/distancematrix/json', {
                params: {
                    origins: guincho.lat_long,
                    destinations: `${location.latitude},${location.longitude}|${LatPre},${LongPre}`,
                    key: 'FXUKUSVIBO2kQDwmQiMGZrO4RDsimxj2dax53JHLpPQdJBEvOjyqW77kltQdMJT9',
                },
            });

            const rows = response.data.rows || [];
            let totalDistance = 0;
            let totalDuration = 0;

            rows.forEach((row: any) => {
                row.elements.forEach((element: any) => {
                    if (element.status === 'OK' && element.distance && element.duration) {
                        totalDistance += element.distance.value;
                        totalDuration += element.duration.value;
                    }
                });
            });

            const totalDistanceKm = (totalDistance / 1000).toFixed(2);
            const totalDurationMin = Math.round(totalDuration / 60);

            setDistanceData((prevData) => ({
                ...prevData,
                [guincho.id]: {
                    totalDistance: `${totalDistanceKm} km`,
                    totalDuration: `${totalDurationMin} mins`,
                    originAddress: response.data.origin_addresses?.[0] || 'Origem desconhecida',
                    destinationAddresses: response.data.destination_addresses || ['Destino desconhecido'],
                },
            }));
        } catch (error) {
            console.error('Erro ao buscar dados de distância:', error);
        }
    };

    useEffect(() => {
        fetchGuinchos();
        getLocation();
    }, []);

    useEffect(() => {
        if (location && guinchos.length > 0) {
            guinchos.forEach((guincho) => {
                fetchDistanceData(guincho);
            });
        }
    }, [location, guinchos]);

    const requestGuincho = async (...params: any[]) => {
        const [idGuincho, distanceValue, origem, destino] = params;

        const precoCalculado = 150 + (distanceValue ? parseFloat(distanceValue) * 10 : 0);

        const bodyData = {
            id_Motorista: IdMotorista,
            id_Guincho: idGuincho,
            distancia: distanceValue,
            preco: `R$ ${precoCalculado.toFixed(2)}`,
            latLongCliente: origem,
            latLongGuincho: destino,
            status: 'Pendente'
        };

        try {
            const response = await fetch('http://192.168.15.13:3000/preSolicitacao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            if (response.ok) {
                Alert.alert('Solicitação bem-sucedida!');
            } else {
                console.error(JSON.stringify(bodyData));
            }
        } catch (error) {
            Alert.alert('Erro de rede', 'Não foi possível conectar ao servidor.');
        }
    };

    const renderCard = ({ item }: { item: any }) => {
        const data = distanceData[item.id];
        const distanceValue = distanceData[item.id]?.totalDistance?.split(' ')[0];
        const Tempo = distanceData[item.id]?.totalDuration;
        const precoCalculado = 150 + (distanceValue ? parseFloat(distanceValue) * 10 : 0);
    
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
    
                <View style={styles.cardRow}>
                    <View style={styles.cardItem}>
                        <Icon name="call" size={20} color="#007BFF" />
                        <Text style={styles.cardText}>{item.telefone}</Text>
                    </View>
                    <View style={styles.cardItem}>
                        <Icon name="car" size={20} color="#007BFF" />
                        <Text style={styles.cardText}>{item.modelo}</Text>
                    </View>
                </View>
    
                <View style={styles.cardRow}>
                    <View style={styles.cardItem}>
                        <Icon name="location-outline" size={20} color="#007BFF" />
                        <Text style={styles.cardText}>{distanceValue ? `${distanceValue} km` : 'Calculando...'}</Text>
                    </View>
                    <View style={styles.cardItem}>
                        <Icon name="time-outline" size={20} color="#007BFF" />
                        <Text style={styles.cardText}>{Tempo || 'Calculando...'}</Text>
                    </View>
                </View>
    
                <View style={styles.priceContainer}>
                    <Icon name="cash-outline" size={20} color="#007BFF" />
                    <Text style={styles.priceText}>{`R$ ${precoCalculado.toFixed(2)}`}</Text>
                </View>
    
                {!isRequesting && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => requestGuincho(item.id, distanceValue, data?.originAddress, data?.destinationAddress)}
                    >
                        <Text style={styles.buttonText}>Solicitar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']}
            style={styles.container}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={voltarHome} style={styles.backButton}>
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Guinchos Ativos</Text>
                </View>

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

                {location && (
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationText}>Sua localização: {enderecoatual}</Text>
                    </View>
                )}

                {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 0,  // Pode ajustar o valor aqui
        top: 0,   // Para garantir que o botão fique visível
        padding: 8,
        zIndex: 999,  // Garante que o botão fique por cima de outros elementos
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center', // Centralizando os itens dentro do card
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center', // Centralizando o nome
        marginBottom: 10,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        marginBottom: 10,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        marginLeft: 5,
        fontSize: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'center', // Centralizando o valor
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Centralizando o preço
        marginLeft: 5,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    locationContainer: {
        paddingTop: 16,
        paddingBottom: 32,
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        color: '#333',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
});

export default GuinchosScreen;
