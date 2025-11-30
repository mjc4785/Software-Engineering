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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');


// Routing API key 
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0=";
const BACKEND_URL = "https://e4228981bce1.ngrok-free.app/"

// Main React component
export default function App() {

  // Make references to bottom sheet and map to... reference later
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  // Shared value for bottom sheet animated position (in pixels)
  const animatedSheetPosition = useSharedValue(0);

  // Define snap points for bottom sheet
  // useMemo (memoize) is used so the array isn't recalculated every render
  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);

  // Set some component states
  const [selectedPOI, setSelectedPOI] = useState(null); // what POI is selected
  const [viewMode, setViewMode] = useState('search'); // viewMode dictates what the bottom sheet shows.
  const [dummyRoutes, setDummyRoutes] = useState([]); // Lines on map for dummy POI
  const [inputText, setInputText] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null);     // State for tracking user's current location
  const [location, setLocation] = useState(null); // Start location (not necessarily the user's current location but can be)
  const [customPOIs, setCustomPOIs] = useState([]);
  const [geoResults, setGeoResults] = useState([]);


  // Animate Locate Me button relative to bottom sheet
  const locateMeStyle = useAnimatedStyle(() => {
    const bottomOffset = 20;
    const bottom = Math.max(bottomOffset, SCREEN_HEIGHT - animatedSheetPosition.value + bottomOffset);
    return { bottom };
  });


  // hook to navigate between screens
  const router = useRouter();

  // Get and center map on current location
  const handleLocateMe = async () => {
    try {
      // Ask for location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update state
      setCurrentLocation({ latitude, longitude });

      // Animate map to the user's current location
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

  //
  // MOST RECENT ADDITION 10/27/25
  //

  // Call OpenRouteService Directions API to get route from current location to selected destination
  const getRouteFromHeigit = async (start, end) => {
    try {
      const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
        }),
      });

      const data = await response.json();
      console.log("Routing response:", data);

      if (data?.routes?.[0]?.geometry) {
        return data.routes[0].geometry; // encoded polyline
      } else {
        console.warn("No geometry returned from routing API");
        return null;
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  // Helper to decode encoded polyline into an array of lat/lon pairs
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  }
  //END OF MOST RECENT

  const clearSearch = () => {
    setInputText("");
    setGeoResults([]);
    Keyboard.dismiss();
  };
  // Fetch matching locations from OpenStreetMap (Nominatim)
  const searchPOIs = async (text) => {
    setInputText(text);

    if (!text) {
      setGeoResults([]);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}api/search-pois/?q=${encodeURIComponent(text)}`);
      const data = await res.json();

      // GeoJSON → simplified result list
      const parsed = data.features.map((f, index) => ({
        id: f.properties.poi_id || f.properties.osm_id || `feat-${index}`,
        name: f.properties.name,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }));

      setGeoResults(parsed);
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  const fetchResults = async (text) => {
    const res = await fetch(`${BASE_URL}/api/search-pois/?q=${text}`);
    const data = await res.json();
    setGeoJson(data);
  };

  // Function to send the user's current GPS coordinates to the backend server
  const sendLocationToBackend = async (coords) => {
    try {
      // Send a POST request to the backend API endpoint
      const response = await fetch('https://your-backend-url.com/api/update-location', {
        method: 'POST', // HTTP method for sending data
        headers: {
          'Content-Type': 'application/json', // Tell the server the data format is JSON
        },
        body: JSON.stringify({
          // Convert the coordinates and timestamp into a JSON string
          latitude: coords.latitude,    // User's current latitude
          longitude: coords.longitude,  // User's current longitude
          timestamp: new Date().toISOString(), // Current time in ISO format

          /* 
          Example of what the backend receives in the request body:
          {
            "latitude": 39.2548,
            "longitude": -76.7097,
            "timestamp": "2025-10-23T16:42:11.123Z"
          }
          */
        }),
      });

      // If the server response is not OK (status not in 200–299), throw an error
      if (!response.ok) {
        throw new Error('Failed to send location');
      }

      // Log success message with the coordinates
      console.log(`Location (${coords.latitude}, ${coords.longitude}) sent successfully to backend at approx. ${new Date().toISOString()}`);

    } catch (error) {
      // Handle and log any errors that occur during the fetch or response handling
      console.error('Error sending location:', error);
    }
  };

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
        params: { name: destinationName, time: route.time },
      });
    }
  };


  // Keyboard snap behavior event listener
  useEffect(() => {
    // If keyboard is on screen, snap bottom sheet higher
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(3);
    });

    // If keyboard is not on screen, snap bottom sheet back down
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(1);
    });

    // Clean up/remove listeners when component is done
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // When user clicks on POI on map, updates bottom sheet state and snaps bottom sheet higher
  const handlePoiClick = (e) => {
    const { name, coordinate } = e.nativeEvent;
    setSelectedPOI({ name, coordinate });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

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


  // Handles when X is pressed on poi view of bottom sheet. Reverts bottom sheet back to search mode.
  const handleClearPOI = () => {
    setSelectedPOI(null);
    setViewMode('search');
    setDummyRoutes([]); // clear routes
    bottomSheetRef.current?.snapToIndex(1);
  };

  // Prints when the "see building info" button on the bottom sheet search mode is pressed.
  const handleSeeInfo = () => {
    console.log('See Building Info pressed');
  };

  // On poi view, handles when "go now" button is clicked. Brings up dummy routes 
  // and a view of a dummy route rendered on the map
  const handleGoNow = () => {
    setViewMode('directions');
    bottomSheetRef.current?.snapToIndex(2);

    //    // add dummy map routes
    //    const routes = [
    //      [
    //        { latitude: 39.2548, longitude: -76.7097 },
    //        { latitude: 39.255, longitude: -76.709 },
    //        { latitude: 39.2553, longitude: -76.709 },
    //      ],
    //      [
    //        { latitude: 39.2548, longitude: -76.7097 },
    //        { latitude: 39.2549, longitude: -76.7088 },
    //        { latitude: 39.255, longitude: -76.7085 },
    //      ],
    //      [
    //        { latitude: 39.2548, longitude: -76.7097 },
    //        { latitude: 39.2546, longitude: -76.7093 },
    //        { latitude: 39.255, longitude: -76.709 },
    //      ],
    //    ];
    //    setDummyRoutes(routes);
    //
    // Zoom into the route area
    if (mapRef.current && routes.length > 0) {
      const allCoords = routes.flat();
      mapRef.current.fitToCoordinates(allCoords, {
        edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
        animated: true,
      });
    }
  };

  // const fetchRoutes()

  const routes = [
    { id: '1', name: 'Route 1', time: '7 min', distance: '0.5 miles' },
    { id: '2', name: 'Route 2', time: '8 min', distance: '0.55 miles' },
    { id: '3', name: 'Route 3', time: '6 min', distance: '0.45 miles' },
  ];

  // MOST REC 

  useEffect(() => {
    const fetchRoute = async () => {
      if (currentLocation && selectedPOI?.coordinate) {
        console.log("Fetching route from:", currentLocation, "to:", selectedPOI.coordinate);

        const geometry = await getRouteFromHeigit(currentLocation, selectedPOI.coordinate);

        if (geometry) {
          const decoded = decodePolyline(geometry);
          setDummyRoutes([decoded]); // draw the route line on the map

          // Zoom map to show the route nicely
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

  // MOST REC

  // The UI of a react-native app is wrapped in a return statement
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Map */}
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{ // Set to UMBC's campus
              latitude: 39.2548,
              longitude: -76.7097,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            // Handle when a POI on the map is clicked
            onPoiClick={handlePoiClick}
            showsUserLocation={true}
          // followsUserLocation={true} // This makes it so the user location is always focused- don't want this
          >
            {/* 🔹 Render custom POIs from backend */}
            {customPOIs.map(poi => (
              <Marker
                key={poi.id}
                coordinate={{
                  latitude: poi.latitude,
                  longitude: poi.longitude,
                }}
                title={poi.name}
                onPress={() => {
                  setSelectedPOI({
                    name: poi.name,
                    coordinate: {
                      latitude: poi.latitude,
                      longitude: poi.longitude,
                    }
                  });
                  setViewMode('poi');
                  bottomSheetRef.current?.snapToIndex(1);
                }}
              />

            ))}
            {/* Tile overlay using OSM's tile style */}
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />
            {/* Draw dummy routes if in directions mode */}
            {dummyRoutes.map((routeCoords, idx) => (
              <Polyline
                key={idx}
                coordinates={routeCoords}
                strokeColor="#007AFF"
                strokeWidth={4}
              />
            ))}
          </MapView>

          {/* Locate Me Button */}
          <Animated.View style={[styles.locateButton, locateMeStyle]}>
            <TouchableOpacity onPress={handleLocateMe}>
              <Ionicons name="navigate" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>



          {/* Menu Floating Button (top-left) */}
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
                      data={routes}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.routeItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.routeType}>{item.name}</Text>
                            <Text style={styles.routeDetails}>
                              {item.time} • {item.distance}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.routeGoButton}
                            onPress={() => handleRouteGo(item)}
                          >
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
