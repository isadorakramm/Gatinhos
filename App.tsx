import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet,TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import LeituraReceitaScreen from './src/screens/LeituraReceitaScreen';

const Stack = createStackNavigator();

function ARScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: 'http://localhost:8082/assets/index.html' }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        onPermissionRequest={(request: any) => request.grant(request.resources)}
      />
      <TouchableOpacity
        style={styles.botaoReceita}
        onPress={() => navigation.navigate('LeituraReceita')}
      >
        <Text style={styles.botaoReceitaTexto}>📋 Ler Receita</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AR">
        <Stack.Screen
          name="AR"
          component={ARScreen}
          options={{ title: 'VisionFrame – Prova Virtual' }}
        />
        <Stack.Screen
          name="LeituraReceita"
          component={LeituraReceitaScreen}
          options={{ title: 'Leitura de Receita' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview:   { flex: 1 },

  botaoReceita: {
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.4)',
},
botaoReceitaTexto: {
  color: '#fff',
  fontSize: 13,
  fontWeight: 'bold',
},
});