// components/HeadingPuckWrapper.jsx
import React from 'react';
import { Marker } from 'react-native-maps';
import HeadingPuck from './HeadingPuck';

export default function HeadingPuckWrapper({ coordinate, heading }) {
    if (!coordinate) return null;

    return (
        <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} flat>
            <HeadingPuck coordinate={coordinate} heading={heading} />
        </Marker>
    );
}
