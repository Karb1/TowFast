import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface MapDisplayProps {
    guinchoLocation: { latitude: number; longitude: number } | null;
    clienteLocation: { latitude: number; longitude: number } | null;
    distancia: string;
    tempoEstimado: string;
    statusMensagem: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
    guinchoLocation,
    clienteLocation,
    distancia,
    tempoEstimado,
    statusMensagem
}) => {
    const [mapRegion] = React.useState({
        latitude: clienteLocation?.latitude || -23.550520,
        longitude: clienteLocation?.longitude || -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    return (
        <>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={mapRegion}
                    followsUserLocation={false}
                    showsUserLocation={true}
                    moveOnMarkerPress={false}
                    zoomEnabled={true}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    toolbarEnabled={false}
                    onRegionChangeComplete={() => {}}
                    scrollEnabled={false}
                >
                    {guinchoLocation && (
                        <Marker
                            coordinate={{
                                latitude: guinchoLocation.latitude,
                                longitude: guinchoLocation.longitude
                            }}
                            title="Guincho"
                            description="Localização atual do guincho"
                        >
                            <View style={styles.markerGuincho}>
                                <Ionicons name="car" size={24} color="#025159" />
                            </View>
                        </Marker>
                    )}
                    {clienteLocation && (
                        <Marker
                            coordinate={{
                                latitude: clienteLocation.latitude,
                                longitude: clienteLocation.longitude
                            }}
                            title="Você"
                            description="Sua localização"
                        >
                            <View style={styles.markerCliente}>
                                <Ionicons name="person" size={24} color="#2196F3" />
                            </View>
                        </Marker>
                    )}
                </MapView>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusTitle}>{statusMensagem}</Text>
                    </View>
                    <View style={styles.statusInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location" size={24} color="#025159" />
                            <Text style={styles.infoText}>Distância: {distancia}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time" size={24} color="#025159" />
                            <Text style={styles.infoText}>Tempo estimado: {tempoEstimado || 'Calculando...'}</Text>
                        </View>
                    </View>
                    <Text style={styles.subText}>
                        Aguarde enquanto o guincho se dirige até você
                    </Text>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    map: {
        flex: 1,
    },
    infoContainer: {
        width: '100%',
        marginTop: 20,
    },
    statusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    statusHeader: {
        alignItems: 'center',
        marginBottom: 15,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#025159',
        textAlign: 'center',
    },
    statusInfo: {
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#025159',
        marginLeft: 10,
    },
    subText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    markerGuincho: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#025159',
    },
    markerCliente: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
});

export default MapDisplay;