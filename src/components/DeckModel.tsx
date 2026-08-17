import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  DEFAULT_DECK,
  buildDeckBodyGeometry,
  buildDeckCapGeometry,
} from "../utils/deckGeometry";
import {
  buildGriptapeTexture,
  buildBottomGraphicTexture,
  buildWoodTexture,
} from "../utils/textures";

interface DeckModelProps {
  spinning: boolean;
  spinSpeed?: number;
}

export function DeckModel({ spinning, spinSpeed = 0.2 }: DeckModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef(0);

  const bodyGeometry = useMemo(() => buildDeckBodyGeometry(DEFAULT_DECK), []);
  const gripGeometry = useMemo(
    () => buildDeckCapGeometry(DEFAULT_DECK, "top"),
    []
  );
  const graphicGeometry = useMemo(
    () => buildDeckCapGeometry(DEFAULT_DECK, "bottom"),
    []
  );

  const woodTexture = useMemo(() => buildWoodTexture(), []);
  const gripTexture = useMemo(() => buildGriptapeTexture(), []);
  const graphicTexture = useMemo(() => buildBottomGraphicTexture(), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (spinning) {
      groupRef.current.rotation.y += delta * spinSpeed;
    }
    bobRef.current += delta;
    groupRef.current.position.y = Math.sin(bobRef.current * 0.9) * 0.12;
  });

  return (
    <group ref={groupRef} rotation={[0.32, 0, 0]}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.57}
          metalness={0.02}
        />
      </mesh>
      <mesh geometry={gripGeometry} castShadow>
        <meshStandardMaterial
          map={gripTexture}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <mesh geometry={graphicGeometry} castShadow>
        <meshStandardMaterial
          map={graphicTexture}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
