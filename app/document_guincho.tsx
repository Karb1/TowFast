import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function GuinchoTutorialScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={['rgba(196, 238, 242, 1)', 'rgba(235, 216, 134, 1)', 'rgba(235, 201, 77, 1)']}
          style={styles.container}
        >
          {/* Botão de voltar */}
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Conteúdo do tutorial */}
          <View style={styles.content}>
            <Text style={styles.title}>Tutorial para Motoristas - Como Atender Solicitações</Text>
            <Text style={styles.step}>
              1. Na tela inicial do app, localize o botão <Text style={styles.bold}>“Ficar Online”</Text> e clique nele para ativar seu status de disponibilidade.
            </Text>
            <Text style={styles.step}>
              2. Ao ficar online, você estará disponível para receber solicitações de guincho de clientes próximos.
            </Text>
            <Text style={styles.step}>
              3. Aguarde na tela principal até que uma solicitação apareça automaticamente.
            </Text>
            <Text style={styles.step}>
              4. Quando receber uma solicitação, ela será exibida na tela com detalhes do cliente e do local.
            </Text>
            <Text style={styles.step}>
              5. Você terá a opção de <Text style={styles.bold}>Aceitar</Text> a solicitação.
            </Text>
            <Text style={styles.step}>
              6. Ao aceitar, o app abrirá o mapa mostrando a localização do cliente que está aguardando o atendimento.
            </Text>
            <Text style={styles.step}>
              7. Siga as instruções do mapa para chegar até o cliente e realizar o suporte.
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: '#000',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000',
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
