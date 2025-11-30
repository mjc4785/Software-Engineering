import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline, UrlTile } from 'react-native-maps';

export default function NavigationScreen() {
    const router = useRouter();
    const { steps: stepsParam, route: routeParam, destination, time } = useLocalSearchParams();

    const steps = stepsParam ? JSON.parse(stepsParam) : [];
    const routeCoords = routeParam ? JSON.parse(routeParam) : [];

    const [currentStep, setCurrentStep] = useState(0);
    const mapRef = useRef(null);

    // Animate map to current step
    useEffect(() => {
        if (!mapRef.current || currentStep >= routeCoords.length - 1) return;
        const start = routeCoords[currentStep];
        const end = routeCoords[currentStep + 1];
        mapRef.current.animateToRegion(
            {
                latitude: (start.latitude + end.latitude) / 2,
                longitude: (start.longitude + end.longitude) / 2,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            },
            800
        );
    }, [currentStep, routeCoords]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else router.push({ pathname: '/DestinationReached', params: { name: destination, time } });
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <SafeAreaView style={styles.safeContainer} edges={['right', 'left']}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={
                    routeCoords.length > 0
                        ? {
                            latitude: routeCoords[0].latitude,
                            longitude: routeCoords[0].longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }
                        : { latitude: 0, longitude: 0, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                }
                showsUserLocation
            >
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                {routeCoords.length > 0 && (
                    <>
                        <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
                        {currentStep < routeCoords.length - 1 && (
                            <Polyline
                                coordinates={[routeCoords[currentStep], routeCoords[currentStep + 1]]}
                                strokeColor="#34C759"
                                strokeWidth={6}
                            />
                        )}
                    </>
                )}
            </MapView>

            {/* Top panel */}
            <View style={styles.topPanel}>
                {steps[currentStep] && (
                    <>
                        <Text style={styles.stepDistance}>{steps[currentStep].distance}</Text>
                        <Text style={styles.stepText}>{steps[currentStep].text}</Text>
                        <Text style={styles.stepCount}>
                            Step {currentStep + 1} of {steps.length}
                        </Text>
                    </>
                )}
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

            {/* Bottom panel */}
            <View style={styles.bottomPanel}>
                <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{destination}</Text>
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