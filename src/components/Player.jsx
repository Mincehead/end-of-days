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
        position: [0, 5, 0],
        args: [1],
        fixedRotation: true,
        linearDamping: 0.95 // Air resistance/friction substitute to stop sliding
    }));

    // State for velocity
    const velocity = useRef([0, 0, 0]);
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
        const { move, look } = useInputStore.getState();

        // 1. Camera Look (Mobile Joystick - look.x rotates Y, look.y rotates X)
        // Adjust sensitivity as needed
        camera.rotation.y -= look.x * 0.05;
        camera.rotation.x -= look.y * 0.05;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        // 2. Movement
        frontVector.current.set(0, 0, -move.y); // Forward/Back
        sideVector.current.set(-move.x, 0, 0);  // Left/Right (Inverted x for correct strafing)

        direction.current
            .subVectors(frontVector.current, sideVector.current)
            .normalize()
            .multiplyScalar(10) // Speed bumped to 10
            .applyEuler(new THREE.Euler(0, camera.rotation.y, 0, 'YXZ'));

        api.velocity.set(direction.current.x, velocity.current[1], direction.current.z);

        // Sync Camera Position to Physics Body
        camera.position.copy(ref.current.position);
        camera.position.y += 1.5; // Eye height
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

            // Raycast from camera center
            raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);

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
            const spawnPos = new Vector3(0, 0, -4).applyEuler(camera.rotation).add(camera.position); // Further out
            // Snap to grid-ish
            const snapX = Math.round(spawnPos.x / 2) * 2;
            const snapZ = Math.round(spawnPos.z / 2) * 2;

            addStructure([snapX, 0, snapZ], selectedBuildItem, rotation);
            useInputStore.getState().setAction('build', false);
        }
    }, [actions.build, isBuildMode, selectedBuildItem, camera, addStructure, rotation]);


    return (
        <mesh ref={ref} />
    );
};
