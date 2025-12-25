import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars } from '@react-three/drei';
import { World } from './components/World';
import { Player } from './components/Player';
import { UI } from './components/UI';
import { useGameStore } from './store/gameStore';
import { KeyboardControls } from './components/KeyboardControls';

import { LightingController } from './components/LightingController';

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
        <LightingController />

        <GameLoop />
        <KeyboardControls />

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
