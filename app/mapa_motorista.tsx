import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, Platform, TouchableOpacity, TextInput, FlatList, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';  
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isHelpRequested, setIsHelpRequested] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');  // Ponto de partida
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number, longitude: number }>>([]);
  const [userName, setUserName] = useState<string>('Motorista');
  const [suggestions, setSuggestions] = useState<any[]>([]); // Armazenar sugestões de localização
  const [selectedAddress, setSelectedAddress] = useState<string>(''); // Endereço selecionado

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Função para pedir permissão e obter a localização
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Permissão de localização negada');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  // Função para solicitar ajuda (enviar localização e destino para o servidor)
  const requestHelp = async () => {
    if (!location || !origin || !destination) {
      Alert.alert('Erro', 'Por favor, preencha todas as informações.');
      return;
    }

    try {
      const response = await axios.post('API_URL/solicitar-ajuda', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        motoristaId: 'ID_DO_MOTORISTA', // Substituir pelo ID real do motorista
        origem: origin,
        destino: destination,
      });

      if (response.status === 200) {
        setIsHelpRequested(true);
        Alert.alert('Sucesso', 'Sua solicitação de ajuda foi enviada.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar a solicitação de ajuda.');
      }
    } catch (error) {
      console.error('Erro ao solicitar ajuda:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar ajuda.');
    }
  };

  // Função para buscar e desenhar a rota no mapa
  const fetchRoute = async () => {
    if (!origin || !destination || !location) {
      Alert.alert('Erro', 'Por favor, forneça os dois pontos: origem e destino.');
      return;
    }

    const originCoordinates = await getCoordinatesFromAddress(origin);
    const destinationCoordinates = await getCoordinatesFromAddress(destination);

    if (originCoordinates && destinationCoordinates) {
      setRouteCoordinates([
        { latitude: originCoordinates.lat, longitude: originCoordinates.lng },
        { latitude: destinationCoordinates.lat, longitude: destinationCoordinates.lng }
      ]);
    }
  };

  // Função auxiliar para converter endereço em coordenadas (geocodificação com Nominatim - OpenStreetMap)
  const getCoordinatesFromAddress = async (address: string) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
      const result = response.data[0];
      return result ? { lat: parseFloat(result.lat), lng: parseFloat(result.lon) } : null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      return null;
    }
  };

  // Função para buscar sugestões de endereços dentro de uma área limitada (em torno da localização atual)
  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`https://api.openstreetmap.org/search?format=json&q=${query}`);
      
      // Verifique se a resposta foi bem-sucedida (status 200)
      if (!response.ok) {
        throw new Error("Erro na resposta da API: " + response.status);
      }
  
      // Verifique se o corpo da resposta não está vazio
      const responseText = await response.text(); // Pega a resposta como texto
      if (!responseText) {
        throw new Error("Resposta da API está vazia.");
      }
  
      // Tenta fazer o parse do JSON
      const data = JSON.parse(responseText);
  
      // Verifica se os dados são válidos
      if (data && Array.isArray(data) && data.length > 0) {
        const filteredSuggestions = data
          .filter(item => item.road && item.city && item.state) // Filtra para garantir que 'road', 'city' e 'state' estão presentes
          .map(item => ({
            road: item.road || '',
            city: item.city || '',
            state: item.state || '',
            country: item.country || '',
            displayName: item.display_name || ''
          }));
  
        // Atualize o estado com as sugestões filtradas
        setSuggestions(filteredSuggestions);
      } else {
        // Caso não haja sugestões
        setSuggestions([]);
        setErrorMsg("Nenhum endereço encontrado. Tente novamente.");
      }
    } catch (error) {
      setSuggestions([]);
      setErrorMsg("Erro ao buscar o endereço. Tente novamente.");
      console.error("Erro na busca de endereço: ", error);
    }
  };    

  // Função para fechar o teclado ao clicar fora
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Função que é chamada quando o usuário escolhe um endereço
  const handleAddressSelect = (address: string) => {
    setOrigin(address); // Atualiza o valor de origem
    setSuggestions([]);  // Limpa as sugestões
    fetchRoute();  // Recalcula a rota
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Text style={styles.userName}>Olá, {userName}!</Text>

        <Text style={styles.locationText}>Localização atual:</Text>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        {location ? (
          <Text style={styles.locationText}>
            Latitude: {location.coords.latitude}
          </Text>
        ) : (
          <Text style={styles.locationText}>Buscando localização...</Text>
        )}

        <Button title="Buscar Localização" onPress={getLocation} color="#3498db" />

        {/* Campo de Origem */}
        <Text style={styles.inputLabel}>Origem:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Informe o ponto de partida"
          value={origin}
          onChangeText={handleSearch}
        />
        {/* Exibe sugestões de endereços */}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAddressSelect(item.display_name)}>
                <Text style={styles.suggestionText}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}

        <Text style={styles.inputLabel}>Destino:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Informe o destino"
          value={destination}
          onChangeText={setDestination}
        />

        <TouchableOpacity onPress={fetchRoute} style={styles.routeButton}>
          <Text style={styles.routeButtonText}>Buscar Rota</Text>
        </TouchableOpacity>

        {/* Exibir o mapa com a rota */}
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
              description="Motorista"
              pinColor="blue"
            />
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#3498db"
                strokeWidth={5}
              />
            )}
          </MapView>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red', // Define a cor do texto de erro
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 10,
  },
  textInput: {
    height: 45,
    borderColor: '#3498db',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 5,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2980b9',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  suggestionsList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  routeButton: {
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 5,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
});

