import BottomSheet from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Map - Stays in the background */}
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

        {/* Bottom Sheet - Add zIndex to bring it to the front */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          style={{ zIndex: 1 }} // 👈 ADD THIS STYLE
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Search for Buildings</Text>
            {/* You can add a search bar or list here */}
          </View>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ... styles remain the same

// Home.jsx

// ... (rest of your component)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 👈 ADD THIS LINE
    // It anchors absolute children (like the map and sheet) to this parent
    position: 'relative',
  },
  sheetContent: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
