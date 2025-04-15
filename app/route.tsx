import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';

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
}

interface Instruction {
  distance: string;
  duration: string;
  instruction: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function RouteScreen() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [clientLocation, setClientLocation] = useState<Coordinates | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Coordinates | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const webViewRef = useRef<WebView>(null);
  const { solicitacaoId, userId } = useLocalSearchParams();
  const router = useRouter();

  const handleReturn = () => {
    if (locationSubscription) {
      locationSubscription.remove();
    }
    router.push(`/home_guincho?userId=${userId}&solicitacaoId=${solicitacaoId}&preco=${routeData?.preco}&latLongCliente=${routeData?.latLongCliente}&destino=${routeData?.destino}`);
  };

  console.log('ID da solicitação:', solicitacaoId);

  const startNavigation = async () => {
    if (isNavigating) {
      if (locationSubscription) {
        locationSubscription.remove();
      }
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
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    };

    getLocation();
    fetchRouteData();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const fetchRouteData = async () => {
    if (!solicitacaoId) {
      console.error('ID da solicitação não fornecido');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/solicitacao`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_Solicitacao: solicitacaoId
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error('Solicitação não encontrada');
          return;
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta do servidor não está em formato JSON');
      }

      const data = await response.json();
      if (!data || !data.latLongCliente || !data.destino) {
        throw new Error('Dados de localização incompletos');
      }

      setRouteData(data);

      const [clientLat, clientLong] = data.latLongCliente.split(',').map(Number);
      if (!isNaN(clientLat) && !isNaN(clientLong)) {
        setClientLocation({ latitude: clientLat, longitude: clientLong });
      }

      const [destLat, destLong] = data.destino.split(',').map(Number);
      if (!isNaN(destLat) && !isNaN(destLong)) {
        setDestinationLocation({ latitude: destLat, longitude: destLong });
      }
    } catch (error) {
      console.error('Erro ao buscar dados da rota:', error);
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReturn} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#025159" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rota</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navButton, isNavigating && styles.navButtonActive]} 
            onPress={startNavigation}
          >
            <Ionicons 
              name={isNavigating ? "pause-circle" : "navigate"} 
              size={24} 
              color="#025159" 
            />
            <Text style={styles.navButtonText}>
              {isNavigating ? 'Pausar' : 'Iniciar'} Navegação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => {
              if (currentLocation) {
                webViewRef.current?.injectJavaScript(`
                  map.setView([${currentLocation.latitude}, ${currentLocation.longitude}], 15);
                  true;
                `);
              }
            }}
          >
            <Ionicons name="locate" size={24} color="#025159" />
            <Text style={styles.navButtonText}>Centralizar</Text>
          </TouchableOpacity>
        </View>
        {routeData && (
          <View style={styles.infoRow}>
            <Text style={styles.info}>{routeData.distancia} km</Text>
            <Text style={styles.info}>•</Text>
            <Text style={styles.info}>{routeData.preco}</Text>
            {totalTime > 0 && (
              <>
                <Text style={styles.info}>•</Text>
                <Text style={styles.info}>{totalTime} min</Text>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.mapContainer}>
        {currentLocation && clientLocation && destinationLocation && (
          <WebView
            ref={webViewRef}
            style={styles.map}
            originWhitelist={['*']}
            onMessage={(event) => {
              const data = JSON.parse(event.nativeEvent.data);
              setInstructions(data.instructions);
              setTotalTime(data.totalTime);
            }}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                  <style>
                    #map { height: 100vh; width: 100%; }
                  </style>
                </head>
                <body style="margin: 0;">
                  <div id="map"></div>
                  <script>
                    const map = L.map('map').setView([${currentLocation.latitude}, ${currentLocation.longitude}], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                      attribution: '© OpenStreetMap contributors'
                    }).addTo(map);

                    const icons = {
                      current: L.divIcon({ className: 'icon', html: "<div style='background:#4CAF50;width:15px;height:15px;border-radius:50%;border:2px solid white'></div>", iconSize: [20,20] }),
                      client: L.divIcon({ className: 'icon', html: "<div style='background:#2196F3;width:15px;height:15px;border-radius:50%;border:2px solid white'></div>", iconSize: [20,20] }),
                      dest: L.divIcon({ className: 'icon', html: "<div style='background:#f44336;width:15px;height:15px;border-radius:50%;border:2px solid white'></div>", iconSize: [20,20] })
                    };

                    L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {icon: icons.current}).addTo(map);
                    L.marker([${clientLocation.latitude}, ${clientLocation.longitude}], {icon: icons.client}).addTo(map);
                    L.marker([${destinationLocation.latitude}, ${destinationLocation.longitude}], {icon: icons.dest}).addTo(map);

                    async function getRoute() {
                      const res1 = await fetch('https://router.project-osrm.org/route/v1/driving/${currentLocation.longitude},${currentLocation.latitude};${clientLocation.longitude},${clientLocation.latitude}?overview=full&geometries=geojson&steps=true');
                      const res2 = await fetch('https://router.project-osrm.org/route/v1/driving/${clientLocation.longitude},${clientLocation.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?overview=full&geometries=geojson&steps=true');

                      const data1 = await res1.json();
                      const data2 = await res2.json();

                      if (data1.code === 'Ok' && data2.code === 'Ok') {
                        L.geoJSON(data1.routes[0].geometry, {style:{color:'#4CAF50', weight:4}}).addTo(map);
                        L.geoJSON(data2.routes[0].geometry, {style:{color:'#2196F3', weight:4}}).addTo(map);

                        const bounds = L.latLngBounds(
                          [${currentLocation.latitude}, ${currentLocation.longitude}],
                          [${clientLocation.latitude}, ${clientLocation.longitude}],
                          [${destinationLocation.latitude}, ${destinationLocation.longitude}]
                        );
                        map.fitBounds(bounds, {padding:[50,50]});

                        const instructions = [];
                        let totalDuration = 0;

                        data1.routes[0].legs[0].steps.concat(data2.routes[0].legs[0].steps).forEach(step => {
                          instructions.push({
                            distance: (step.distance / 1000).toFixed(1) + ' km',
                            duration: Math.round(step.duration / 60) + ' min',
                            instruction: step.maneuver.instruction
                          });
                          totalDuration += step.duration;
                        });

                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          instructions,
                          totalTime: Math.round(totalDuration / 60)
                        }));
                      }
                    }
                    getRoute();
                  </script>
                </body>
                </html>
              `
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 20,
    minWidth: 130,
    justifyContent: 'center',
  },
  navButtonActive: {
    backgroundColor: '#E0F7FA',
  },
  navButtonText: {
    marginLeft: 5,
    color: '#025159',
    fontSize: 14,
    fontWeight: '500',
  },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#E0F7FA' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#025159' },
  infoContainer: { padding: 8, backgroundColor: '#FFF' },
  infoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  info: { fontSize: 14, color: '#025159', fontWeight: '500' },
  mapContainer: { flex: 1 },
  map: { flex: 1 }
});
