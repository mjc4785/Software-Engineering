import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';

import HeadingPuck from '../components/HeadingPuck';
const HEADING_SHADOW = true; // if true, show custom HeadingPuck; if false, show default blue dot

const BACKEND_URL = "https://1976b818c288.ngrok-free.app/";
const OFF_ROUTE_THRESHOLD = 20; // meters

export default function StepByStepNavigator() {
    const router = useRouter();
    const { startLat, startLon, endLat, endLon, destination } = useLocalSearchParams();

    const [routeGeometry, setRouteGeometry] = useState([]);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const mapRef = useRef(null);

    // -----------------------------
    // Location & Heading Tracking
    // -----------------------------
    useEffect(() => {
        let locationSub;
        let headingSub;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSub = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Highest, timeInterval: 500, distanceInterval: 0 },
                (pos) => {
                    setCurrentLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                }
            );

            headingSub = await Location.watchHeadingAsync((hdg) => {
                setHeading(hdg.trueHeading ?? hdg.magHeading ?? 0);
            });
        };

        startTracking();

        return () => {
            locationSub?.remove();
            headingSub?.remove();
        };
    }, []);

    // -----------------------------
    // Fetch Initial Route
    // -----------------------------
    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const url = `${BACKEND_URL}api/walking-directions/?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.route_geometry) setRouteGeometry(data.route_geometry);
                if (data.steps) setSteps(data.steps);
            } catch (err) {
                console.error("Error fetching route:", err);
            }
        };

        if (startLat && startLon && endLat && endLon) fetchRoute();
    }, [startLat, startLon, endLat, endLon]);

    // -----------------------------
    // Fit Map to Full Route
    // -----------------------------
    useEffect(() => {
        if (mapRef.current && routeGeometry.length > 0) {
            mapRef.current.fitToCoordinates(routeGeometry, {
                edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
                animated: false,
            });
        }
    }, [routeGeometry]);

    // -----------------------------
    // Current Step Coordinates
    // -----------------------------
    const currentStepCoords =
        steps[currentStep]?.way_points
            ? routeGeometry.slice(
                steps[currentStep].way_points[0],
                steps[currentStep].way_points[1] + 1
            )
            : [];

    // -----------------------------
    // Fit Map to Current Step
    // -----------------------------
    useEffect(() => {
        if (mapRef.current && currentStepCoords.length > 0) {
            const lats = currentStepCoords.map(p => p.latitude);
            const lons = currentStepCoords.map(p => p.longitude);
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

            const zoomLevel = 20; // tweak as needed
            mapRef.current.animateCamera({
                center: { latitude: centerLat, longitude: centerLon },
                zoom: zoomLevel,
            }, { duration: 500 });
        }
    }, [currentStep, currentStepCoords]);

    // -----------------------------
    // Off-route Detection
    // -----------------------------
    const isOffRoute = (userLoc, routeCoords) => {
        if (!routeCoords || routeCoords.length === 0) return false;
        let minDistance = Infinity;
        routeCoords.forEach((point) => {
            const distance = haversine(userLoc, point);
            if (distance < minDistance) minDistance = distance;
        });
        return minDistance > OFF_ROUTE_THRESHOLD;
    };

    const rerouteUser = async () => {
        if (!currentLocation) return;
        try {
            const url = `${BACKEND_URL}api/walking-directions/?start_lat=${currentLocation.latitude}&start_lon=${currentLocation.longitude}&end_lat=${endLat}&end_lon=${endLon}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.route_geometry) setRouteGeometry(data.route_geometry);
            if (data.steps) setSteps(data.steps);
            setCurrentStep(0);
            console.log("Rerouted!");
        } catch (err) {
            console.error("Reroute failed:", err);
        }
    };

    // -----------------------------
    // Off-route Detection
    // -----------------------------
    useEffect(() => {
        // Only check reroute if the user has started moving past the first step
        if (currentLocation && routeGeometry.length > 0 && currentStep > 0) {
            if (isOffRoute(currentLocation, routeGeometry)) {
                console.log("User is off-route, rerouting...");
                rerouteUser();
            }
        }
    }, [currentLocation, currentStep]);


    // -----------------------------
    // Navigation Handlers
    // -----------------------------
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push({
                pathname: '/DestinationReached',
                params: { name: destination, time: steps.reduce((acc, s) => acc + parseFloat(s.distance), 0) },
            });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <SafeAreaView style={styles.safeContainer} edges={['right', 'left']}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                showsUserLocation={!HEADING_SHADOW}
            >
                <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

                {routeGeometry.length > 0 && <Polyline coordinates={routeGeometry} strokeColor="#007AFF" strokeWidth={4} />}
                {currentStepCoords.length > 0 && <Polyline coordinates={currentStepCoords} strokeColor="#34C759" strokeWidth={6} />}
                {HEADING_SHADOW && currentLocation && <HeadingPuck coordinate={currentLocation} heading={heading} />}
            </MapView>

            <View style={styles.topPanel}>
                {steps[currentStep] && (
                    <>
                        <Text style={styles.stepDistance}>{steps[currentStep].distance}</Text>
                        <Text style={styles.stepText}>{steps[currentStep].text}</Text>
                        <Text style={styles.stepCount}>Step {currentStep + 1} of {steps.length}</Text>
                    </>
                )}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity style={[styles.arrowButton, currentStep === 0 && styles.disabledButton]} onPress={handleBack} disabled={currentStep === 0}>
                        <Text style={styles.arrowText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomPanel}>
                <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{destination}</Text>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Exit Navigation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#e0f7fa' },
    topPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#e0f7fa',
        paddingTop: 40,
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
    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 6 },
    arrowButton: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
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
    backButton: { backgroundColor: '#ff453a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
