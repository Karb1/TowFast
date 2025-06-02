import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back(); // Voltar para tela anterior
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['rgba(196, 238, 242, 1)', 'rgba(234, 229, 251, 1)', 'rgba(42, 109, 236, 1)']}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1, width: '100%' }}>
          {/* Botão voltar fixo no topo */}
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo da aplicação */}
            <Image
              source={require('@/assets/images/logo.png')} // ajuste o caminho conforme seu projeto
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Conteúdo do tutorial detalhado */}
            <View style={styles.content}>
              <Text style={styles.title}>Como Solicitar um Suporte:</Text>

              <Text style={styles.step}>
                1. Vá até a aba <Text style={styles.bold}>“Localizar”</Text> na sua home e clique para começar a buscar um suporte.
              </Text>
              <Text style={styles.step}>
                2. Assim que encontrar um <Text style={styles.bold}>Guincho disponível</Text>, aparecerão as informações do veículo de atendimento, preço e outros detalhes.
              </Text>
              <Text style={styles.step}>
                3. Caso esteja de acordo, clique em <Text style={styles.bold}>“Aceitar”</Text> para solicitar o serviço.
              </Text>
              <Text style={styles.step}>
                4. Se não quiser esse guincho, pule para procurar outro disponível.
              </Text>
              <Text style={styles.step}>
                5. Após aceitar, aguarde o guincho chegar para iniciar o atendimento.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  backButtonText: {
    fontSize: 16,
    color: '#025159',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 120, // espaço para o botão voltar
    paddingBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 40,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#025159',
    textAlign: 'center',
  },
  step: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
});
