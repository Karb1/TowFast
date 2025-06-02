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

interface UserProfile {
  username: string;
  password: string;
  email: string;
  phone?: string;
  CPF_CNPJ?: string;
  licensePlate?: string;
  modelo?: string;
  birthDate?: string; // YYYY-MM-DD
  cnh?: string;
  tipo: string; // 'Motorista' ou outro
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { IdMotorista } = useLocalSearchParams();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state separado para edição
  const [form, setForm] = useState<UserProfile>({
    username: '',
    password: '',
    email: '',
    phone: '',
    CPF_CNPJ: '',
    licensePlate: '',
    modelo: '',
    birthDate: '',
    cnh: '',
    tipo: '',
  });

  useEffect(() => {
    if (!IdMotorista) return;

    const fetchUser = async () => {
        try {
          setLoading(true);
      
          const res = await axios.get(`http://192.168.15.13:3003/userinfo/${IdMotorista}`);
          const data = res.data;
      
          const mappedUser: UserProfile = {
            username: data.Nome || '',
            password: '', // senha não é retornada
            email: data.Email || '',
            phone: data.Telefone || '',
            CPF_CNPJ: '', // não disponível
            licensePlate: data.Placa || '',
            modelo: data.Modelo || '',
            birthDate: data.DtNasc ? data.DtNasc.split('T')[0] : '',
            cnh: '', // não disponível
            tipo: 'Motorista',
          };
      
          setUser(mappedUser);
          setForm(mappedUser);
        } catch (error) {
          Alert.alert('Erro', 'Falha ao carregar dados do motorista');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };      
      
    fetchUser();
  }, [IdMotorista]);

  function handleChange(field: keyof UserProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleSave = async () => {
    // Validação simples
    if (!form.username || !form.email || !form.tipo) {
        Alert.alert('Atenção', 'Preencha os campos obrigatórios: usuário, email e tipo.');      
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post('http://192.168.15.13:3003/register', form);

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
          colors={['rgba(196, 238, 242, 1)', 'rgba(234, 229, 251, 1)', 'rgba(42, 109, 236, 1)']}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Editar Perfil</Text>
            
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
  
              <Text style={styles.label}>Data de Nascimento (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={form.birthDate || ''}
                onChangeText={(text) => handleChange('birthDate', text)}
                placeholder="YYYY-MM-DD"
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
        paddingTop: Platform.OS === 'ios' ? 100 : 80, // Mais espaço no topo
        paddingBottom: 20,
    },      
    formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 15,
      padding: 20,
      marginTop: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2A6DEC',
      textAlign: 'center',
      marginTop: 10,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      color: '#333',
      fontWeight: '500',
    },
    input: {
      backgroundColor: '#FCFBE0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      fontSize: 16,
      color: '#333',
    },
    button: {
      backgroundColor: '#2A6DEC',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
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
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      backButtonText: {
        fontSize: 16,
        color: '#025159',
        fontWeight: '600',
      },    
  });
