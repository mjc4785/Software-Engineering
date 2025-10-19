/*
DestinationReached.jsx
Description: This page is displayed when the user reaches their destination. 
                It enables the user to exit back to index.jsx (the map).
*/

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DestinationScreen() {
    const router = useRouter();
    const { name, time } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎉 Destination Arrived!</Text>
            <Text style={styles.subtitle}>You have reached {name}.</Text>

            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                <Text style={styles.backButtonText}>Back to Map</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
    subtitle: { fontSize: 18, color: '#666', marginBottom: 24, textAlign: 'center' },
    backButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    backButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
