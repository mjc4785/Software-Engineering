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

import MapView, { Polyline, UrlTile, Marker } from 'react-native-maps'; // For tile overlay map components and drawing route lines
import { Host, Portal } from 'react-native-portalize'; // Allows BottomSheet to sit on top of MapView

// Routing API key 
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJmM2NiNzU0ZjQ4NTQxYmJiODNmMTE0OTU4ZTdlODY0IiwiaCI6Im11cm11cjY0In0=";

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
  const [inputText, setInputText] = useState("")
  const [searchResults, setSearchResults] = useState([])

  // hook to navigate between screens
  const router = useRouter();

  // Fetch matching locations from OpenStreetMap (Nominatim)
  const searchPlaces = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
      // console.log(response)
    } catch (error) {
      console.error("Error fetching search results:", error);
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
  const handleGoNow = () => {
    setViewMode('directions');
    bottomSheetRef.current?.snapToIndex(2);

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

  // const fetchRoutes()

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
		      onChangeText={(text) => {
		        setInputText(text);
		        searchPlaces(text); // Trigger search as user types
		      }}
		      value={inputText}
		      placeholder="Where would you like to go?"
		      placeholderTextColor="#999"
		    />
		    <Text>Current input: {inputText}</Text>
		
		    <FlatList
		      data={searchResults}
		      keyExtractor={(item) => item.place_id.toString()}
		      renderItem={({ item }) => (
		        <TouchableOpacity
		          style={{
		            paddingVertical: 10,
		            borderBottomWidth: 1,
		            borderBottomColor: "#eee",
		          }}
		          onPress={() => {
		            const coordinate = {
		              latitude: parseFloat(item.lat),
		              longitude: parseFloat(item.lon),
		            };
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
});
