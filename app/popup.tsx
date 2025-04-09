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
import { useRouter } from 'expo-router';

interface ApiData {
    id: string;
    title: string;
    message: string;
    // Adicione mais campos conforme necessário
}

export default function PopupScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState<ApiData | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchDataFromApi();
    }, []);

    const fetchDataFromApi = async () => {
        try {
            const response = await fetch('http://192.168.15.13:3000/api/data');
            const data = await response.json();
            setApiData(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados.');
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            const response = await fetch('http://192.168.15.13:3000/api/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: apiData?.id }),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Confirmação realizada com sucesso!');
                setIsVisible(false);
                router.back();
            } else {
                Alert.alert('Erro', 'Não foi possível confirmar.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao processar a confirmação.');
        }
    };

    const handleReject = async () => {
        try {
            const response = await fetch('http://192.168.15.13:3000/api/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: apiData?.id }),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Rejeição realizada com sucesso!');
                setIsVisible(false);
                router.back();
            } else {
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
            onRequestClose={() => {
                setIsVisible(false);
                router.back();
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#025159" />
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>{apiData?.title}</Text>
                            <Text style={styles.modalText}>{apiData?.message}</Text>
                            
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