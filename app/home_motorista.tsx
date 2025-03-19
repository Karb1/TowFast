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
import { useLocalSearchParams } from 'expo-router';

const MainScreen: React.FC = () => {
    const router = useRouter();
    const { userId, idEndereco } = useLocalSearchParams();
    const handleLinkPressHelpDesk = () => {
        router.push('/home_guincho');
    };

    const handleLinkPressInfo = () => {
        router.push('/document_motorista');
    };

    const handleLinkReturn = () => {
        router.push('/home');
    };

    const handleLinkPressHelp = () => {
        router.push(`/pesquisa?IdMotorista=${userId}`);
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

                        <TouchableOpacity style={styles.box}>
                            <Icon name="book" size={50} color="#025159" />
                            <Text style={styles.boxText}>Política e Tutorial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Linha 2 */}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.box} onPress={handleLinkPressHelpDesk}>
                            <Icon name="headset" size={50} color="#025159" />
                            <Text style={styles.boxText}>HelpDesk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.box} onPress={handleLinkPressInfo}>
                            <Icon name="information-circle" size={50} color="#025159" />
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
