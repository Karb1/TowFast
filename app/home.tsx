import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/ApiConfig'; // Importando AxiosError

export default function LoginSteps() {
    const [step, setStep] = useState(1);
    const [email, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleNext = async () => {
        if (step === 1) {
            if (email) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/user`, {
                        username: email
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        setStep(2); // Passa para o próximo passo (senha)
                    } else {
                        Alert.alert('Usuário não encontrado. Por favor, clique em "Cadastrar" para criar uma conta.');
                    }
                } catch (error) {
                    Alert.alert('Usuário não encontrado. Por favor, clique em "Cadastrar" para criar uma conta.');
                }
            } else {
                Alert.alert('Por favor, preencha o campo de login.');
            }
        } else if (step === 2) {
            if (password) {
                handleLogin(); // Executa o login com senha
            } else {
                Alert.alert('Por favor, preencha o campo de senha.');
            }
        }
    };            

    const handleLogin = async () => {
        try {
            console.log('Tentando fazer login com:', { email, password });

            const response = await axios.post(`${API_BASE_URL}/login`, {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 300;
                }
            });

            // Verificar o tipo de conteúdo da resposta
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Erro: Resposta não é do tipo JSON:', contentType);
                Alert.alert('Erro', 'Formato de resposta inválido do servidor');
                return;
            }

            // Validar se response.data existe e é um objeto
            if (!response.data || typeof response.data !== 'object') {
                console.error('Erro: Dados da resposta inválidos:', response.data);
                Alert.alert('Erro', 'Dados de resposta inválidos do servidor');
                return;
            }

            if (response.status === 200 && response.data) {
                try {
                    const { id, tipo, id_Endereco } = response.data;
                    
                    if (!id || !tipo || !id_Endereco) {
                        throw new Error('Dados de resposta incompletos');
                    }

                    // Salvar dados do usuário no AsyncStorage
                    await AsyncStorage.setItem('@user_data', JSON.stringify({
                        id,
                        tipo,
                        id_Endereco,
                        email
                    }));

                    if (tipo === 'Motorista') {
                        router.push(`/home_motorista?userId=${id}&idEndereco=${id_Endereco}`);
                    } else if (tipo === 'Guincho') {
                        router.push(`/home_guincho?userId=${id}&idEndereco=${id_Endereco}`);
                    } else {
                        Alert.alert('Tipo de usuário desconhecido.');
                    }
                } catch (parseError) {
                    console.error('Erro ao processar dados da resposta:', parseError);
                    Alert.alert('Erro ao processar dados do usuário. Tente novamente.');
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Erro ao tentar fazer login:', error.response.data);
                    Alert.alert('Erro ao tentar fazer login: ' + (error.response.data.message || 'Erro desconhecido'));
                } else {
                    console.error('Erro ao conectar com o servidor:', error);
                    Alert.alert('Erro ao conectar com o servidor. Verifique se a API está em execução.');
                }
            } else {
                console.error('Erro desconhecido:', error);
                Alert.alert('Erro desconhecido. Tente novamente.');
            }
        }
    };
    
    

    const handleLogout = () => {
        setUsername('');
        setPassword('');
        setStep(1);
        Alert.alert('Você saiu da tela de login.');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <LinearGradient
                        colors={['rgba(196, 238, 242, 1)', 'rgba(122, 184, 191, 1)', 'rgba(2, 81, 89, 1)']}
                        style={styles.container}
                    >
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        
                        {step === 1 && (
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu login"
                                placeholderTextColor='rgba(2, 81, 89, 1)'
                                onChangeText={text => setUsername(text)}
                                value={email}
                            />
                        )}

                        {step === 2 && (
                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha"
                                placeholderTextColor='rgba(2, 81, 89, 1)'
                                secureTextEntry={true}
                                onChangeText={text => setPassword(text)}
                                value={password}
                            />
                        )}

                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>{step === 1 ? 'Próximo' : 'Entrar'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/cadastro')}>
                            <Text style={styles.linkText}>Cadastrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>Sair</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 55,
        backgroundColor: '#FCFBE0',
        borderRadius: 25,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        height: 55,
        backgroundColor: '#2B7A78',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
    },
    logoutButton: {
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
