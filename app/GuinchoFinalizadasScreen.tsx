import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  distancia: number | string; // pode vir como string ou number
  preco: string | number;
  nome: string;
  dta_Solicitacao: string;
  destino: string;
}

export default function GuinchoFinalizadasScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(true);

  // Sua chave Mapbox
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2F5bmFucmIiLCJhIjoiY204ZjQ2a3poMDhrMDJscHd5dW92NnNveSJ9.a4c2yNLkywGd-CqL8Yh14Q';

  useEffect(() => {
    if (!userId) return;

    const fetchCorridas = async () => {
      try {
        const response = await axios.post('http://192.168.15.13:3003/corridasfinalizadas', {
          idGuincho: userId,
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

            let precoConvertido = corrida.preco;
            if (typeof corrida.preco === 'string') {
              precoConvertido = parseFloat(corrida.preco.replace(/[^\d.-]+/g, ''));
            }

            return {
              ...corrida,
              preco: precoConvertido,
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
  }, [userId]);

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
          <SafeAreaView style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.content}>
              <Text style={styles.title}>Corridas Finalizadas</Text>

              {loading ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <ActivityIndicator size="large" color="#000" />
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
                    <Text style={styles.value}>
                      R$ {(typeof item.preco === 'number' ? item.preco : parseFloat(item.preco)).toFixed(2)}
                    </Text>

                    <Text style={styles.label}>Distância:</Text>
                    <Text style={styles.value}>
                      {!isNaN(Number(item.distancia)) ? Number(item.distancia).toFixed(2) : 'N/A'} km
                    </Text>

                    <Text style={styles.label}>Data:</Text>
                    <Text style={styles.value}>
                      {new Date(item.dta_Solicitacao).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </SafeAreaView>
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
    paddingVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#000',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 80,
    width: '100%',
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
    textAlign: 'center',
    color: '#000',
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
