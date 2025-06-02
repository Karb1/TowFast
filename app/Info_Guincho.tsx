import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

interface GuinchoProfile {
  username: string;
  email: string;
  phone?: string;
  licensePlate?: string;
  modelo?: string;
  tipo: string; // sempre 'Guincho'
}

export default function GuinchoProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [user, setUser] = useState<GuinchoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<GuinchoProfile>({
    username: '',
    email: '',
    phone: '',
    licensePlate: '',
    modelo: '',
    tipo: 'Guincho',
  });

  useEffect(() => {
    if (!userId) return;

    const fetchGuincho = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`http://192.168.15.13:3003/userinfo/${userId}`);
        const data = res.data;

        const mappedUser: GuinchoProfile = {
          username: data.Nome || '',
          email: data.Email || '',
          phone: data.Telefone || '',
          licensePlate: data.Placa || '',
          modelo: data.Modelo || '',
          tipo: 'Guincho',
        };

        setUser(mappedUser);
        setForm(mappedUser);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados do guincho');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuincho();
  }, [userId]);

  function handleChange(field: keyof GuinchoProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleSave = async () => {
    if (!form.username || !form.email || !form.tipo) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios: usuário, email e tipo.');
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post('http://192.168.15.13:3003/registerGuincho', form);

      if (res.status === 200) {
        Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
        router.back();
      } else {
        Alert.alert('Erro', 'Falha ao salvar os dados');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar os dados');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={['rgba(196, 238, 242, 1)', 'rgba(235, 216, 134, 1)', 'rgba(235, 201, 77, 1)']}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Editar Perfil do Guincho</Text>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Usuário</Text>
              <TextInput
                style={styles.input}
                value={form.username}
                onChangeText={(text) => handleChange('username', text)}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={form.phone || ''}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Placa do Veículo</Text>
              <TextInput
                style={styles.input}
                value={form.licensePlate || ''}
                onChangeText={(text) => handleChange('licensePlate', text)}
              />

              <Text style={styles.label}>Modelo do Veículo</Text>
              <TextInput
                style={styles.input}
                value={form.modelo || ''}
                onChangeText={(text) => handleChange('modelo', text)}
              />

              <Text style={styles.label}>Tipo</Text>
              <TextInput
                style={styles.input}
                value={form.tipo}
                editable={false}
              />

              <TouchableOpacity
                style={[styles.button, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#025159',
    textAlign: 'center',
    marginVertical: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#025159',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#025159',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#025159',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
