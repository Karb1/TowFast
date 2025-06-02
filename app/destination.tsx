import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert, Modal, TextInput, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDhDVQMG6eoOe0cGhxqYGxCZT9Yl0wI_Uo';

interface RouteData {
  id_Solicitacao: string;
  id_Motorista: string;
  id_Guincho: string;
  distancia: string;
  preco: string;
  latLongCliente: string;
  latLongGuincho: string;
  status: string;
  dta_Solicitacao: string;
  destino: string;
  codigo_Validacao_Fim: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function DestinationScreen() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Coordinates | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationCode, setValidationCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [totalTime, setTotalTime] = useState<number>(0);
  const [distancia, setDistancia] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView>(null);
  const { solicitacaoId, userId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/corrida?idSolicitacao=${solicitacaoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Falha ao obter dados da rota');

        const data = await response.json();
        const route = data[0];
        setRouteData(route);

        if (route.status_Corrida === 'Finalizado') {
          router.push(`/home_motorista?userId=${userId}?idEndereco=${route.id_Endereco}`);
          return;
        }

        if (route.distancia) {
          const distanciaKm = parseFloat(route.distancia);
          const tempoEstimadoMinutos = Math.round(distanciaKm * 1.5 / 40 * 60);
          setDistancia(distanciaKm);
          setTotalTime(tempoEstimadoMinutos);
        }

        if (route.destino) {
          const [lat, lng] = route.destino.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            setDestinationLocation({ latitude: lat, longitude: lng });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados da rota:', error);
        Alert.alert('Erro', 'Falha ao carregar dados da rota');
      }
    };

    fetchRouteData();
    const interval = setInterval(fetchRouteData, 5000);
    return () => clearInterval(interval);
  }, [solicitacaoId, userId]);

  const startNavigation = async () => {
    if (isNavigating && locationSubscription) {
      locationSubscription.remove();
      setIsNavigating(false);
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de localização necessária para navegação');
      return;
    }

    setIsNavigating(true);
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    );
    setLocationSubscription(subscription);
  };

  useEffect(() => {
    startNavigation();
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: currentLocation?.latitude || -23.550520,
                longitude: currentLocation?.longitude || -46.633308,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
              followsUserLocation={true}
              showsUserLocation={true}
            >
              {currentLocation && destinationLocation && (
                <MapViewDirections
                  origin={currentLocation}
                  destination={destinationLocation}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={3}
                  strokeColor="#025159"
                  onReady={result => {
                    const tempoEstimadoMinutos = Math.round((result.distance * 1.5 / 40) * 60);
                    setDistancia(result.distance);
                    setTotalTime(tempoEstimadoMinutos);
                    mapRef.current?.fitToCoordinates(result.coordinates, {
                      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                      animated: true,
                    });
                  }}
                />
              )}
              {destinationLocation && (
                <Marker coordinate={destinationLocation} title="Destino">
                  <View style={{
                    backgroundColor: 'white',
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: '#FF0000'
                  }}>
                    <Ionicons name="location" size={24} color="#FF0000" />
                  </View>
                </Marker>
              )}
            </MapView>
            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => {
                if (mapRef.current && currentLocation) {
                  mapRef.current.animateToRegion({
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                  }, 500);
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#025159" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Tempo Estimado</Text>
              <Text style={styles.infoValue}>{totalTime || 'Calculando...'} min</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Distância</Text>
              <Text style={styles.infoValue}>{distancia.toFixed(2)} km</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => setShowValidationModal(true)}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Finalizar Serviço</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Digite o código de validação final</Text>
            {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
            <TextInput
              style={styles.input}
              value={validationCode}
              onChangeText={setValidationCode}
              placeholder="Digite o código"
              keyboardType="numeric"
              maxLength={6}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowValidationModal(false);
                  setValidationCode('');
                  setValidationError('');
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  if (!validationCode.trim()) {
                    setValidationError('Por favor, digite o código de validação');
                    return;
                  }

                  if (validationCode === routeData?.codigo_Validacao_Fim) {
                    try {
                      const response = await fetch(`${API_BASE_URL}/AtualizaCorrida`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          id_Solicitacao: solicitacaoId,
                          status: 'Finalizada'
                        })
                      });

                      if (!response.ok) throw new Error('Falha ao atualizar o status da corrida');

                      setShowValidationModal(false);
                      setValidationError('');
                      router.push(`/home_guincho?solicitacaoId=${solicitacaoId}&userId=${userId}`);
                    } catch (error) {
                      console.error('Erro ao atualizar status:', error);
                      Alert.alert('Erro', 'Falha ao atualizar o status da corrida');
                    }
                  } else {
                    setValidationError('Código de validação incorreto');
                  }
                }}
              >
                <Text style={styles.buttonText}>Validar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 10,
    position: 'relative',
  },
  map: { flex: 1, width: '100%', height: '100%' },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#025159',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    elevation: 3,
  },
  buttonIcon: { marginRight: 10 },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    margin: 10,
  },
  infoCard: { alignItems: 'center', flex: 1 },
  infoTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#025159' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#025159' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },
  errorText: { color: 'red', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  button: {
    backgroundColor: '#025159',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#666' },
});
