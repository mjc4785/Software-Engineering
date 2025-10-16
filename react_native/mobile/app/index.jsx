import BottomSheet from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

export default function Home() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 39.2548,
          longitude: -76.7097,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      // No provider: this will just render a blank map behind your tiles
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
      </MapView>

      {/* Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Search for Buildings</Text>
          {/* Add search bar or building list here */}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
