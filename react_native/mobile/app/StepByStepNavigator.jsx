import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline, UrlTile } from 'react-native-maps';

export default function NavigationScreen() {
    const router = useRouter();
    const { name, time } = useLocalSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const mapRef = useRef(null);

    const steps = [
        { id: 1, text: 'Head north on Main Walkway', distance: '100m' },
        { id: 2, text: 'Turn right at Library Lawn', distance: '200m' },
        { id: 3, text: 'Continue straight for 200m', distance: '200m' },
        { id: 4, text: 'Destination will be on your left', distance: '50m' },
    ];

    const dummyRoutes = [
        { latitude: 39.2548, longitude: -76.7097 },
        { latitude: 39.2552, longitude: -76.7085 },
        { latitude: 39.2560, longitude: -76.7070 },
        { latitude: 39.2565, longitude: -76.7065 },
        { latitude: 39.2570, longitude: -76.7060 },
    ];

    const computeBearing = (start, end) => {
        const lat1 = (start.latitude * Math.PI) / 180;
        const lon1 = (start.longitude * Math.PI) / 180;
        const lat2 = (end.latitude * Math.PI) / 180;
        const lon2 = (end.longitude * Math.PI) / 180;
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = (brng * 180) / Math.PI;
        return (brng + 360) % 360;
    };

    useEffect(() => {
        if (!mapRef.current || currentStep >= dummyRoutes.length - 1) return;
        const start = dummyRoutes[currentStep];
        const end = dummyRoutes[currentStep + 1];
        mapRef.current.animateToRegion(
            {
                latitude: (start.latitude + end.latitude) / 2,
                longitude: (start.longitude + end.longitude) / 2,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            },
            800
        );
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push({ pathname: '/DestinationReached', params: { name, time } });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <SafeAreaView style={styles.safeContainer} edges={['right', 'left']}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude: dummyRoutes[0].latitude,
                    longitude: dummyRoutes[0].longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation
                rotateEnabled
            >
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                />
                <Polyline
                    coordinates={dummyRoutes}
                    strokeColor="#007AFF"
                    strokeWidth={4}
                />
                {currentStep < dummyRoutes.length - 1 && (
                    <Polyline
                        coordinates={[
                            dummyRoutes[currentStep],
                            dummyRoutes[currentStep + 1],
                        ]}
                        strokeColor="#34C759"
                        strokeWidth={6}
                    />
                )}
            </MapView>

            {/* 🔹 Top panel below notch */}
            <View style={styles.topPanel}>
                <Text style={styles.stepDistance}>{steps[currentStep].distance}</Text>
                <Text style={styles.stepText}>{steps[currentStep].text}</Text>
                <Text style={styles.stepCount}>
                    Step {currentStep + 1} of {steps.length}
                </Text>
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[styles.arrowButton, currentStep === 0 && styles.disabledButton]}
                        onPress={handleBack}
                        disabled={currentStep === 0}
                    >
                        <Text style={styles.arrowText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔹 Bottom panel */}
            <View style={styles.bottomPanel}>
                <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{name}</Text>
                    <Text style={styles.destinationTime}>ETA: {time}</Text>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Exit Navigation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#e0f7fa',
    },
    topPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#e0f7fa',
        paddingTop: 40, // extends below selfie camera
        paddingBottom: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 5,
    },
    stepDistance: { color: '#007AFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    stepText: { color: '#333', fontSize: 16, fontWeight: '600', textAlign: 'center' },
    stepCount: { color: '#666', fontSize: 12, marginTop: 2, marginBottom: 8 },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
        marginTop: 6,
    },
    arrowButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#ccc' },
    arrowText: { color: '#fff', fontSize: 20, fontWeight: '700' },

    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#e0f7fa',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 6,
        elevation: 8,
    },
    destinationInfo: { alignItems: 'center', marginBottom: 12 },
    destinationName: { color: '#333', fontSize: 18, fontWeight: '600' },
    destinationTime: { color: '#555', fontSize: 16, marginTop: 4 },
    backButton: {
        backgroundColor: '#ff453a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
