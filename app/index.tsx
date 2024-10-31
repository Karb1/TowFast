import React, { useState } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function Home() {
    const [username, setUsername] = useState<string>(''); // Definindo tipo string
    const [password, setPassword] = useState<string>(''); // Definindo tipo string
    const router = useRouter();

    const handleLogin = async () => {
        if (username && password) {
            try {
                // Requisição POST para o servidor Node.js
                const response = await axios.post('http://192.168.15.13:3000/login', {
                    username,
                    password
                });

                // Verifica se a resposta é 200 e contém dados em JSON
                if (response.status === 200) {
                    router.push('/home_guincho'); // Exibe os dados retornados
                    // Redireciona para outra página após login bem-sucedido
                    // router.push('/outraPagina'); // Descomente e altere para a página desejada
                }
            } catch (error: any) { // Tratamento de erro com tipo "any"
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        Alert.alert(`Erro ao tentar fazer login: ${error.response.status} - ${error.response.data.message}`);
                    } else {
                        Alert.alert('Erro ao conectar com o servidor. Verifique se a API está em execução.');
                    }
                } else {
                    Alert.alert('Erro desconhecido.');
                }
            }
        } else {
            Alert.alert('Por favor, preencha todos os campos.');
        }
    };

    const handleLinkPress = () => {
        router.push('/cadastro');
    };

    const handleLinkPressReset = () => {
        router.push('/reset');
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
                        <View style={styles.linkContainer}>
                            <TouchableOpacity onPress={handleLinkPressReset}>
                                <Text style={[styles.linkText, styles.bold]}>Esqueci a senha</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLinkPress}>
                                <Text style={[styles.linkText, styles.bold]}>Cadastrar</Text>
                            </TouchableOpacity>
                        </View>

                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        
                        <TextInput
                            style={styles.inputLoginNew}
                            placeholder="Digite seu login"
                            placeholderTextColor='rgba(2, 81, 89, 1)'
                            onChangeText={text => setUsername(text)}
                            value={username}
                            onSubmitEditing={handleLogin}
                        />

                        <TextInput
                            style={styles.inputSenha}
                            placeholder="Digite sua senha"
                            placeholderTextColor='rgba(2, 81, 89, 1)'
                            secureTextEntry={true}
                            onChangeText={text => setPassword(text)}
                            value={password}
                            onSubmitEditing={handleLogin}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Entrar</Text>
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
        alignItems: 'center'
    },
    logo: {
        width: '60%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 20,
        marginTop: -350,
    },
    inputLogin: {
        position: 'absolute',
        bottom: 300,
        width: '80%',
        height: 55,
        backgroundColor: '#FCFBE0',
        borderRadius: 25,
        //paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center'
    },
    inputLoginNew: {
        position: 'absolute',
        bottom: 250,
        width: '80%',
        height: 55,
        backgroundColor: '#FCFBE0',
        borderRadius: 25,
        //paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center'
    },
    inputSenha: {
        position: 'absolute',
        bottom: 170,
        width: '80%',
        height: 55,
        backgroundColor: '#FCFBE0',
        borderRadius: 25,
        //paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center'
    },
    button: {
        position: 'absolute',
        bottom: 100,
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
    linkContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    linkText: {
        color: '#FFFFFF',
    },
    bold: {
        fontWeight: 'bold',
        fontSize: 18
    }
});
