import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
    const router = useRouter();

    // Função para retornar à tela anterior
    const handleBackPress = () => {
        router.back(); // Retorna para a tela anterior
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
                    {/* Botão de voltar */}
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    {/* Logo da aplicação */}
                    <Image
                        source={require('@/assets/images/logo.png')} // Adapta com seu logo
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Título e Conteúdo */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Como Solicitar um Suporte:</Text>
                        <Text style={styles.instructions}>
                            Vá até a aba localizar em sua home e clique para começar a buscar um suporte, assim que achar um Guincho disponível
                            irá aparecer as informações do veículo de atendimento, preço e etc. Caso esteja de acordo clique em aceitar ou
                            pule para procurar outro guincho.
                        </Text>
                    </View>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Estilos da página de suporte
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
        zIndex: 1
    },
    backButtonText: {
        fontSize: 18,
        color: '#000'
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#000'
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
});

