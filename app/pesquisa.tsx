import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const AddressSearchScreen = () => {
    const [currentAddress, setCurrentAddress] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2F5bmFucmIiLCJhIjoiY204ZjQ2a3poMDhrMDJscHd5dW92NnNveSJ9.a4c2yNLkywGd-CqL8Yh14Q';
    const router = useRouter();
    const { IdMotorista } = useLocalSearchParams();
    const [selectedLocation, setSelectedLocation] = useState<{
        full_address: string;
        latitude: string | number;
        longitude: string | number;
    } | null>(null);
    const [searchResults, setSearchResults] = useState<
        Array<{
            id: string;
            properties?: { full_address?: string };
            place_name?: string;
            geometry?: { coordinates: [number, number] };
        }>
    >([]);

    const handleConfirm = async (...params: any[]) => {
        const [Lat, Long] = params;
        router.push(`/solicitacao?IdMotorista=${IdMotorista}&LatPre=${Lat}&LongPre=${Long}&enderecoatual=${currentAddress}`);
    };

    // Função de limpar
    const handleClear = () => {
        setInputText('');  // Limpa o texto da pesquisa
        setSelectedLocation(null);  // Reseta o endereço selecionado
        setSearchResults([]);  // Limpa os resultados da pesquisa
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permissão de localização negada');
                return;
            }

            setLoading(true);
            let location = await Location.getCurrentPositionAsync({});
            fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${location.coords.longitude}&latitude=${location.coords.latitude}&access_token=${MAPBOX_ACCESS_TOKEN}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features.length > 0) {
                        setCurrentAddress(data.features[0].properties?.full_address || data.features[0].place_name || 'Endereço não disponível');
                    }
                })
                .catch(error => console.log('Erro ao obter endereço:', error))
                .finally(() => setLoading(false));
        })();
    }, []);

    const searchAddress = () => {
        setLoading(true);
        fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${inputText}&access_token=${MAPBOX_ACCESS_TOKEN}`)
            .then(response => response.json())
            .then(data => setSearchResults(data.features || []))
            .catch(error => console.log('Erro na pesquisa de endereço:', error))
            .finally(() => setLoading(false));
    };

    const selectAddress = (address: { 
        properties?: { full_address?: string }; 
        place_name?: string; 
        geometry?: { coordinates?: [number, number] } 
    }) => {
        setSelectedLocation({
            full_address: address.properties?.full_address || address.place_name || 'Endereço não disponível',
            latitude: address.geometry?.coordinates?.[1] || 'Desconhecido',
            longitude: address.geometry?.coordinates?.[0] || 'Desconhecido'
        });
        setSearchResults([]); // Fecha o popup após seleção
    };

    return (
        <LinearGradient
            colors={['rgba(42, 109, 236, 1)', 'rgba(234, 229, 251, 1)', 'rgba(196, 238, 242, 1)']}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inner}
                >
                    {/* Botão de voltar */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-back" size={30} />
                    </TouchableOpacity>

                    {/* Logo no topo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {loading && <ActivityIndicator size="large" color="#fff" />}

                    {/* Endereço Atual */}
                    {currentAddress && (
                        <View style={styles.addressBox}>
                            <Text style={styles.addressText}>Endereço Atual:</Text>
                            <Text style={styles.addressValue}>{currentAddress}</Text>
                        </View>
                    )}

                    {/* Campo de pesquisa de endereço */}
                    <TextInput
                        placeholder="Digite um endereço"
                        value={inputText}
                        onChangeText={setInputText}
                        style={styles.input}
                        placeholderTextColor="black"
                    />

                    <TouchableOpacity style={styles.button} onPress={searchAddress}>
                        <Text style={styles.buttonText}>Pesquisar</Text>
                    </TouchableOpacity>

                    {/* Resultados da pesquisa - Popup de pesquisa de endereço */}
                    {searchResults.length > 0 && (
                        <View style={styles.popupContainer}>
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectAddress(item)} style={styles.resultItem}>
                                        <Text style={styles.resultText}>
                                            {item.properties?.full_address || item.place_name || 'Endereço não disponível'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Endereço Selecionado */}
                    {selectedLocation && (
                        <View style={styles.selectedBox}>
                            <Text style={styles.selectedText}>Endereço Selecionado:</Text>
                            <Text style={styles.selectedValue}>{selectedLocation.full_address}</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.confirmButton}
                                    onPress={() => handleConfirm(selectedLocation.latitude, selectedLocation.longitude)}>
                                    <Text style={styles.buttonText}>Confirmar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                    <Text style={styles.buttonText}>Limpar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
    },
    backButton: {
        marginRight: 15,
        position: 'absolute',
        top: 40,
        left: 0,
        padding: 10,
        borderRadius: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 30, // Ajustado para o topo
    },
    logo: {
        width: 180,
        height: 180,
    },
    addressBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    addressText: {
        fontWeight: 'bold',
        color: '#333',
    },
    addressValue: {
        color: '#666',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 5,
        marginBottom: 15,
        color: '#333',
    },
    button: {
        backgroundColor: '#025159',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 5,
        marginVertical: 5,
    },
    resultText: {
        color: '#333',
    },
    popupContainer: {
        backgroundColor: '#fff',
        maxHeight: 300,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
    },
    selectedBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    selectedText: {
        fontWeight: 'bold',
        color: '#333',
    },
    selectedValue: {
        color: '#666',
    },
    confirmButton: {
        backgroundColor: '#025159',
        padding: 15,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#989A91',  // Cor de destaque para o botão de limpar
        padding: 15,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '70%',
    },
});

export default AddressSearchScreen;
