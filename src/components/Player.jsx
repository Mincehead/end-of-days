import React, { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster } from 'three';
import * as THREE from 'three';
import { useInputStore } from '../store/inputStore';
import { useGameStore } from '../store/gameStore';

export const Player = () => {
    const { camera } = useThree();
    const [ref, api] = useSphere(() => ({
        mass: 60, // Human weight
        type: 'Dynamic',
        position: [0, 10, 0], // Higher spawn to prevent ground clipping
        args: [1],
        fixedRotation: true,
        linearDamping: 0, // No air friction for now
        allowSleep: false
    }));

    // State for velocity
    const velocity = useRef([0, 0, 0]);
    const cameraAngle = useRef(0); // Store Yaw angle independently
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

    // Input - Read directly from store in loop for performance/freshness
    const { actions } = useInputStore(); // Keep actions for useEffects
    const addStructure = useGameStore(state => state.addStructure);
    const isBuildMode = useGameStore(state => state.isBuildMode);
    const selectedBuildItem = useGameStore(state => state.selectedBuildItem);

    // Temp vectors to avoid garbage collection
    const frontVector = useRef(new Vector3());
    const sideVector = useRef(new Vector3());
    const direction = useRef(new Vector3());

    useFrame(() => {
        // Read raw input
        const { move, look, actions } = useInputStore.getState();

        // 1. Camera Input -> Update Angle State
        cameraAngle.current -= look.x * 0.05;

        // 2. ABSOLUTE Movement (Relative to Camera Angle)
        direction.current.set(0, 0, 0);

        if (move.y > 0) direction.current.z -= 1; // W
        if (move.y < 0) direction.current.z += 1; // S
        if (move.x < 0) direction.current.x -= 1; // A
        if (move.x > 0) direction.current.x += 1; // D

        direction.current
            .normalize()
            .multiplyScalar(10) // Speed
            .applyEuler(new THREE.Euler(0, cameraAngle.current, 0, 'YXZ'));

        // Jump
        if (actions.jump && Math.abs(velocity.current[1]) < 0.05) {
            api.velocity.set(direction.current.x, 8, direction.current.z);
        } else {
            api.velocity.set(direction.current.x, velocity.current[1], direction.current.z);
        }

        // Sync Camera (Third Person)
        const playerPos = ref.current.position;
        // Offset: Up 2, Back 4
        const offset = new Vector3(0, 3, 5);
        // Rotate offset by camera's Yaw
        offset.applyAxisAngle(new Vector3(0, 1, 0), cameraAngle.current);

        // precise camera placement
        const camPos = new Vector3().copy(playerPos).add(offset);
        camera.position.lerp(camPos, 0.2); // Smooth follow

        // Look at player
        const target = new Vector3(playerPos.x, playerPos.y + 1, playerPos.z);
        camera.lookAt(target);
    });

    // Handle Actions (Attack / Build / Gather)
    const { scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const rotation = useGameStore(state => state.rotation);
    const rotateStructure = useGameStore(state => state.rotateStructure);

    // Rotate binding
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'r') {
                rotateStructure();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [rotateStructure]);

    useEffect(() => {
        if (actions.attack) {
            console.log("Attack Action Triggered");

            // Raycast from player center forward (using known angle)
            const playerDir = new Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, cameraAngle.current, 0));
            raycaster.current.set(ref.current.position, playerDir);

            // Intersect with everything in scene
            const intersects = raycaster.current.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                // Filter by distance
                const firstHit = intersects.find(hit => hit.distance < 4); // Melee range

                if (firstHit) {
                    // Traverse up to find the interactable object
                    let object = firstHit.object;
                    let foundResource = false;

                    while (object) {
                        if (object.userData && object.userData.type === 'resource') {
                            foundResource = true;
                            break;
                        }
                        object = object.parent;
                    }

                    if (foundResource) {
                        // Collect resource
                        useGameStore.getState().addItem(object.userData.resourceType, 1);
                        console.log("Collected " + object.userData.resourceType);

                        // Hide it
                        object.scale.set(0, 0, 0);
                    }
                }
            }

            // Reset action
            useInputStore.getState().setAction('attack', false);
        }
    }, [actions.attack, camera, scene]);

    // Building - Place item
    useEffect(() => {
        if (actions.build && isBuildMode) {
            // Calculate spawn position in front of player
            const spawnPos = new Vector3(0, 0, -4).applyEuler(new THREE.Euler(0, cameraAngle.current, 0)).add(ref.current.position);
            // Snap to grid-ish
            const snapX = Math.round(spawnPos.x / 2) * 2;
            const snapZ = Math.round(spawnPos.z / 2) * 2;

            addStructure([snapX, 0, snapZ], selectedBuildItem, rotation);
            useInputStore.getState().setAction('build', false);
        }
    }, [actions.build, isBuildMode, selectedBuildItem, camera, addStructure, rotation]);


    return (
        <group ref={ref}>
            {/* Character Mesh */}
            <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
                <capsuleGeometry args={[0.4, 1.8, 4, 16]} />
                <meshStandardMaterial color="#00a8ff" roughness={0.3} />
            </mesh>
            {/* Eyes/Visor to show direction */}
            <mesh position={[0, 1.5, -0.3]}>
                <boxGeometry args={[0.5, 0.2, 0.2]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>
    );
};
