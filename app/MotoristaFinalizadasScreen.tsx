import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

interface Corrida {
  id_Solicitacao: number;
  distancia: number | string; // aceita number ou string (para segurança)
  preco: string | number;
  nome: string;
  dta_Solicitacao: string;
  destino: string;
}

export default function MotoristaFinalizadasScreen() {
  const router = useRouter();
  const { IdMotorista } = useLocalSearchParams();
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(true);

  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2F5bmFucmIiLCJhIjoiY204ZjQ2a3poMDhrMDJscHd5dW92NnNveSJ9.a4c2yNLkywGd-CqL8Yh14Q';

  // Função para formatar número seguro
  const formatNumber = (num: number | string | undefined, decimals = 2) => {
    if (num === undefined || num === null) return '0.00';
    const n = typeof num === 'number' ? num : parseFloat(num);
    return isNaN(n) ? '0.00' : n.toFixed(decimals);
  };

  useEffect(() => {
    if (!IdMotorista) return;

    const fetchCorridas = async () => {
      try {
        const response = await axios.post('http://192.168.15.13:3003/corridasfinalizadas', {
          idMotorista: IdMotorista,
        });

        const corridasComEndereco = await Promise.all(
          response.data.map(async (corrida: Corrida) => {
            let enderecoConvertido = corrida.destino;

            if (corrida.destino.includes(',')) {
              const [lat, lng] = corrida.destino.split(',').map(parseFloat);

              try {
                const geoRes = await fetch(
                  `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${MAPBOX_ACCESS_TOKEN}`
                );

                const data = await geoRes.json();

                if (data.features?.length > 0) {
                  enderecoConvertido =
                    data.features[0].properties?.full_address ||
                    data.features[0].place_name ||
                    'Endereço não disponível';
                }
              } catch (geoErr) {
                console.warn('Erro ao converter lat/long com Mapbox:', geoErr);
              }
            }

            // Converter preco para number se for string
            let precoConvertido = corrida.preco;
            if (typeof corrida.preco === 'string') {
              precoConvertido = parseFloat(corrida.preco.replace(/[^\d.-]+/g, ''));
            }

            // Converter distancia para number se for string
            let distanciaConvertida = corrida.distancia;
            if (typeof corrida.distancia === 'string') {
              distanciaConvertida = parseFloat(corrida.distancia);
            }

            return {
              ...corrida,
              preco: precoConvertido,
              distancia: distanciaConvertida,
              destino: enderecoConvertido,
            };
          })
        );

        setCorridas(corridasComEndereco);
      } catch (error) {
        console.error('Erro ao buscar corridas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCorridas();
  }, [IdMotorista]);

  const handleBackPress = () => {
    router.back();
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
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.content}>
              <Text style={styles.title}>Corridas Finalizadas</Text>

              {loading ? (
                <View style={{ alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#025159" />
                  <Text style={styles.message}>Carregando...</Text>
                </View>
              ) : corridas.length === 0 ? (
                <Text style={styles.message}>Nenhuma corrida finalizada encontrada.</Text>
              ) : (
                corridas.map((item) => (
                  <View key={item.id_Solicitacao} style={styles.card}>
                    <Text style={styles.label}>Destino:</Text>
                    <Text style={styles.value}>{item.destino}</Text>

                    <Text style={styles.label}>Preço:</Text>
                    <Text style={styles.value}>R$ {formatNumber(item.preco)}</Text>

                    <Text style={styles.label}>Distância:</Text>
                    <Text style={styles.value}>{formatNumber(item.distancia)} km</Text>

                    <Text style={styles.label}>Data:</Text>
                    <Text style={styles.value}>
                      {new Date(item.dta_Solicitacao).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                ))
              )}
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
    paddingTop: 120,
    paddingBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
    color: '#025159',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
  },
  value: {
    marginBottom: 8,
    fontSize: 15,
    color: '#444',
  },
  message: {
    textAlign: 'center',
    color: '#444',
    fontSize: 16,
  },
});
