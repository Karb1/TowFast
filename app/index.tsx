import React, { useState } from 'react';
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
import { useRouter, Stack } from 'expo-router';

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        if (username && password) {
            Alert.alert('Login bem-sucedido!');
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
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <TextInput
                            style={styles.inputLogin}
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

                        <View style={styles.linkContainer}>
                            <TouchableOpacity onPress={handleLinkPressReset}>
                                <Text style={[styles.linkText, styles.bold]}>Esqueci a senha</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLinkPress}>
                                <Text style={[styles.linkText, styles.bold]}>Cadastrar</Text>
                            </TouchableOpacity>
                        </View>
                        <Stack>
                            <Stack.Screen name="cadastro" options={{ headerShown: false }} />
                        </Stack>
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
        width: '75%',
        height: undefined,
        aspectRatio: 1,
        marginBottom: 20,
        marginTop: -350,
    },
    inputLogin: {
        position: 'absolute',
        bottom: 240,
        width: '80%',
        height: 55,
        backgroundColor: '#FCFBE0',
        borderRadius: 25,
        paddingHorizontal: 20,
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
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center'
    },
    linkContainer: {
        position: 'absolute',
        bottom: 120,
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
