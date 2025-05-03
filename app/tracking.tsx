import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import MapDisplay from '../components/MapDisplay';
import { API_BASE_URL } from '../constants/ApiConfig';

interface TrackingData {
    id_Solicitacao: string;
    latLongGuincho: string;
    latLongCliente: string;
    status: string;
}

const TrackingScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [guinchoLocation, setGuinchoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [clienteLocation, setClienteLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distancia, setDistancia] = useState<string>('');
    const [tempoEstimado, setTempoEstimado] = useState<string>('');
    const [statusMensagem, setStatusMensagem] = useState<string>('O guincho está a caminho');
    const router = useRouter();
    const { solicitacaoId } = useLocalSearchParams();

    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Raio da Terra em metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    useEffect(() => {
        const loadSolicitacaoData = async () => {
            try {
                const solicitacaoData = await AsyncStorage.getItem('@solicitacao_atual');
                if (solicitacaoData) {
                    const data: TrackingData = JSON.parse(solicitacaoData);
                    const [latGuincho, longGuincho] = data.latLongGuincho.split(',');
                    const [latCliente, longCliente] = data.latLongCliente.split(',');

                    setGuinchoLocation({
                        latitude: parseFloat(latGuincho),
                        longitude: parseFloat(longGuincho)
                    });

                    setClienteLocation({
                        latitude: parseFloat(latCliente),
                        longitude: parseFloat(longCliente)
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setLoading(false);
            }
        };

        loadSolicitacaoData();

        const updateGuinchoLocation = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/solicitacao`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_Solicitacao: solicitacaoId
                    })
                });

                if (!response.ok) {
                    throw new Error('Falha ao atualizar localização do guincho');
                }

                const data: TrackingData = await response.json();
                const [latGuincho, longGuincho] = data.latLongGuincho.split(',');

                setGuinchoLocation({
                    latitude: parseFloat(latGuincho),
                    longitude: parseFloat(longGuincho)
                });

                if (clienteLocation) {
                    const distanciaMetros = calcularDistancia(
                        parseFloat(latGuincho),
                        parseFloat(longGuincho),
                        clienteLocation.latitude,
                        clienteLocation.longitude
                    );
                    const distanciaKm = (distanciaMetros / 1000).toFixed(1);
                    setDistancia(`${distanciaKm} km`);

                    const tempoMinutos = Math.round((distanciaMetros / 1000) / 40 * 60);
                    setTempoEstimado(`${tempoMinutos} min`);

                    if (distanciaMetros <= 500) {
                        setStatusMensagem('O guincho está muito próximo!');
                    } else if (distanciaMetros <= 2000) {
                        setStatusMensagem('O guincho está se aproximando');
                    }
                }
            } catch (error) {
                console.error('Erro ao atualizar localização:', error);
            }
        };

        const intervalId = setInterval(updateGuinchoLocation, 5000);
        return () => clearInterval(intervalId);
    }, [solicitacaoId]);

    return (
        <LinearGradient
            colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']}
            style={styles.container}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#025159" />
                            <Text style={styles.loadingText}>Carregando...</Text>
                        </View>
                    ) : (
                        <MapDisplay
                            guinchoLocation={guinchoLocation}
                            clienteLocation={clienteLocation}
                            distancia={distancia}
                            tempoEstimado={tempoEstimado}
                            statusMensagem={statusMensagem}
                        />
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#025159',
        marginTop: 10,
    },
});

export default TrackingScreen;

