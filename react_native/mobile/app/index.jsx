import { useRef } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';

const { height: screenHeight } = Dimensions.get('window');

export default function App() {
  const modalRef = useRef(null);

  const handleFocus = () => {
    // Expand the bottom sheet when search bar is focused
    if (modalRef.current) {
      modalRef.current.open();
    }
  };

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 39.2548,
          longitude: -76.7097,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
      </MapView>

      {/* Bottom Sheet */}
      <Modalize
        ref={modalRef}
        alwaysOpen={150}                       // Small default height
        modalHeight={screenHeight * 0.7}       // Taller than keyboard
        withOverlay={false}                     // Background doesn't dim
        handleStyle={{ height: 0 }}
        adjustToContentHeight={false}
        keyboardAvoidingBehavior="none"        // Prevent shrinking
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.sheetContent}>
            {/* Small handle inside */}
            <View style={styles.handleInside} />

            {/* Title */}
            <Text style={styles.sheetTitle}>Search for Buildings</Text>

            {/* Search bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Enter building name..."
              placeholderTextColor="#888"
              onFocus={handleFocus}   // Expand sheet on focus
            />
          </View>
        </KeyboardAvoidingView>
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  handleInside: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    marginBottom: 15,
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
});
