import { ComponentProps, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { PerspectiveCamera, SpotLight } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import { PosterizationEffect } from "./PosterizationEffect";

function Box(props: ComponentProps<"mesh">) {
  const ref = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  useFrame((_, delta) => (ref.current.rotation.y += delta));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas shadows style={{ height: "100dvh" }}>
      <color attach="background" args={["#d8e7ff"]} />
      <ambientLight intensity={Math.PI / 2} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0.8, 5]}
        rotation-x={-Math.PI / 20}
      />
      <SpotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
        distance={50}
        castShadow
      />
      <Ground />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
      <EffectComposer>
        <PosterizationEffect steps={10} />
      </EffectComposer>
    </Canvas>
  );
}

export default App;
