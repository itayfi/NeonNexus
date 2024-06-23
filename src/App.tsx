import { ComponentProps, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, Group, Mesh } from "three";
import {
  Clone,
  Outlines,
  PerspectiveCamera,
  PointerLockControls,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import { PosterizationEffect } from "./PosterizationEffect";
import carModel from "./assets/car.glb?url";

function Ground() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
        <planeGeometry args={[100, 200]} />
        <meshStandardMaterial color="navy" />
      </mesh>
      <mesh position={[22, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[40, 0.25, 200]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[-22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[40, 0.25, 200]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
}

function Car({
  axis = "x",
  speed = 0.1,
  start = -50,
  end = 50,
  color,
  ...props
}: {
  axis?: "x" | "y" | "z";
  speed?: number;
  start?: number;
  end?: number;
  color: Color;
} & ComponentProps<"mesh">) {
  const { nodes } = useGLTF(carModel);
  const carRef = useRef<Mesh | Group>(null!);

  useFrame(() => {
    if (carRef.current.position[axis] < end) {
      carRef.current.position[axis] += speed;
    } else {
      carRef.current.position[axis] = start;
    }
  });

  return (
    // @ts-expect-error
    <Clone object={nodes.Cube} ref={carRef} castShadow {...props}>
      <meshStandardMaterial color={color} />
      <Outlines color="black" thickness={0.02} />
    </Clone>
  );
}

function Cars({
  count,
  axis,
  start,
  end,
  position = [0, 0, 0],
  speed = 0.1,
  ...props
}: {
  count: number;
  axis: "x" | "y" | "z";
  start: number;
  end: number;
  position?: [number, number, number];
  speed?: number;
} & ComponentProps<"mesh">) {
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const d = ((37 * i) % 23) / 23.0;
        return (
          <Car
            key={i}
            axis={axis}
            start={start}
            end={end}
            position-x={position[0]}
            position-y={position[1] + d * 5}
            position-z={position[2]}
            color={new Color().setHSL(0.5 * (i / count + d), 1, 0.5)}
            speed={speed}
            {...{
              [`position-${axis}`]: start + ((i + d) * (end - start)) / count,
            }}
            {...props}
          />
        );
      })}
    </>
  );
}

function Buildings({ x }: { x: number }) {
  return (
    <>
      {[...Array(20)].map((_, i) => {
        const height = ((37 * i + x) % 21) + 10;
        return (
          <mesh key={i} position={[x, 0, 60 - i * 6]} castShadow receiveShadow>
            <boxGeometry args={[5, height, 5]} />
            <meshStandardMaterial
              color={new Color().setHSL(0.9, 1, height / 100)}
            />
          </mesh>
        );
      })}
    </>
  );
}

function App() {
  return (
    <Canvas shadows style={{ height: "100dvh" }}>
      <color attach="background" args={["#3b1b55"]} />
      <fog color="#3b1b55" attach="fog" near={5} far={50} />
      <ambientLight intensity={Math.PI / 2} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0.8, 5]}
        rotation-x={Math.PI / 20.0}
      />
      <directionalLight
        position={[10, 10, 10]}
        intensity={Math.PI}
        castShadow
      />
      <hemisphereLight
        intensity={0.3}
        color={0x684485}
        groundColor={0x1818be}
      />
      <Ground />
      <Cars
        count={15}
        axis="z"
        position={[-2, 5, 0]}
        rotation-y={Math.PI / 2}
        start={-50}
        end={50}
      />
      <Cars count={7} axis="x" position={[0, 10, -22]} start={-20} end={20} />
      <Cars
        count={6}
        axis="x"
        position={[0, 8, 30]}
        rotation-y={Math.PI}
        speed={0.1}
        start={-20}
        end={20}
      />
      <Buildings x={7} />
      <Buildings x={-7} />
      <PointerLockControls makeDefault />
      <EffectComposer autoClear={false} enableNormalPass>
        <PosterizationEffect steps={10} />
      </EffectComposer>
    </Canvas>
  );
}

export default App;
