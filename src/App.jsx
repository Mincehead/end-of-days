import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars } from '@react-three/drei';
import { World } from './components/World';
import { Player } from './components/Player';
import { UI } from './components/UI';

function App() {
  return (
    <>
      <Canvas shadows camera={{ fov: 50 }}>
        <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.5} mieCoefficient={0.005} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.2} />
        <pointLight position={[100, 100, 100]} intensity={0.8} castShadow />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#202020', 5, 30]} />

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
