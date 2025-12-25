import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';

export const LightingController = () => {
    const time = useGameStore(state => state.time);

    // Refs for lights to update intensity without re-rendering everything
    const ambientRef = useRef();
    const sunRef = useRef();
    const fogRef = useRef();

    // Calculate Sun Position based on time (0-24)
    // 6am (6) = Rise, 12pm (12) = Zenith, 6pm (18) = Set
    // Simple mapping: 
    // Theta (elevation): 0-PI. 6->0, 12->PI/2, 18->PI
    // Phi (azimuth): Rotation around Y
    const sunPosition = [
        Math.sin((time - 6) / 12 * Math.PI) * 100, // X: East-West motion
        Math.sin((time - 6) / 12 * Math.PI) * 50,  // Y: Height (Max 50)
        Math.cos((time - 6) / 12 * Math.PI) * 50   // Z: Slight arc
    ];

    // Determine Day/Night status
    const isDay = time > 5 && time < 19;

    // Intensity Logic
    let sunIntensity = 0;
    let ambientIntensity = 0.1;
    let fogColor = new THREE.Color('#050505');

    if (isDay) {
        // Peak at noon (12)
        const dayProgress = Math.min(1, Math.max(0, Math.sin((time - 6) / 13 * Math.PI)));
        sunIntensity = dayProgress * 1.5;
        ambientIntensity = 0.2 + dayProgress * 0.6; // Max 0.8

        // Fog Color Interpolation (Black -> White -> Black)
        fogColor.setHSL(0, 0, dayProgress * 0.5); // Grey-ish white
    }

    return (
        <group>
            <ambientLight intensity={ambientIntensity} />
            <directionalLight
                position={sunPosition}
                intensity={sunIntensity}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Sky (Day) */}
            <Sky
                sunPosition={sunPosition}
                turbidity={time < 8 || time > 17 ? 10 : 2} // Hazy at dawn/dusk
                rayleigh={time < 8 || time > 17 ? 0.5 : 2}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
            />

            {/* Stars (Night) */}
            {!isDay && (
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            )}

            {/* Dynamic Fog */}
            <primitive object={new THREE.Fog(fogColor, 0, 60)} attach="fog" />
        </group>
    );
};
