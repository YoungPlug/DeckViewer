import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Html,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DeckModel } from "./DeckModel";

export function DeckViewer() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [spinning, setSpinning] = useState(true);

  return (
    <div
      className="deck-viewer"
      onPointerDown={() => setSpinning(false)}
      onPointerUp={() => setSpinning(true)}
      onPointerLeave={() => setSpinning(true)}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.4, 13], fov: 75 }}
      >
        <color attach="background" args={["#17181a"]} />
        <fog attach="fog" args={["#17181a", 16, 30]} />

        <ambientLight intensity={0.35} />
        <spotLight
          position={[6, 9, 6]}
          angle={0.35}
          penumbra={0.6}
          intensity={2.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#fff6e0"
        />
        <spotLight
          position={[-7, 5, -4]}
          angle={0.5}
          penumbra={0.9}
          intensity={0.6}
          color="#f5c518"
        />

        <Suspense fallback={<Html center className="loading-pill">loading deck…</Html>}>
          <DeckModel spinning={spinning} />
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>

        <ContactShadows
          position={[0, -2.05, 0]}
          opacity={0.55}
          scale={20}
          blur={2.4}
          far={4}
          color="#000000"
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2.06, 0]}
          receiveShadow
        >
          <circleGeometry args={[13, 64]} />
          <meshStandardMaterial color="#1f2023" roughness={1} />
        </mesh>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={6.5}
          maxDistance={19}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={false}
          zoomSpeed={0.65}
        />
      </Canvas>

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-hint-line" />
        <span>scroll to zoom · drag to rotate</span>
      </div>
    </div>
  );
}
