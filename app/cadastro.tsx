import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from '@/InputField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/ApiConfig'; // Importando AxiosError

export default function Cadastro() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [doc, setDoc] = useState<string>('');
    const [placa, setPlaca] = useState<string>('');
    const [modelo, setModelo] = useState<string>('');
    const [Dtnasc, setDtnasc] = useState<string>('');
    const [cnh, setCnh] = useState<string>('');
    const [userType, setUserType] = useState<string>('');

    const handleCadastro = async () => {
        if (password !== password2) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        const bodyData = {
            username: username,
            password: password,
            email: email,
            phone: phone,
            CPF_CNPJ: doc,
            licensePlate: placa,
            modelo: modelo,
            birthDate: new Date(Dtnasc).toISOString().split("T")[0], // Convertendo a data para o formato correto
            cnh: userType === 'Motorista' ? '' : cnh, // CNH vazio se for Motorista
            tipo: userType
        };

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Cadastro bem-sucedido!', data.message || 'Você está cadastrado com sucesso.');
                // Limpa os campos após o cadastro
                setUsername('');
                setPassword('');
                setPassword2('');
                setEmail('');
                setPhone('');
                setDoc('');
                setPlaca('');
                setModelo('');
                setDtnasc('');
                setCnh('');
                setUserType('');
            } else {
                //Alert.alert('Erro ao cadastrar', data.message || 'Verifique os dados e tente novamente.');
                console.error(JSON.stringify(bodyData));
            }
        } catch (error) {
            Alert.alert('Erro de rede', 'Não foi possível conectar ao servidor.');
        }
    };
        
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.container}>
                        <LinearGradient
                            colors={['rgba(156, 198, 195, 1)', 'rgba(231, 205, 134, 1)', 'rgba(209, 164, 107, 1)']}
                            style={styles.background}
                        />
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                style={[styles.radioButton, userType === 'Motorista' && styles.selected,{ backgroundColor: userType === 'Motorista' ? 'rgba(2, 81, 89, 1)' : '#FFFDE3' }]}
                                onPress={() => setUserType('Motorista')}
                            >
                                <Text style={[styles.radioText,{ color: userType === 'Motorista' ? 'white' : 'rgba(2, 81, 89, 1)' }]}>Motorista</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.radioButton, userType === 'Guincho' && styles.selected,{ backgroundColor: userType === 'Guincho' ? 'rgba(2, 81, 89, 1)' : '#FFFDE3' }]}
                                onPress={() => setUserType('Guincho')}
                            >
                                <Text style={[styles.radioText,{ color: userType === 'Guincho' ? 'white' : 'rgba(2, 81, 89, 1)' }]}>Guincho</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <InputField
                                placeholder="Nome de usuário"
                                onChangeText={(text: string) => setUsername(text)}
                                value={username}
                            />
                            <InputField
                                placeholder="Senha"
                                secureTextEntry={true}
                                onChangeText={(text: string) => setPassword(text)}
                                value={password}
                            />
                            <InputField
                                placeholder="Confirmar Senha"
                                secureTextEntry={true}
                                onChangeText={(text: string) => setPassword2(text)}
                                value={password2}
                            />
                            <InputField
                                placeholder="Email"
                                onChangeText={(text: string) => setEmail(text)}
                                value={email}
                            />
                            <InputField
                                placeholder="Telefone"
                                onChangeText={(text: string) => setPhone(text)}
                                value={phone}
                            />
                            <InputField
                                placeholder="Documento"
                                onChangeText={(text: string) => setDoc(text)}
                                value={doc}
                            />
                            <InputField
                                placeholder="Placa"
                                onChangeText={(text: string) => setPlaca(text)}
                                value={placa}
                            />
                            <InputField
                                placeholder='Modelo Veiculo'
                                onChangeText={(text: string) => setModelo(text)}
                                value={modelo}
                            />
                            <InputField
                                placeholder="Data Nascimento"
                                onChangeText={(text: string) => setDtnasc(text)}
                                value={Dtnasc}
                            />
                            {userType === 'Guincho' && (
                                <InputField
                                    placeholder="CNH"
                                    onChangeText={(text: string) => setCnh(text)}
                                    value={cnh}
                                />
                            )}
                            <TouchableOpacity onPress={handleCadastro} style={styles.button}>
                                <Text style={[styles.linkText, styles.bold]}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>    
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: 'center',
        alignItems: 'center'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: -1,
    },
    logo: {
        position: 'static',
        width: '55%',
        height: undefined,
        aspectRatio: 1,
        bottom: 30
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        bottom: 50
    },
    radioContainer: {
        flexDirection: 'row',
        bottom: 40,
    },
    radioButton: {
        backgroundColor: '#FFFDE3',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
    },
    selected: {
        backgroundColor: '#EDAD8B',
    },
    radioText: {
        fontSize: 16,
        color: 'rgba(2, 81, 89, 1)'
    },
    inputContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 25        
    },
    linkText: {
        position: 'static',
        color: 'rgba(2, 81, 89, 1)',
        bottom: 60
    },
    bold: {
        fontWeight: 'bold',
        fontSize: 18
    },
    button: {
        bottom: -1,
    }
});
