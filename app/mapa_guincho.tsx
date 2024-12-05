import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

type Guincho = {
  id: number;
  nome: string;
  modelo: string;
  telefone: string;
  latitude: number;
  longitude: number;
  distancia?: number;
  valor?: number;
};

const GuinchosDisponiveis = () => {
  const [guinchos, setGuinchos] = useState<Guincho[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteLocation, setClienteLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Solicitar permissões de localização
  const requestLocationPermission = async () => {
    const permissionGranted = await Geolocation.requestAuthorization('whenInUse');
    return permissionGranted === 'granted';
  };

  // Obter localização atual
  const getClienteLocation = async () => {
    const permissionGranted = await requestLocationPermission();
    if (permissionGranted) {
      Geolocation.getCurrentPosition(
        (position) => {
          setClienteLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setClienteLocation(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  };

  // Calcular a distância entre dois pontos geográficos (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const rad = Math.PI / 180;
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // em km
    return distance;
  };

  // Buscar guinchos ativos da API
  const fetchGuinchos = async () => {
    if (!clienteLocation) return;

    try {
      // 1. Buscar guinchos ativos da API
      const response = await axios.get('http://192.168.15.13:3000/guinchosativos'); // Altere para o seu endpoint real
      const guinchosData: Guincho[] = response.data;

      // 2. Calcular a distância e valor
      const guinchosComDistancia = guinchosData.map((guincho) => {
        const distancia = calculateDistance(
          clienteLocation.latitude,
          clienteLocation.longitude,
          guincho.latitude,
          guincho.longitude
        );

        // 3. Calcular o valor da corrida
        const valor = distancia * 100; // 100 reais por km

        return { ...guincho, distancia, valor };
      });

      setGuinchos(guinchosComDistancia);
    } catch (error) {
      console.error('Erro ao buscar guinchos ativos:', error);
      Alert.alert('Erro', 'Não foi possível obter os guinchos ativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClienteLocation();
  }, []);

  useEffect(() => {
    if (clienteLocation) {
      fetchGuinchos();
    }
  }, [clienteLocation]);

  // Renderizar os cards de guinchos
  const renderGuinchoCard = ({ item }: { item: Guincho }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <Text style={styles.cardText}>Modelo: {item.modelo}</Text>
      <Text style={styles.cardText}>Telefone: {item.telefone}</Text>
      <Text style={styles.cardText}>Distância: {item.distancia?.toFixed(2)} km</Text>
      <Text style={styles.cardText}>Valor: R$ {item.valor?.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={guinchos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuinchoCard}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  card: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    marginVertical: 5,
  },
});

