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

    // Input
    const { move, look, actions } = useInputStore();
    const addStructure = useGameStore(state => state.addStructure);
    const isBuildMode = useGameStore(state => state.isBuildMode);
    const selectedBuildItem = useGameStore(state => state.selectedBuildItem);

    useFrame(() => {
        // 1. Camera Look (Mobile Joystick - look.x rotates Y, look.y rotates X) -- Simple Implementation
        // For a proper FPP, we usually rotate the camera or the player.
        // Here we'll rotate the camera for 'look' and apply velocity relative to camera direction.

        // Rotate camera based on look input
        // Scaling sensitivity
        camera.rotation.y -= look.x * 0.05;
        camera.rotation.x -= look.y * 0.05;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        // 2. Movement
        // Calculate forward/right vectors relative to camera
        const frontVector = new Vector3(0, 0, 0);
        const sideVector = new Vector3(0, 0, 0);
        const direction = new Vector3();

        // Mapping joystick Y to forward/backward (inverted usually, but depends on lib)
        frontVector.set(0, 0, -move.y);
        sideVector.set(move.x, 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(8); // Increased Speed

        // Apply only Y rotation (Yaw) to movement so looking down doesn't push us into the ground
        const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
        direction.applyEuler(euler);

        api.velocity.set(direction.x, velocity.current[1], direction.z);

        // Sync Camera Position to Physics Body
        camera.position.copy(ref.current.position);
        camera.position.y += 1.5; // Eye height
    });

    // Handle Actions (Attack / Build / Gather)
    const { scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());

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
                    const object = firstHit.object;
                    console.log("Hit:", object.userData);

                    if (object.userData.type === 'resource') {
                        // Collect resource
                        useGameStore.getState().addItem(object.userData.resourceType, 1);
                        console.log("Collected " + object.userData.resourceType);
                        // In a real game, we'd remove the object. 
                        // For now, let's just scale it down to 0 to "hide" it (hacky but works for boilerplate)
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
            const spawnPos = new Vector3(0, 0, -3).applyEuler(camera.rotation).add(camera.position);
            // Snap to ground (simple Y fix for now)
            spawnPos.y = 0.5;

            addStructure([spawnPos.x, spawnPos.y, spawnPos.z], selectedBuildItem);
            useInputStore.getState().setAction('build', false);
        }
    }, [actions.build, isBuildMode, selectedBuildItem, camera, addStructure]);


    return (
        <mesh ref={ref} />
    );
};
