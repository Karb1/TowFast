import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiData {
    id_Solicitacao: string;
    nome_Motorista: string;
    distancia: string;
    preco: number;
    destino: string;
    idEndereco: string;
    latLongCliente: string;
}

export default function PopupScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState<ApiData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const { userId } = useLocalSearchParams();

    useEffect(() => {
        // Log do userId para validação
        console.log('userId recebido:', userId);
        
        // Validação do userId
        if (!userId) {
            Alert.alert('Erro', 'ID do guincho não fornecido');
            setIsVisible(false);
            router.back();
            return;
        }

        fetchDataFromApi();
    }, []);

    const fetchDataFromApi = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/popupsolicitacao?id_guincho=${userId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta do servidor não está em formato JSON');
            }

            const data = await response.json();
            if (!data || data.length === 0) {
                Alert.alert('Aviso', 'Não há solicitações disponíveis no momento.');
                setIsVisible(false);
                router.back();
                return;
            }
            setApiData(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            let errorMessage = 'Não foi possível carregar os dados. ';
            if (error instanceof Error) {
                errorMessage += error.message;
            }
            Alert.alert('Erro', errorMessage);
            setLoading(false);
            setIsVisible(false);
            router.back();
        }
    };

    const handleConfirm = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/updatePreSolicitacao`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_Solicitacao: apiData[currentIndex]?.id_Solicitacao,
                    status: 'Aceite'
                }),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Confirmação realizada com sucesso!');
                router.push(`/route?solicitacaoId=${apiData[currentIndex]?.id_Solicitacao}&userId=${userId}&idEndereco=${apiData[currentIndex]?.idEndereco}&nomeMotorista=${encodeURIComponent(apiData[currentIndex]?.nome_Motorista)}&destino=${encodeURIComponent(apiData[currentIndex]?.destino)}&distancia=${encodeURIComponent(apiData[currentIndex]?.distancia)}&preco=${apiData[currentIndex]?.preco}&latLongCliente=${encodeURIComponent(apiData[currentIndex]?.latLongCliente)}`);
                setIsVisible(false);
            } else {
                Alert.alert('Erro', 'Não foi possível confirmar.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao processar a confirmação.');
        }
    };

    const handleReject = async () => {
        try {
            console.log('ID sendo enviado:', apiData[currentIndex]?.id_Solicitacao);
            const response = await fetch(`${API_BASE_URL}/updatePreSolicitacao`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_Solicitacao: apiData[currentIndex]?.id_Solicitacao,
                    status: 'Recusado'
                }),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Rejeição realizada com sucesso!');
                if (currentIndex < apiData.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    setIsVisible(false);
                    router.back();
                }
            } else {
                console.log(response)
                Alert.alert('Erro', 'Não foi possível rejeitar.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao processar a rejeição.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#025159" />
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>Nova Solicitação de Guincho</Text>
                            <Text style={styles.modalText}>Motorista: {apiData[currentIndex]?.nome_Motorista}</Text>
                            <Text style={styles.modalText}>Distância: {apiData[currentIndex]?.distancia}</Text>
                            <Text style={styles.modalText}>Preço: R$ {apiData[currentIndex]?.preco}</Text>
                            <Text style={styles.modalText}>Destino: {apiData[currentIndex]?.destino}</Text>
                            
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={handleConfirm}
                                >
                                    <Text style={styles.buttonText}>Confirmar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.button, styles.rejectButton]}
                                    onPress={handleReject}
                                >
                                    <Text style={styles.buttonText}>Recusar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#025159'
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        color: '#333'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    button: {
        borderRadius: 10,
        padding: 10,
        width: '45%',
        elevation: 2
    },
    confirmButton: {
        backgroundColor: '#025159'
    },
    rejectButton: {
        backgroundColor: '#FF6B6B'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16
    }
});