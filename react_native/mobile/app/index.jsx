/*
index.jsx
Description: Default screen when the user opens the app,
             shows the map canvas and a search bar.
*/

// Imports
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Polyline, UrlTile } from 'react-native-maps';
import { Host, Portal } from 'react-native-portalize';

import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0=";

export default function App() {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const router = useRouter();

  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);

  const [selectedPOI, setSelectedPOI] = useState(null);
  const [viewMode, setViewMode] = useState('search');
  const [dummyRoutes, setDummyRoutes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Shared value for bottom sheet animated position (in pixels)
  const animatedSheetPosition = useSharedValue(0);

  // Animate Locate Me button relative to bottom sheet
  const locateMeStyle = useAnimatedStyle(() => {
    const bottomOffset = 20; // distance above sheet
    // Snap button above bottom sheet
    const bottom = Math.max(bottomOffset, SCREEN_HEIGHT - animatedSheetPosition.value + bottomOffset);
    return { bottom };
  });

  // Handle Locate Me
  const handleLocateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Fetch route from OpenRouteService
  const getRouteFromHeigit = async (start, end) => {
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ORS_API_KEY,
          },
          body: JSON.stringify({
            coordinates: [
              [start.longitude, start.latitude],
              [end.longitude, end.latitude],
            ],
          }),
        }
      );
      const data = await response.json();
      if (data?.routes?.[0]?.geometry) return data.routes[0].geometry;
      return null;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  // Decode polyline
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1; lat += dlat;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1; lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }

  // Search OpenStreetMap
  const searchPlaces = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=-76.7205,39.2619,-76.70003,39.2419&bounded=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Clear POI
  const handleClearPOI = () => {
    setSelectedPOI(null);
    setViewMode('search');
    setDummyRoutes([]);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleAddDummyPOI = () => {
    setSelectedPOI({ name: 'Engineering Building', coordinate: { latitude: 39.255, longitude: -76.709 } });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handlePoiClick = (e) => {
    const { name, coordinate } = e.nativeEvent;
    setSelectedPOI({ name, coordinate });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleGoNow = () => {
    setViewMode('directions');
    bottomSheetRef.current?.snapToIndex(2);

    if (mapRef.current && dummyRoutes.length > 0) {
      const allCoords = dummyRoutes.flat();
      mapRef.current.fitToCoordinates(allCoords, {
        edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
        animated: true,
      });
    }
  };

  const handleRouteGo = (route, skipSteps = false) => {
    if (!selectedPOI) return;
    const destinationName = selectedPOI.name;
    const path = skipSteps ? '/DestinationReached' : '/StepByStepNavigator';
    router.push({ pathname: path, params: { name: destinationName, time: route.time } });
  };

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => bottomSheetRef.current?.snapToIndex(3));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => bottomSheetRef.current?.snapToIndex(1));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Fetch route when location or POI changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (currentLocation && selectedPOI?.coordinate) {
        const geometry = await getRouteFromHeigit(currentLocation, selectedPOI.coordinate);
        if (geometry) {
          const decoded = decodePolyline(geometry);
          setDummyRoutes([decoded]);
          if (mapRef.current && decoded.length > 0) {
            mapRef.current.fitToCoordinates(decoded, {
              edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
              animated: true,
            });
          }
        }
      }
    };
    fetchRoute();
  }, [currentLocation, selectedPOI]);

  const routes = [
    { id: '1', name: 'Route 1', time: '7 min', distance: '0.5 miles' },
    { id: '2', name: 'Route 2', time: '8 min', distance: '0.55 miles' },
    { id: '3', name: 'Route 3', time: '6 min', distance: '0.45 miles' },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{ latitude: 39.2548, longitude: -76.7097, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            onPoiClick={handlePoiClick}
            showsUserLocation
          >
            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
            {dummyRoutes.map((routeCoords, idx) => (
              <Polyline key={idx} coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
            ))}
          </MapView>

          {/* Locate Me Button */}
          <Animated.View style={[styles.locateButton, locateMeStyle]}>
            <TouchableOpacity onPress={handleLocateMe}>
              <Text style={styles.locateButtonText}>📍</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Menu Button */}
          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.bottomSheetBackground}
            animatedPosition={animatedSheetPosition}
          >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <BottomSheetView style={styles.sheetContent}>
                {viewMode === 'search' && (
                  <>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Where would you like to go?"
                      placeholderTextColor="#999"
                      value={inputText}
                      onChangeText={(text) => { setInputText(text); searchPlaces(text); }}
                    />
                    <FlatList
                      data={searchResults}
                      keyExtractor={(item) => item.place_id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                          onPress={() => {
                            const coordinate = { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) };
                            setSelectedPOI({ name: item.display_name, coordinate });
                            setViewMode("poi");
                            bottomSheetRef.current?.snapToIndex(1);
                            setSearchResults([]);
                            setInputText("");
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>{item.display_name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </>
                )}

                {viewMode === 'poi' && selectedPOI && (
                  <>
                    <Text style={styles.sheetTitle}>Building Info</Text>
                    <View style={styles.poiContainer}>
                      <Text style={styles.poiLabel}>Selected POI:</Text>
                      <Text style={styles.poiName}>{selectedPOI.name}</Text>
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={[styles.actionButton, styles.infoButton]} onPress={() => console.log("See Info")}>
                          <Text style={[styles.actionButtonText, { color: '#000' }]}>See Building Info</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.goButton]} onPress={handleGoNow}>
                          <Text style={styles.actionButtonText}>Go Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {viewMode === 'directions' && selectedPOI && (
                  <>
                    <Text style={styles.sheetTitle}>Directions</Text>
                    <View style={styles.directionBox}>
                      <Text style={styles.directionText}>From: Current Location</Text>
                      <Text style={styles.directionText}>To: {selectedPOI.name}</Text>
                    </View>
                    <FlatList
                      data={routes}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.routeItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.routeType}>{item.name}</Text>
                            <Text style={styles.routeDetails}>{item.time} • {item.distance}</Text>
                          </View>
                          <TouchableOpacity style={styles.routeGoButton} onPress={() => handleRouteGo(item)}>
                            <Text style={styles.routeGoButtonText}>Go</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </>
                )}
              </BottomSheetView>
            </KeyboardAvoidingView>
          </BottomSheet>
        </Portal>
      </Host>
    </GestureHandlerRootView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomSheetBackground: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handleIndicator: { backgroundColor: '#ccc' },
  sheetContent: { flex: 1, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  searchInput: { width: '100%', height: 40, borderRadius: 8, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, backgroundColor: '#fff' },
  poiContainer: { marginTop: 10, alignItems: 'center' },
  poiLabel: { fontSize: 14, color: '#666' },
  poiName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 4, marginBottom: 20 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  actionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  infoButton: { flex: 2, backgroundColor: '#f1f097ff', marginRight: 8 },
  goButton: { flex: 1, backgroundColor: '#bbaa12ff' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
  menuButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  menuLine: { width: 24, height: 3, backgroundColor: '#333', marginVertical: 2, borderRadius: 2 },
  directionBox: { backgroundColor: '#f7f7f7', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  directionText: { fontSize: 15, color: '#333', marginBottom: 4 },
  routeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  routeType: { fontWeight: '600', fontSize: 16, color: '#333', marginBottom: 2 },
  routeDetails: { fontSize: 14, color: '#666' },
  routeGoButton: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  routeGoButtonText: { color: '#fff', fontWeight: '600' },
  locateButton: { position: 'absolute', right: 20, backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 50, elevation: 4 },
  locateButtonText: { color: '#fff', fontWeight: '600' },
});
