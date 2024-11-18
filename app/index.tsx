import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();
    const fadeAnim = new Animated.Value(1); // Começa com opacidade total

    useEffect(() => {
        // Define o timer para fade-out e navegação
        const timer = setTimeout(() => {
            // Animação de fade-out
            Animated.timing(fadeAnim, {
                toValue: 0, // Diminui a opacidade para 0
                duration: 500, // Tempo de fade-out
                useNativeDriver: true,
            }).start(() => {
                // Navega para a home após o fade-out
                router.replace('/home');
            });
        }, 4500); // Espera 4.5 segundos antes de iniciar o fade-out

        return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#7ab8bf', // Cor de fundo desejada
    },
    logo: {
        width: 200,
        height: 200,
    },
});
