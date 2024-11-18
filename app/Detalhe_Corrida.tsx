import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function RaceDetailsScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<any>(null); // Para armazenar a localização atual do motorista
  const [requestStatus, setRequestStatus] = useState<string>('Aguardando Aceitação');
  const [driverId, setDriverId] = useState<string>('ID_DO_MOTORISTA'); // ID do motorista (substituir pelo valor real)

  // Simulação de localização atual do motorista (em um cenário real, isso viria da requisição)
  useEffect(() => {
    const getCurrentLocation = async () => {
      // Aqui você deve integrar a lógica para obter a localização do motorista
      // Exemplo de localização fixa:
      setLocation({
        coords: {
          latitude: -23.55052,
          longitude: -46.633308,
        },
      });
    };

    getCurrentLocation();
  }, []);

  // Função para cancelar a solicitação de ajuda
  const cancelRequest = async () => {
    try {
      const response = await axios.post('API_URL/cancelar-solicitacao', {
        driverId,
      });

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Solicitação de ajuda cancelada.');
        navigation.goBack(); // Retornar à tela anterior
      } else {
        Alert.alert('Erro', 'Não foi possível cancelar a solicitação.');
      }
    } catch (error) {
      console.error('Erro ao cancelar solicitação', error);
      Alert.alert('Erro', 'Ocorreu um erro ao cancelar a solicitação.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Detalhes da Corrida</Text>
      <Text>Status da Solicitação: {requestStatus}</Text>
      {location ? (
        <Text>Localização: Latitude {location.coords.latitude}, Longitude {location.coords.longitude}</Text>
      ) : (
        <Text>Buscando localização...</Text>
      )}

      <Button title="Cancelar Solicitação" onPress={cancelRequest} />

      {/* Exibindo o mapa */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
          />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
});
