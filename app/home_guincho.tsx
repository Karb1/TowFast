import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Importação de ícones

export default function SupportScreen() {
    const router = useRouter();

    const handleLinkPressHelpDesk = () => {
        router.push('/helpdesk');
    };

    const handleLinkPressInfo = () => {
        router.push('/document_guincho');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={['rgba(196, 238, 242, 1)', 'rgba(235, 216, 134, 1)', 'rgba(235, 201, 77, 1)']} // Cores do background
                    style={styles.container}
                >
                    <Image
                        source={require('@/assets/images/logo.png')} // Atualizar para o seu logo
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    {/* Linha 1 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box}>
                            <Icon name="car" size={50} color="#000" />
                            <Text style={styles.boxText}>Suporte</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box}>
                            <Icon name="book" size={50} color="#000" />
                            <Text style={styles.boxText}>Política e Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleLinkPressHelpDesk}>
                            <Icon name="headset" size={50} color="#000" />
                            <Text style={styles.boxText}>HelpDesk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={handleLinkPressInfo}>
                            <Icon name="information-circle" size={50} color="#000" />
                            <Text style={styles.boxText}>Informações</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botão de Sair */}
                    <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Estilização padronizada
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
        marginBottom: 40,
        marginTop: -50, // Ajustar conforme o layout
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    box: {
        backgroundColor: '#F0F0F0',
        padding: 20,
        margin: 10,
        borderRadius: 25,
        alignItems: 'center',
        width: '40%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    boxText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
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
