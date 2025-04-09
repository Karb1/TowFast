import React, { useState } from 'react';
import axios from 'axios';
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

export default function LoginSteps() {
    const [step, setStep] = useState(1);
    const [email, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleNext = async () => {
        if (step === 1) {
            if (email) {
                try {
                    const response = await axios.post('http://172.20.10.10:3000/user', {
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
    
            const response = await axios.post('http://172.20.10.10:3000/login', {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                const { id, tipo, id_Endereco } = response.data; // Extraindo o ID e tipo da resposta
    
                // Navega para a tela apropriada com base no tipo
                if (tipo === 'Motorista') {
                    router.push(`/home_motorista?userId=${id}&idEndereco=${id_Endereco}`); // Passa o ID e id_Endereco como parâmetros na URL
                } else if (tipo === 'Guincho') {
                    router.push(`/home_guincho?userId=${id}&idEndereco=${id_Endereco}`); // Passa o ID e id_Endereco como parâmetros na URL
                } else {
                    Alert.alert('Tipo de usuário desconhecido.');
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Erro ao tentar fazer login: Senha incorreta');
                    Alert.alert(`Erro ao tentar fazer login: ${error.response.data.message}`);
                } else {
                    console.error('Erro ao conectar com o servidor:');
                    Alert.alert('Erro ao conectar com o servidor. Verifique se a API está em execução.');
                }
            } else {
                Alert.alert('Erro desconhecido.');
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
