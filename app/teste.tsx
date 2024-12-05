import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity,Button } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Importando useRouter
import Icon from 'react-native-vector-icons/Ionicons'; // Importando ícones

const TestePage = () => {
  const [text, setText] = useState('Texto inicial');

  const handlePress = () => {
    setText('Texto alterado ao clicar no botão!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <Button title="Clique aqui" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default TestePage;
