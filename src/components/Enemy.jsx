import React, { useRef, useState } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';

export const Enemy = ({ position = [10, 2, 10] }) => {
    const { scene } = useThree();
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position: position,
        args: [1],
        type: 'Dynamic'
    }));

    // Local state for basic AI
    const playerPos = useRef(new Vector3(0, 0, 0));
    const enemyPos = useRef(new Vector3(...position));

    // Hook into store to damage player
    const takeDamage = useGameStore(state => state.takeDamage);

    // Track position
    useFrame(({ camera }) => {
        // Get Player Position (camera)
        playerPos.current.copy(camera.position); // Approximation since camera is attached to player capsule

        // Get Enemy Position
        const currentPos = ref.current.position;
        const eVec = new Vector3(currentPos.x, currentPos.y, currentPos.z);

        // Direction to Player
        const dir = new Vector3().subVectors(playerPos.current, eVec);
        const dist = dir.length();

        // Chase Logic
        if (dist < 20 && dist > 1.5) { // Acquire target range
            dir.normalize().multiplyScalar(3); // Speed
            api.velocity.set(dir.x, -5, dir.z); // -5 for gravity
        } else {
            api.velocity.set(0, -5, 0); // Idle
        }

        // Attack Logic
        if (dist < 1.5) {
            // Simple cooldown could be added here
            if (Math.random() > 0.95) { // 5% chance per frame (approx 3 hits/sec)
                takeDamage(5);
                console.log("Player bit!");
            }
        }
    });

    return (
        <mesh ref={ref} castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="red" roughness={0.5} />
        </mesh>
    );
};
