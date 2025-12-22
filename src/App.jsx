import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars } from '@react-three/drei';
import { World } from './components/World';
import { Player } from './components/Player';
import { UI } from './components/UI';
import { useGameStore } from './store/gameStore';

const GameLoop = () => {
  const tick = useGameStore(state => state.tick);
  useFrame(() => {
    tick();
  });
  return null;
};

function App() {
  return (
    <>
      <Canvas shadows camera={{ fov: 60 }}>
        <Sky sunPosition={[0, 0, -1]} turbidity={20} rayleigh={2} mieCoefficient={0.05} mieDirectionalG={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.05} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />

        {/* Spooky Fog */}
        <fog attach="fog" args={['#050505', 0, 15]} />

        <GameLoop />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <World />
          </Physics>
        </Suspense>
      </Canvas>
      <UI />
    </>
  );
}

export default App;
