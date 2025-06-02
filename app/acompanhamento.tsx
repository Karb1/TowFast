import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/ApiConfig';

interface SolicitacaoResponse {
    id_Solicitacao: string;
    status: string;
    latLongGuincho: string;
    latLongCliente: string;
    destino: string;
}

const AcompanhamentoScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [solicitacaoStatus, setSolicitacaoStatus] = useState<string>('');
    const pulseAnim = useState(new Animated.Value(1))[0];
    const router = useRouter();
    const { id_solicitacao } = useLocalSearchParams();

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const checkSolicitacaoStatus = async () => {
            if (!id_solicitacao) {
                console.error('ID da solicitação não encontrado');
                Alert.alert(
                    'Erro',
                    'Não foi possível identificar a solicitação.',
                    [{ text: 'OK', onPress: () => router.push('/solicitacao') }]
                );
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/solicitacao`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_Solicitacao: id_solicitacao
                    })
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar status da solicitação');
                }

                const data: SolicitacaoResponse = await response.json();
                
                if (!isMounted) return;
                
                setSolicitacaoStatus(data.status);

                // Redireciona baseado no status
                if (data.status === 'Aceite') {
                    // Limpa o intervalo antes de navegar
                    clearInterval(intervalId);
                    // Salva os dados da solicitação no AsyncStorage
                    await AsyncStorage.setItem('@solicitacao_atual', JSON.stringify(data));
                    router.push(`/tracking?id_solicitacao=${id_solicitacao}`);
                } else if (data.status === 'Recusado') {
                    // Limpa o intervalo antes de navegar
                    clearInterval(intervalId);
                    Alert.alert('Solicitação Recusada', 'O guincho recusou sua solicitação.');
                    await AsyncStorage.removeItem('@solicitacao_atual');
                    router.push('/solicitacao');
                }

                if (isMounted) {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Verifica o status inicialmente
        checkSolicitacaoStatus();

        // Configura o intervalo para verificar o status
        const intervalId = setInterval(checkSolicitacaoStatus, 5000); // Verifica a cada 5 segundos

        // Limpa o intervalo e marca o componente como desmontado
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [id_solicitacao]);

    return (
        <LinearGradient
            colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']}
            style={styles.container}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>
                            Aguardando resposta do guincho...
                        </Text>
                        <Text style={styles.subText}>
                            Por favor, aguarde enquanto processamos sua solicitação
                        </Text>
                        <Animated.View style={[styles.animationContainer, { opacity: pulseAnim }]}>
                            <ActivityIndicator size="large" color="#025159" />
                        </Animated.View>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#025159',
        marginBottom: 10,
        textAlign: 'center',
    },
    subText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    animationContainer: {
        width: width * 0.8,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default AcompanhamentoScreen;