import React, { useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import { ImprovedNoise } from 'three-stdlib';
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
            <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>
    );
};

// Procedural Terrain Decoration (Trees/Rocks)
const Environment = () => {
    const count = 50;

    const trees = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const h = 2 + Math.random() * 3;
            temp.push({ position: [x, h / 2 - 0.5, z], height: h });
        }
        return temp;
    }, []);

    return (
        <group>
            {trees.map((data, i) => (
                <mesh key={i} position={data.position} castShadow receiveShadow>
                    <cylinderGeometry args={[0.2, 0.4, data.height, 8]} />
                    <meshStandardMaterial color="#3d2817" />
                </mesh>
            ))}
        </group>
    );
};

// Collectible Resources
const Resources = () => {
    const addStructure = useGameStore(state => state.addStructure); // Just to verify store access

    // Static list of resources for now
    const resources = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            temp.push({ id: i, position: [x, 0.5, z], type: 'scrap' });
        }
        return temp;
    }, []);

    return (
        <group>
            {resources.map((res) => (
                <mesh key={res.id} position={res.position} userData={{ type: 'resource', resourceType: 'wood' }} castShadow>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#8b5a2b" />
                </mesh>
            ))}
        </group>
    );
};

// Ghost Building Visualization
const BuildingGhosts = () => {
    const structures = useGameStore(state => state.structures);

    return (
        <group>
            {structures.map((s) => (
                <mesh key={s.id} position={s.position}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={s.type === 'shelter' ? 'orange' : 'red'} />
                </mesh>
            ))}
        </group>
    )
}

export const World = () => {
    return (
        <group>
            <Ground />
            <Environment />
            <Resources />
            <BuildingGhosts />
            {/* Spawn a few enemies */}
            <Enemy position={[10, 2, 10]} />
            <Enemy position={[-15, 2, -15]} />
        </group>
    );
};
