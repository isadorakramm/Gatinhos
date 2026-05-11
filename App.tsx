import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const SERVER_URL = 'http://localhost:8081/assets/index.html';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VisionFrame – Teste Face Tracking</Text>
      <WebView
        style={styles.webview}
        source={{ uri: SERVER_URL }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        onPermissionRequest={(request: any) => request.grant(request.resources)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: {
    color: '#fff', textAlign: 'center',
    padding: 10, fontSize: 14, fontWeight: 'bold',
  },
  webview: { flex: 1 },
});