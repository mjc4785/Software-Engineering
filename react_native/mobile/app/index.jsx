import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import MapView, { UrlTile } from 'react-native-maps';
import { Host, Portal } from 'react-native-portalize';

export default function App() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);
  const [selectedPOI, setSelectedPOI] = useState(null);

  // Automatically expand/retract bottom sheet when keyboard appears/disappears
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(3); // 95%
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(1); // 50%
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handlePoiClick = (e) => {
    const { name, coordinate } = e.nativeEvent;
    setSelectedPOI({ name, coordinate });
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleAddDummyPOI = () => {
    setSelectedPOI({
      name: 'Engineering Hall',
      coordinate: { latitude: 39.255, longitude: -76.709 },
    });
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleClearPOI = () => {
    setSelectedPOI(null);
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Map */}
        <View style={styles.container}>
          <MapView
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
          </MapView>

          {/* Floating button */}
          <TouchableOpacity
            style={styles.button}
            onPress={selectedPOI ? handleClearPOI : handleAddDummyPOI}
          >
            <Text style={styles.buttonText}>
              {selectedPOI ? 'Clear POI' : 'Add Dummy POI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={1} // start at mid height
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
                <Text style={styles.sheetTitle}>Building Info</Text>

                {/* Conditionally render either search or POI info */}
                {selectedPOI ? (
                  <View style={styles.poiContainer}>
                    <Text style={styles.poiLabel}>Selected POI:</Text>
                    <Text style={styles.poiName}>{selectedPOI.name}</Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a building..."
                    placeholderTextColor="#999"
                  />
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
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  poiContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  poiLabel: {
    fontSize: 14,
    color: '#666',
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
