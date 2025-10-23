/*
index.jsx
Description: This is the default screen when the user opens the app, 
              shows the map canvas and a search bar.
*/

// Imports
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'; // Bottom sheet/sliding panel UI library
import { useRouter } from 'expo-router'; // Directory based routing
import { useEffect, useMemo, useRef, useState } from 'react'; // React hooks
import {
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
} from 'react-native'; // Native UI libraries

// Enables/is requirement for @gorhom/bottom-sheet.
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Enables enhanced gesture swiping.

import MapView, { Polyline, UrlTile } from 'react-native-maps'; // For tile overlay, map components, current location dot, and drawing route lines
import { Host, Portal } from 'react-native-portalize'; // Allows BottomSheet to sit on top of MapView

// Imports
import * as Location from 'expo-location'; // For location tracking

// Main React component
export default function App() {

  // Make references to bottom sheet and map to... reference later
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  // Define snap points for bottom sheet
  // useMemo (memoize) is used so the array isn't recalculated every render
  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);

  // Set some component states
  const [selectedPOI, setSelectedPOI] = useState(null); // what POI is selected
  const [viewMode, setViewMode] = useState('search'); // viewMode dictates what the bottom sheet shows.
  const [dummyRoutes, setDummyRoutes] = useState([]); // Lines on map for dummy POI
  const [currentLocation, setCurrentLocation] = useState(null);     // State for tracking user's current location
  const [location, setLocation] = useState(null); // Start location (not necessarily the user's current location but can be)


  // hook to navigate between screens
  const router = useRouter();


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


  // Handles user pressing "GO" on a route
  const handleRouteGo = (route, skipSteps = false) => {
    if (!selectedPOI) return;

    const destinationName = selectedPOI.name; // Use the POI's name

    if (skipSteps) {
      router.push({
        pathname: '/DestinationReached',
        params: { name: destinationName, time: route.time },
      });
    } else {
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
      bottomSheetRef.current?.snapToIndex(3); // Snaps higher
    });

    // If keyboard is not on screen, snap bottom sheet back down
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(1); // Snap lower
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

  // Same behavior as above but for a dummy POI
  const handleAddDummyPOI = () => {
    setSelectedPOI({
      name: 'Engineering Building',
      coordinate: { latitude: 39.255, longitude: -76.709 },
    });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

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
  const handleGoNow = async () => {
    setViewMode('directions');
    bottomSheetRef.current?.snapToIndex(2);

    //  Get and send user’s current location to backend when "Go Now" is pressed
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to send data.');
        return;
      }

      //  Get current position
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Send location to backend
      await sendLocationToBackend({ latitude, longitude });

    } catch (error) {
      console.error(' Error sending location on Go Now:', error);
    }

    // add dummy map routes
    const routes = [
      [
        { latitude: 39.2548, longitude: -76.7097 },
        { latitude: 39.255, longitude: -76.709 },
        { latitude: 39.2553, longitude: -76.709 },
      ],
      [
        { latitude: 39.2548, longitude: -76.7097 },
        { latitude: 39.2549, longitude: -76.7088 },
        { latitude: 39.255, longitude: -76.7085 },
      ],
      [
        { latitude: 39.2548, longitude: -76.7097 },
        { latitude: 39.2546, longitude: -76.7093 },
        { latitude: 39.255, longitude: -76.709 },
      ],
    ];
    setDummyRoutes(routes);

    // Zoom into the route area
    if (mapRef.current && routes.length > 0) {
      const allCoords = routes.flat();
      mapRef.current.fitToCoordinates(allCoords, {
        edgePadding: { top: 80, right: 40, bottom: 400, left: 40 },
        animated: true,
      });
    }
  };


  const routes = [
    { id: '1', name: 'Route 1', time: '7 min', distance: '0.5 miles' },
    { id: '2', name: 'Route 2', time: '8 min', distance: '0.55 miles' },
    { id: '3', name: 'Route 3', time: '6 min', distance: '0.45 miles' },
  ];

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
            showsUserLocation={true} // Enables user current location blue dot
          // followsUserLocation={true} // Blue dot updates while user moves => This constantly centers user location though

          >

            {/* Tile overlay using OSM's tile style */}
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />




            {/* Draw dummy routes if in directions mode */}
            {viewMode === 'directions' &&
              dummyRoutes.map((routeCoords, idx) => (
                <Polyline
                  key={idx}
                  coordinates={routeCoords}
                  strokeColor="#007AFF"
                  strokeWidth={4}
                />
              ))}
          </MapView>
          {/* Blue button for current location tracking */}
          <TouchableOpacity
            style={styles.locateButton}
            onPress={handleLocateMe}
          >
            <Text style={styles.locateButtonText}>My Location</Text>
          </TouchableOpacity>

          {/* Add Dummy POI / Clear Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={selectedPOI ? handleClearPOI : handleAddDummyPOI}
          >
            <Text style={styles.buttonText}>
              {selectedPOI ? 'Clear POI' : 'Add Dummy POI'}
            </Text>
          </TouchableOpacity>

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
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Where to?"
                      placeholderTextColor="#999"
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
  // Styling for current location button
  locateButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    elevation: 4,
  },
  locateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

});