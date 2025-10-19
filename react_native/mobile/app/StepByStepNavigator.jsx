/*
StepByStepNavigator.jsx
Description: This page shows the step-by-step directions shown while a user follows a route.
*/

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function NavigationScreen() {
    const router = useRouter();
    const { name, time } = useLocalSearchParams();

    const steps = [
        { id: 1, text: 'Head north on Main Walkway', distance: '100m' },
        { id: 2, text: 'Turn right at Library Lawn', distance: '200m' },
        { id: 3, text: 'Continue straight for 200m', distance: '200m' },
        { id: 4, text: 'Destination will be on your left', distance: '50m' },
    ];

    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push({
                pathname: '/DestinationReached',
                params: { name, time },
            });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                {/* Instruction panel at the top */}
                <View style={styles.instructionPanel}>
                    <Text style={styles.stepDistance}>{steps[currentStep].distance}</Text>
                    <Text style={styles.stepText}>{steps[currentStep].text}</Text>
                    <Text style={styles.stepCount}>
                        Step {currentStep + 1} of {steps.length}
                    </Text>

                    <View style={styles.navigationButtons}>
                        <TouchableOpacity
                            style={[styles.arrowButton, currentStep === 0 && styles.disabledButton]}
                            onPress={handleBack}
                            disabled={currentStep === 0}
                        >
                            <Text style={styles.arrowText}>←</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
                            <Text style={styles.arrowText}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Destination info */}
                <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{name}</Text>
                    <Text style={styles.destinationTime}>ETA: {time}</Text>
                </View>

                {/* Exit navigation */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Exit Navigation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#e0f7fa' }, // fills status bar area
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 0 },

    instructionPanel: {
        backgroundColor: '#e0f7fa', // panel color
        borderRadius: 0,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
        marginTop: 0,
        // Remove shadow:
        shadowColor: undefined,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        elevation: 0,
    },


    stepDistance: { color: '#007AFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    stepText: { color: '#333', fontSize: 16, fontWeight: '600', textAlign: 'center' },
    stepCount: { color: '#666', fontSize: 12, marginTop: 2, marginBottom: 8 },

    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '50%' },
    arrowButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#ccc' },
    arrowText: { color: '#fff', fontSize: 20, fontWeight: '700' },

    destinationInfo: { position: 'absolute', bottom: 120, left: 0, right: 0, alignItems: 'center' },
    destinationName: { color: '#333', fontSize: 18, fontWeight: '600' },
    destinationTime: { color: '#555', fontSize: 16, marginTop: 4 },

    backButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#ff453a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
