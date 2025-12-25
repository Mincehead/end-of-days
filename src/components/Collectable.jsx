import React from 'react';

const Tree = () => (
    <group>
        {/* Trunk */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
            <meshStandardMaterial color="#5c4033" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.2, 2, 8]} />
            <meshStandardMaterial color="#2d5a27" />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
            <coneGeometry args={[1, 1.5, 8]} />
            <meshStandardMaterial color="#3a7a34" />
        </mesh>
    </group>
);

const Rock = () => (
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
    </mesh>
);

const Scrap = () => (
    <group rotation={[0, Math.random() * Math.PI, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#8b4513" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.2, 0.1, 0.2]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.6]} />
            <meshStandardMaterial color="#555" />
        </mesh>
    </group>
);

export const Collectable = ({ type, position }) => {
    // userData is used for raycasting detection
    let resourceType = 'wood';
    if (type === 'rock') resourceType = 'stone';
    if (type === 'scrap') resourceType = 'scrap';

    return (
        <group position={position} userData={{ type: 'resource', resourceType }}>
            {/* Hitbox phantom mesh for easier raycasting targeting */}
            <mesh visible={false} userData={{ type: 'resource', resourceType }}>
                <capsuleGeometry args={[0.5, 4, 4]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>

            <group userData={{ type: 'resource', resourceType }}> {/* Wrap visual in group that also has userdata so clicks work on children */}
                {type === 'tree' && <Tree />}
                {type === 'rock' && <Rock />}
                {type === 'scrap' && <Scrap />}
            </group>
        </group>
    );
};
