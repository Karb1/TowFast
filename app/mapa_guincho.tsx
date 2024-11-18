import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

export default function GuinchoMapScreen() {
  const [drivers, setDrivers] = useState<any[]>([]); // Lista de motoristas que solicitaram ajuda
  const [region, setRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Função para carregar motoristas que solicitaram ajuda
  const loadDriverRequests = async () => {
    try {
      const response = await axios.get('API_URL/motoristas-solicitaram-ajuda');
      setDrivers(response.data);
    } catch (error) {
      console.error('Erro ao carregar motoristas', error);
      Alert.alert('Erro', 'Não foi possível carregar as solicitações de ajuda.');
    }
  };

  // Função para aceitar uma solicitação de ajuda
  const acceptRequest = async (driverId: string) => {
    try {
      const response = await axios.post('API_URL/aceitar-ajuda', {
        driverId,
      });

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Solicitação de ajuda aceita.');
        loadDriverRequests(); // Recarregar lista de solicitações após aceitar
      } else {
        Alert.alert('Erro', 'Não foi possível aceitar a solicitação.');
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação', error);
      Alert.alert('Erro', 'Ocorreu um erro ao aceitar a solicitação.');
    }
  };

  useEffect(() => {
    loadDriverRequests();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            title={`Motorista ${driver.name}`}
            description={`Solicitação de ajuda`}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{driver.name}</Text>
              <Button
                title="Aceitar"
                onPress={() => acceptRequest(driver.id)}
                color="#4CAF50"
              />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
  },
  markerText: {
    fontWeight: 'bold',
  },
});
