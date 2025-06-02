import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [userData, setUserData] = useState({
        userId: '',
        idEndereco: '',
        tipo: '',
        email: ''
    });

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('@user_data');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setUserData({
                        userId: parsedData.id,
                        idEndereco: parsedData.id_Endereco,
                        tipo: parsedData.tipo,
                        email: parsedData.email
                    });
                } else if (params.userId && params.idEndereco) {
                    setUserData({
                        userId: params.userId as string,
                        idEndereco: params.idEndereco as string,
                        tipo: 'Motorista',
                        email: ''
                    });
                } else {
                    Alert.alert('Erro', 'Dados do usuário não encontrados');
                    router.push('/home');
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                Alert.alert('Erro', 'Falha ao carregar dados do usuário');
                router.push('/home');
            }
        };

        loadUserData();
    }, []);
    const handleLinkPressHelpDesk = () => {
        router.push(`/MotoristaFinalizadasScreen?IdMotorista=${userData.userId}`);
    };

    const handleLinkPressInfo = () => {
        router.push(`/Info_motorista?IdMotorista=${userData.userId}`);
    };

    const handleLinkReturn = () => {
        router.push('/home');
    };

    const handleLinkPressHelp = () => {
        router.push(`/pesquisa?IdMotorista=${userData.userId}`);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={['rgba(196, 238, 242, 1)', 'rgba(234, 229, 251, 1)', 'rgba(42, 109, 236, 1)']}
                    style={styles.container}
                >
                    <Image
                        source={require('@/assets/images/logo.png')} // Adapta com seu logo
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    {/* Linha 1 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleLinkPressHelp}>
                            <Icon name="search" size={50} color="#025159" />
                            <Text style={styles.boxText}>Localizar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={() => router.push('/document_motorista')}>
                            <Icon name="book" size={50} color="#025159" />
                            <Text style={styles.boxText}>Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleLinkPressHelpDesk}>
                            <Icon name="list-outline" size={50} color="#025159" />
                            <Text style={styles.boxText}>Historico</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={handleLinkPressInfo}>
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
}

// Estilização padronizada com base na sua página de login
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Adiciona padding para evitar que o conteúdo se sobreponha
    },
    logo: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 40,
        marginTop: -150,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
        flexWrap: 'wrap', // Permite que os itens se ajustem conforme a largura da tela
        justifyContent: 'center', // Centraliza as caixas
    },
    box: {
        backgroundColor: '#FCFBE0',
        padding: 20,
        margin: 10,
        borderRadius: 25,
        alignItems: 'center',
        width: '40%', // Ajusta o tamanho das caixas
    },
    boxText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgba(2, 81, 89, 1)',
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

export default MainScreen;
