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
import { useRouter } from 'expo-router';

export default function Home() {
    const [doc, setDoc] = useState('');
    const [resetMethod, setResetMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const router = useRouter();

    const handleResetEmail = () => {
        if (doc && email) {
            Alert.alert('Email enviado!');
        } else {
            Alert.alert('Por favor, preencha o email.');
        }
    };

    const handleResetSms = () => {
        if (doc && phone) {
            Alert.alert('SMS enviado!');
        } else {
            Alert.alert('Por favor, preencha o telefone.');
        }
    };

    const handleLinkPress = () => {
        if (resetMethod === 'email' && doc && email) {
            Alert.alert('Reset de senha enviado!');
        } else if (resetMethod === 'sms' && doc && phone) {
            Alert.alert('Reset de senha enviado!');
        } else {
            Alert.alert('Por favor, preencha todos os campos.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <LinearGradient
                        colors={['rgba(2, 81, 89, 1)', 'rgba(122, 184, 191, 1)', 'rgba(196, 238, 242, 1)']}
                        style={styles.container}
                    >
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.formContainer}>
                            <View style={styles.radioContainer}>
                                <TouchableOpacity
                                    style={[styles.radioButton, resetMethod === 'email' && styles.selected, { backgroundColor: resetMethod === 'email' ? 'rgba(2, 81, 89, 1)' : '#FFFDE3' }]}
                                    onPress={() => setResetMethod('email')}
                                >
                                    <Text style={[
                                        styles.radioText,
                                        { color: resetMethod === 'email' ? 'white' : 'rgba(2, 81, 89, 1)' },
                                    ]}>
                                        E-mail
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioButton, resetMethod === 'sms' && styles.selected, { backgroundColor: resetMethod === 'sms' ? 'rgba(2, 81, 89, 1)' : '#FFFDE3' }]}
                                    onPress={() => setResetMethod('sms')}
                                >
                                    <Text style={[
                                        styles.radioText,
                                        { color: resetMethod === 'sms' ? 'white' : 'rgba(2, 81, 89, 1)' },
                                    ]}>
                                        SMS
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.inputDocumento}
                                placeholder="Digite seu documento"
                                placeholderTextColor="black"
                                onChangeText={text => setDoc(text)}
                                value={doc}
                            />
                            {resetMethod === 'email' && (
                                <TextInput
                                    style={styles.inputEmail}
                                    placeholder="Digite seu email"
                                    placeholderTextColor="black"
                                    onChangeText={text => setEmail(text)}
                                    value={email}
                                    onSubmitEditing={handleResetEmail}
                                />
                            )}
                            {resetMethod === 'sms' && (
                                <TextInput
                                    style={styles.inputTelefone}
                                    placeholder="Digite seu telefone"
                                    placeholderTextColor="black"
                                    onChangeText={text => setPhone(text)}
                                    value={phone}
                                    onSubmitEditing={handleResetSms}
                                />
                            )}
                            <View style={styles.linkContainer}>
                                <TouchableOpacity onPress={handleLinkPress}>
                                    <Text style={[styles.linkText, styles.bold]}>Solicitar nova senha</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        marginBottom: 90,
    },
    formContainer: {
        width: '80%',
        alignItems: 'center',
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    radioButton: {
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 10,
    },
    selected: {
        backgroundColor: 'white',
    },
    radioText: {
        fontSize: 16,
    },
    inputDocumento: {
        width: '100%',
        height: 55,
        backgroundColor: '#FFFDE3',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputEmail: {
        width: '100%',
        height: 55,
        backgroundColor: '#FFFDE3',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputTelefone: {
        width: '100%',
        height: 55,
        backgroundColor: '#FFFDE3',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    linkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: 'rgba(2, 81, 89, 1)',
    },
    bold: {
        fontWeight: 'bold',
        fontSize: 18,
    },
});
