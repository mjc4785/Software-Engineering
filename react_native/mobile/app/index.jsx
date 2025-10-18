import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Polyline, UrlTile } from 'react-native-maps';
import { Host, Portal } from 'react-native-portalize';

export default function App() {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [viewMode, setViewMode] = useState('search'); // "search", "poi", "directions"
  const [dummyRoutes, setDummyRoutes] = useState([]); // lines on map

  const router = useRouter();

  // ✅ UPDATED: Pass selectedPOI.name for the destination name
  const handleRouteGo = (route, skipSteps = false) => {
    if (!selectedPOI) return;

    const destinationName = selectedPOI.name; // Use the POI's name

    if (skipSteps) {
      router.push({
        pathname: '/destination',
        params: { name: destinationName, time: route.time },
      });
    } else {
      router.push({
        pathname: '/navigation',
        params: { name: destinationName, time: route.time },
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

  const handlePoiClick = (e) => {
    const { name, coordinate } = e.nativeEvent;
    setSelectedPOI({ name, coordinate });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleAddDummyPOI = () => {
    setSelectedPOI({
      name: 'Engineering Hall',
      coordinate: { latitude: 39.255, longitude: -76.709 },
    });
    setViewMode('poi');
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleClearPOI = () => {
    setSelectedPOI(null);
    setViewMode('search');
    setDummyRoutes([]); // clear routes
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleSeeInfo = () => {
    console.log('See Building Info pressed');
  };

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

  // ✅ This function is no longer needed since handleRouteGo handles the logic
  // const handleStartNavigation = (route) => {
  //   router.push({
  //     pathname: '/navigation',
  //     params: { name: route.name, time: route.time },
  //   });
  // };

  const routes = [
    { id: '1', name: 'Route 1', time: '7 min', distance: '0.5 miles' },
    { id: '2', name: 'Route 2', time: '8 min', distance: '0.55 miles' },
    { id: '3', name: 'Route 3', time: '6 min', distance: '0.45 miles' },
  ];

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
              longitudeDelta: 0.01,
            }}
            onPoiClick={handlePoiClick}
          >
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

          {/* Menu Button (top-left) */}
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
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <BottomSheetView style={styles.sheetContent}>
                {(viewMode === 'poi' || viewMode === 'directions') && (
                  <TouchableOpacity style={styles.closeButton} onPress={handleClearPOI}>
                    <View style={styles.closeCircle}>
                      <Text style={styles.closeButtonText}>×</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {viewMode === 'search' && (
                  <>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Where to?"
                      placeholderTextColor="#999"
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
                        <TouchableOpacity
                          style={[styles.actionButton, styles.infoButton]}
                          onPress={handleSeeInfo}
                        >
                          <Text style={[styles.actionButtonText, { color: '#000' }]}>
                            See Building Info
                          </Text>
                        </TouchableOpacity>

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