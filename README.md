# TowFast - Aplicativo de Assistência Veicular

TowFast é um aplicativo móvel desenvolvido com React Native e Expo que conecta motoristas a serviços de guincho quando necessitam de assistência veicular.

## Requisitos do Sistema

- Node.js 18.x ou superior
- npm 9.x ou superior
- Expo CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas macOS)

## Ambiente de Desenvolvimento

O projeto foi testado nos seguintes ambientes:
- Expo SDK 52.0.0
- React Native 0.76.2
- React 18.3.1

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd TowFast
```

2. Instale as dependências do projeto:
```bash
npm install
```

3. Instale as dependências específicas:
```bash
npm install @babel/core@7.26.0
npm install @expo/vector-icons@14.0.4
npm install @react-native-community/geolocation@3.4.0
npm install @react-native-picker/picker@2.9.0
npm install @react-navigation/native@6.1.18
npm install hammerjs@2.0.46
npm install jest@29.5.14
npm install react-native-sqlite-storage@6.0.5
npm install react-native-vector-icons@6.4.18
npm install react-test-renderer@18.3.0
npm install react@18.3.12
npm install axios@1.7.7
npm install cors@2.8.5
npm install expo-constants@17.0.3
npm install expo-font@13.0.1
npm install expo-linear-gradient@14.0.1
npm install expo-linking@7.0.2
npm install expo-location@18.0.3
npm install expo-router@4.0.6
npm install expo-splash-screen@0.29.11
npm install expo-status-bar@2.0.0
npm install expo-system-ui@4.0.3
npm install expo-web-browser@14.0.1
npm install expo@52.0.7
npm install express@4.21.1
npm install hammerjs@2.0.8
npm install jest-expo@52.0.2
npm install jest@29.7.0
npm install lottie-react-native@7.1.0
npm install mssql@11.0.1
npm install node-fetch@2.7.0
npm install react-dom@18.3.1
npm install react-native-geolocation-service@5.3.1
npm install react-native-gesture-handler@2.20.2
npm install react-native-google-places-autocomplete@2.5.7
npm install react-native-maps@1.18.0
npm install react-native-reanimated@3.16.1
npm install react-native-safe-area-context@4.12.0
npm install react-native-screens@4.1.0
npm install react-native-sqlite-storage@6.0.1
npm install react-native-vector-icons@10.2.0
npm install react-native-web@0.19.13
npm install react-native@0.76.2
npm install react-test-renderer@18.2.0
npm install react@18.3.1
npm install redis@4.7.0
npm install typescript@5.6.3
```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

2. Escolha uma das opções para executar o aplicativo:
- Pressione 'a' para abrir no Android Emulator
- Pressione 'i' para abrir no iOS Simulator
- Escaneie o QR code com o Expo Go (Android/iOS)

## Estrutura do Projeto

- `/app` - Arquivos principais da aplicação
- `/assets` - Recursos estáticos (imagens, fontes)
- `/components` - Componentes React reutilizáveis
- `/constants` - Constantes e configurações
- `/hooks` - Custom hooks React
- `/my-backend` - Servidor backend

## Backend

O backend do projeto utiliza:
- Express.js
- Microsoft SQL Server
- Redis para cache

Para iniciar o servidor backend:
```bash
cd my-backend
npm install
node server.js
```

## Funcionalidades Principais

- Autenticação de usuários
- Geolocalização em tempo real
- Solicitação de guincho
- Sistema de pagamento
- Chat entre motorista e prestador de serviço

## Testes

Para executar os testes:
```bash
npm test
```

## Licença

ISC
