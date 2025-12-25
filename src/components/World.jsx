import React, { useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { Enemy } from './Enemy';

// Simple Ground
const Ground = () => {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -0.5, 0],
        material: 'ground'
    }));

    return (
        <mesh ref={ref} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#555555" roughness={0.8} />
        </mesh>
    );
};

// Procedural Trees
const Trees = () => {
    const count = 30;
    const trees = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const h = 8 + Math.random() * 8;
            temp.push({ position: [x, h / 2, z], height: h });
        }
        return temp;
    }, []);

    return (
        <group>
            {trees.map((data, i) => (
                <group key={i} position={data.position}>
                    {/* Trunk */}
                    <mesh position={[0, -data.height / 4, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.3, data.height / 2, 6]} />
                        <meshStandardMaterial color="#4d3319" />
                    </mesh>
                    {/* Leaves */}
                    <mesh position={[0, data.height / 4, 0]} castShadow receiveShadow>
                        <coneGeometry args={[1.2, data.height * 0.8, 8]} />
                        <meshStandardMaterial color="#2d4c1e" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// Generic Collectable Item
const Collectable = ({ type, position }) => {
    let color = 'white';
    if (type === 'tree') color = '#2d4c1e'; // Shouldn't happen if trees are separate, but fallback
    if (type === 'rock') color = '#888';
    if (type === 'scrap') color = '#cd7f32';

    return (
        <mesh position={position} userData={{ type: 'resource', resourceType: type === 'rock' ? 'stone' : (type === 'tree' ? 'wood' : 'scrap') }} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

// Procedural Object Spawner (Rocks, Scrap)
const ObjectSpawner = () => {
    const items = useMemo(() => {
        const temp = [];
        // Rocks
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            temp.push({ id: `rock-${i}`, type: 'rock', position: [x, 0.5, z] });
        }
        // Scrap
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            temp.push({ id: `scrap-${i}`, type: 'scrap', position: [x, 0.5, z] });
        }
        return temp;
    }, []);

    return (
        <group>
            {items.map((item) => (
                <Collectable key={item.id} type={item.type} position={item.position} />
            ))}
        </group>
    );
};

// Placed Structures
const Structures = () => {
    const structures = useGameStore(state => state.structures);

    return (
        <group>
            {structures.map((s) => {
                // Simple primitives for structures
                if (s.type === 'wall') {
                    return (
                        <mesh key={s.id} position={[s.position[0], s.position[1] + 2, s.position[2]]} rotation={[0, s.rotation, 0]} castShadow receiveShadow>
                            <boxGeometry args={[4, 4, 0.2]} />
                            <meshStandardMaterial color="#8d6e63" />
                        </mesh>
                    );
                } else if (s.type === 'floor') {
                    return (
                        <mesh key={s.id} position={[s.position[0], s.position[1] + 0.1, s.position[2]]} rotation={[0, s.rotation, 0]} receiveShadow>
                            <boxGeometry args={[4, 0.2, 4]} />
                            <meshStandardMaterial color="#5d4037" />
                        </mesh>
                    );
                } else if (s.type === 'ramp') {
                    return (
                        <mesh key={s.id} position={[s.position[0], s.position[1] + 1, s.position[2]]} rotation={[Math.PI / 8, s.rotation, 0]} castShadow receiveShadow>
                            <boxGeometry args={[4, 0.2, 5]} />
                            <meshStandardMaterial color="#6d4c41" />
                        </mesh>
                    );
                } else {
                    // Default Shelter/Box
                    return (
                        <mesh key={s.id} position={s.position}>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshStandardMaterial color="orange" />
                        </mesh>
                    )
                }
            })}
        </group>
    )
}

export const World = () => {
    return (
        <group>
            <Ground />
            <Trees />
            <ObjectSpawner />
            <Structures />
            {/* Spawn a few enemies */}
            <Enemy position={[10, 2, 10]} />
            <Enemy position={[-15, 2, -15]} />
        </group>
    );
};
