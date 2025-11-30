/*
index.jsx
Description: This is the default screen when the user opens the app, 
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
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Host, Portal } from 'react-native-portalize';

import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HeadingPuck from '../components/HeadingPuck';
const HEADING_SHADOW = true; // set false to use default map location indicator


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Routing API key 
const ORS_API_KEY = "YOUR_ORS_KEY";
const BACKEND_URL = "https://be37ce20dcc5.ngrok-free.app/"

export default function App() {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  const animatedSheetPosition = useSharedValue(0);
  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);

  const [selectedPOI, setSelectedPOI] = useState(null);
  const [viewMode, setViewMode] = useState('search');
  const [dummyRoutes, setDummyRoutes] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null); // main user location
  const [customPOIs, setCustomPOIs] = useState([]);
  const [geoResults, setGeoResults] = useState([]);
  const [heading, setHeading] = useState(0);
  const [routeSteps, setRouteSteps] = useState([]);


  const router = useRouter();

  // Animate Locate Me button
  const locateMeStyle = useAnimatedStyle(() => {
    const bottomOffset = 20;
    const bottom = Math.max(bottomOffset, SCREEN_HEIGHT - animatedSheetPosition.value + bottomOffset);
    return { bottom };
  });

  // --- Location Tracking ---
  useEffect(() => {
    let locationSub;
    let headingSub;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Track position
      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 500, distanceInterval: 0 },
        (pos) => {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      );

      // Track heading
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

  // Center map on current location
  const handleLocateMe = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }

    // make sure we stay in search mode if geoResults exist
    if (geoResults.length > 0) {
      setViewMode('search');
    }
  };

  // Fetch custom POIs
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}api/poi-geojson/`);
        const geojson = await res.json();

        const parsed = geojson.features.map(f => ({
          id: f.properties.poi_id,
          name: f.properties.name,
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        }));
        setCustomPOIs(parsed);
      } catch (err) {
        console.error("Error fetching POIs:", err);
      }
    };
    fetchPOIs();
  }, []);
  // Handles user pressing "GO" on a route
  const handleRouteGo = (route, skipSteps = false) => {
    if (!selectedPOI) return;

    const destinationName = selectedPOI.name; // Use the POI's name

    // Option to go directly to destination reached page
    // Passes destination name and route time with params
    if (skipSteps) {
      router.push({
        pathname: '/DestinationReached',
        params: { name: destinationName, time: route.time },
      });
    }
    // Option to go to navigation page
    else {
      router.push({
        pathname: '/StepByStepNavigator',
        params: {
          steps: JSON.stringify(item.steps),
          route: JSON.stringify(item.geometry), // <-- add route coordinates
          destination: selectedPOI.name,
          time: item.time,
        },
      });

    }
  };

  // Keyboard snap behavior
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(3);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(1);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- Search ---
  const clearSearch = () => {
    setInputText("");
    setGeoResults([]);
    Keyboard.dismiss();
  };

  const searchPOIs = async (text) => {
    setInputText(text);
    if (!text) return setGeoResults([]);

    try {
      const res = await fetch(`${BACKEND_URL}api/search-pois/?q=${encodeURIComponent(text)}`);
      const data = await res.json();

      const parsed = data.features.map((f, index) => ({
        id: f.properties.poi_id || f.properties.osm_id || `feat-${index}`,
        name: f.properties.name,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }));
      setGeoResults(parsed);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // --- Route Fetching ---
  const getWalkingRoute = async (start, end) => {
    try {
      const url = `${BACKEND_URL}api/walking-directions/?start_lat=${start.latitude}&start_lon=${start.longitude}&end_lat=${end.latitude}&end_lon=${end.longitude}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.route_geometry) return null;

      return {
        geometry: data.route_geometry, // already in {latitude, longitude}
        steps: data.steps,
        total_time: data.total_time,
        total_distance: data.total_distance,
      };
    } catch (err) {
      console.error("Error fetching walking route:", err);
      return null;
    }
  };



  const decodePolyline = (encoded) => {
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
  };

  // Fetch route when location or POI changes
  // useEffect(() => {
  //   const fetchRoute = async () => {
  //     if (!currentLocation || !selectedPOI?.coordinate) return;

  //     const routeData = await getWalkingRoute(currentLocation, selectedPOI.coordinate);
  //     if (!routeData) return;

  //     setDummyRoutes([routeData.geometry]); // for Polyline
  //     setRouteSteps(routeData.steps);       // for directions bottom sheet

  //     if (mapRef.current && routeData.geometry.length > 0) {
  //       mapRef.current.fitToCoordinates(routeData.geometry, {
  //         edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
  //         animated: true,
  //       });
  //     }
  //   };

  //   fetchRoute();
  // }, [currentLocation, selectedPOI]);



  // --- Handle POI selection ---
  const handlePoiClick = (e) => {
    const { name, coordinate } = e.nativeEvent;
    setSelectedPOI({ name, coordinate });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleClearPOI = () => {
    setSelectedPOI(null);
    setViewMode('search');
    setDummyRoutes([]); // Clear polyline from map
    setRouteSteps([]);
    bottomSheetRef.current?.snapToIndex(1);
  };


  const handleGoNow = async () => {
    if (!selectedPOI || !currentLocation) return;

    // Fetch walking route
    const routeData = await getWalkingRoute(currentLocation, selectedPOI.coordinate);
    if (!routeData) return;

    setDummyRoutes([routeData.geometry]); // Display on map
    setRouteSteps(routeData.steps);       // For bottom sheet directions

    // Fit map to route
    if (mapRef.current && routeData.geometry.length > 0) {
      mapRef.current.fitToCoordinates(routeData.geometry, {
        edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
        animated: true,
      });
    }

    setViewMode('directions'); // Switch bottom sheet to directions view
    bottomSheetRef.current?.snapToIndex(2);
  };


  const handleSeeInfo = () => console.log('See Building Info pressed');

  const routes = [
    { id: '1', name: 'Route 1', time: '7 min', distance: '0.5 miles' },
    { id: '2', name: 'Route 2', time: '8 min', distance: '0.55 miles' },
    { id: '3', name: 'Route 3', time: '6 min', distance: '0.45 miles' },
  ];

  // --- Render ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Map */}
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: 39.2548,
              longitude: -76.7097,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
            onPoiClick={handlePoiClick}
            showsUserLocation={!HEADING_SHADOW} // Show default blue dot if HEADING_SHADOW is false
          >
            {customPOIs.map(poi => (
              <Marker
                key={poi.id}
                coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                title={poi.name}
                onPress={() => {
                  setSelectedPOI({ name: poi.name, coordinate: { latitude: poi.latitude, longitude: poi.longitude } });
                  setViewMode('poi');
                  bottomSheetRef.current?.snapToIndex(1);
                }}
              />
            ))}

            {/* Conditionally render the custom heading puck */}
            {HEADING_SHADOW && currentLocation && (
              <HeadingPuck coordinate={currentLocation} heading={heading} />
            )}

            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

            {dummyRoutes.map((coords, idx) => (
              <Polyline key={idx} coordinates={coords} strokeColor="#007AFF" strokeWidth={4} />
            ))}
          </MapView>


          {/* Locate Me Button */}
          <Animated.View style={[styles.locateButton, locateMeStyle]}>
            <TouchableOpacity onPress={handleLocateMe}>
              <Ionicons name="navigate" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Sheet */}
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={1} // starting snap index
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.bottomSheetBackground}
            animatedPosition={animatedSheetPosition}
          >
            {/* Keyboard safe bottom sheet */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <BottomSheetView style={styles.sheetContent}>
                {/* Close/X button appears in poi and directions view (but not search view) */}
                {(viewMode === 'poi' || viewMode === 'directions') && (
                  <TouchableOpacity style={styles.closeButton} onPress={handleClearPOI}>
                    <View style={styles.closeCircle}>
                      <Text style={styles.closeButtonText}>×</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Search input appears only in search mode */}
                {viewMode === 'search' && (
                  <>
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={styles.searchInput}
                        value={inputText}
                        onChangeText={searchPOIs}
                        placeholder="Search POIs..."
                      />

                      {inputText.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                          <Text style={styles.clearButtonText}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <FlatList
                      data={geoResults}
                      keyExtractor={(item) => item.id.toString()}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.searchItem}
                          onPress={() => {
                            // zoom map and select POI
                            const coord = { latitude: item.lat, longitude: item.lon };

                            setSelectedPOI({ name: item.name, coordinate: coord });
                            setViewMode("poi");

                            mapRef.current?.animateToRegion({
                              ...coord,
                              latitudeDelta: 0.002,
                              longitudeDelta: 0.002,
                            });

                            bottomSheetRef.current?.snapToIndex(1);
                          }}
                        >
                          <Text style={styles.searchItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />

                  </>
                )}

                {/* Shows the POI info + buttons */}
                {viewMode === 'poi' && selectedPOI && (
                  <>
                    <Text style={styles.sheetTitle}>Building Info</Text>
                    <View style={styles.poiContainer}>
                      <Text style={styles.poiLabel}>Selected POI:</Text>
                      <Text style={styles.poiName}>{selectedPOI.name}</Text>

                      <View style={styles.actionButtonsContainer}>
                        {/* See building info button */}
                        <TouchableOpacity
                          style={[styles.actionButton, styles.infoButton]}
                          onPress={handleSeeInfo}
                        >
                          <Text style={[styles.actionButtonText, { color: '#000' }]}>
                            See Building Info
                          </Text>
                        </TouchableOpacity>
                        {/* Go now button */}
                        <TouchableOpacity
                          style={[styles.actionButton, styles.goButton]}
                          onPress={handleGoNow}
                        >
                          <Text style={styles.actionButtonText}>Go Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {/* Directions view- shows routes to selected POI */}
                {viewMode === 'directions' && selectedPOI && (
                  <>
                    <Text style={styles.sheetTitle}>Directions</Text>
                    <View style={styles.directionBox}>
                      <Text style={styles.directionText}>From: Current Location</Text>
                      <Text style={styles.directionText}>To: {selectedPOI.name}</Text>
                    </View>

                    {/* List of routes  */}
                    <FlatList
                      data={[{
                        id: '1',
                        name: 'Recommended Route',
                        time: routeSteps.length ? `${Math.round(routeSteps.reduce((a, s) => a + parseFloat(s.distance), 0) / 80)} min` : 'N/A', // optional estimate
                        steps: routeSteps,
                      }]}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.routeItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.routeType}>{item.name}</Text>
                            <Text style={styles.routeDetails}>Time: {item.time}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.routeGoButton}
                            onPress={() => {
                              router.push({
                                pathname: '/StepByStepNavigator',
                                params: { steps: JSON.stringify(item.steps), destination: selectedPOI.name },
                              });
                            }}
                          >
                            <Text style={styles.routeGoButtonText}>Go Now</Text>
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


// Styling for the page
const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: { backgroundColor: '#ccc' },
  sheetContent: { flex: 1, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  searchInput: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  poiContainer: { marginTop: 10, alignItems: 'center' },
  poiLabel: { fontSize: 14, color: '#666' },
  poiName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 4, marginBottom: 20 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  actionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  infoButton: { flex: 2, backgroundColor: '#f1f097ff', marginRight: 8 },
  goButton: { flex: 1, backgroundColor: '#bbaa12ff' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
  button: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: '#333',
    marginVertical: 2,
    borderRadius: 2,
  },
  closeButton: { position: 'absolute', top: 10, right: 20, zIndex: 10 },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  closeButtonText: { fontSize: 24, color: '#333', marginTop: -2 },
  directionBox: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  directionText: { fontSize: 15, color: '#333', marginBottom: 4 },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  routeType: { fontWeight: '600', fontSize: 16, color: '#333', marginBottom: 2 },
  routeDetails: { fontSize: 14, color: '#666' },
  routeGoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  routeGoButtonText: { color: '#fff', fontWeight: '600' },
  locateButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  locateButtonText: { color: '#fff', fontWeight: '600' },
  searchItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchItemText: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 10,
    marginTop: 10,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    borderColor: '#464646ff',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 20,
    fontWeight: "300",
  },
});
