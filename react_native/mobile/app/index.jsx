/*
index.jsx
Description: Loads a WebView from backend URL using env vars from Expo Constants.
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Load environment variables from app.config.js
const { BACKEND_IP, BACKEND_PORT } = Constants.expoConfig?.extra || {};
const backendUrl = "https://c8fc091c1a5c.ngrok-free.app/map/";
// const backendUrl = `http://${BACKEND_IP}:${BACKEND_PORT}/map/`;

console.log('Loading backend from:', backendUrl);

export default function App() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: backendUrl }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
