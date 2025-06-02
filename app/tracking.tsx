import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface GuinchoLocation {
  latitude: number;
  longitude: number;
}

interface DistanceInfo {
  distance: string;
  duration: string;
}

const TrackingScreen: React.FC = () => {
  const { id_solicitacao } = useLocalSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [guinchoLocation, setGuinchoLocation] = useState<GuinchoLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo>({ distance: 'Calculando...', duration: 'Calculando...' });
  const [validationCode, setValidationCode] = useState('');
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRideInProgress, setIsRideInProgress] = useState(false);

  // Solicita permissão de localização
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        return;
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadGuinchoLocation = async () => {
      if (!isMounted) return;

      try {
        const response = await fetch(`${API_BASE_URL}/corrida?idSolicitacao=${id_solicitacao}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Falha ao obter localização do guincho');

        const responseData = await response.json();
        const corrida = Array.isArray(responseData) ? responseData[0] : responseData;

        if (corrida?.status_Corrida === 'Finalizada') {
          const idMotorista = corrida.id_Motorista;
          if (idMotorista) {
            router.replace(`/home_motorista?id_Motorista=${corrida?.id_Motorista}`);
            return;
          }
        }

        const emAndamento = corrida?.status_Corrida === 'Em Andamento';
        setIsRideInProgress(emAndamento);

        if (emAndamento && corrida?.latLongCliente) {
          const [clientLat, clientLong] = corrida.latLongCliente.split(',').map(Number);
          if (!isNaN(clientLat) && !isNaN(clientLong)) {
            setLocation({ latitude: clientLat, longitude: clientLong });
          }
        }

        if (emAndamento && corrida?.destino) {
          const [destLat, destLong] = corrida.destino.split(',').map(Number);
          if (!isNaN(destLat) && !isNaN(destLong)) {
            setDestination({ latitude: destLat, longitude: destLong });
          }
        }

        if (emAndamento && corrida?.codigo_Validacao_Fim) {
          setValidationCode(corrida.codigo_Validacao_Fim);
        } else if (corrida?.codigo_Validacao_Inicio) {
          setValidationCode(corrida.codigo_Validacao_Inicio);
        }

        if (!emAndamento && corrida?.latLongGuincho) {
          const [lat, long] = corrida.latLongGuincho.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(long)) {
            setGuinchoLocation({ latitude: lat, longitude: long });
          }
        }

        if (corrida?.distancia) {
          const distanciaKm = parseFloat(corrida.distancia);
          const tempoEstimadoMinutos = Math.round((distanciaKm * 1.5 / 40) * 60);
          setDistanceInfo({
            distance: `${corrida.distancia} km`,
            duration: `${tempoEstimadoMinutos} minutos`,
          });
        } else {
          setDistanceInfo({ distance: 'Calculando...', duration: 'Calculando...' });
        }
      } catch (error) {
        console.error('Erro ao carregar localização do guincho:', error);
        if (isMounted) setErrorMsg('Erro ao atualizar localização do guincho. Tentando novamente...');
      }
    };

    loadGuinchoLocation();
    intervalId = setInterval(() => {
      if (isMounted) loadGuinchoLocation();
    }, 5000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [id_solicitacao, router]);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.validationCodeContainer}>
          <Text style={styles.validationCodeTitle}>Código de Validação</Text>
          <Text style={styles.validationCodeValue}>{validationCode || 'Carregando...'}</Text>
        </View>

        <View style={styles.mapContainer}>
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={{
                latitude: location?.latitude || -23.55052,
                longitude: location?.longitude || -46.633308,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              followsUserLocation={true}
              showsUserLocation={true}
            >
              {!isRideInProgress && guinchoLocation && (
                <Marker coordinate={guinchoLocation} title="Localização do Guincho">
                  <View style={styles.markerWrapper}>
                    <Ionicons name="car" size={24} color="#4CAF50" />
                  </View>
                </Marker>
              )}
              {isRideInProgress && destination && (
                <Marker coordinate={destination} title="Destino">
                  <View style={[styles.markerWrapper, { borderColor: '#FF5722' }]}>
                    <Ionicons name="location" size={24} color="#FF5722" />
                  </View>
                </Marker>
              )}
            </MapView>

            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => {
                if (location && mapRef.current) {
                  mapRef.current.animateToRegion(
                    {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    },
                    1000
                  );
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#025159" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tempo Estimado</Text>
            <Text style={styles.infoValue}>{distanceInfo.duration}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Distância</Text>
            <Text style={styles.infoValue}>{distanceInfo.distance}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 10,
  },
  map: {
    flex: 1,
  },
  markerWrapper: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
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
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    margin: 10,
  },
  infoCard: {
    alignItems: 'center',
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#025159',
  },
  validationCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 15,
    margin: 10,
    alignItems: 'center',
  },
  validationCodeTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  validationCodeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#025159',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});

export default TrackingScreen;
