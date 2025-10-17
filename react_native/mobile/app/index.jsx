import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { UrlTile } from 'react-native-maps';
import { Host, Portal } from 'react-native-portalize';

export default function App() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['20%', '50%', '80%', '95%'], []);

  useEffect(() => {
    // expand when keyboard appears
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(3); // 80%
    });

    // retract when keyboard hides
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(2); // 50%
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />
          </MapView>
        </View>

        {/* Bottom sheet */}
        <Portal>
          <BottomSheet
            ref={bottomSheetRef}
            index={1} // start at 50%
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
                <Text style={styles.sheetTitle}>Search for Buildings</Text>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter place on UMBC campus..."
                  placeholderTextColor="#999"
                />
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
  handleInside: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 10,
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
});
