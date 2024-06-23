import { forwardRef, useMemo } from "react";
import { Uniform } from "three";
import { Effect } from "postprocessing";
import fragmentShader from "./PosterizationEffect.frag.glsl?raw";

let _uSteps: number;

// Effect implementation
class PosterizationEffectImpl extends Effect {
  constructor({ steps = 0.1 } = {}) {
    super("PosterizationEffect", `#define TIME_EXISTS 1\n${fragmentShader}`, {
      uniforms: new Map([["steps", new Uniform(steps)]]),
    });

    _uSteps = steps;
  }

  update() {
    const paramUniform = this.uniforms.get("steps");
    if (paramUniform) {
      paramUniform.value = _uSteps;
    }
  }
}

// Effect component
export const PosterizationEffect = forwardRef(
  ({ steps }: { steps: number }, ref) => {
    const effect = useMemo(
      () => new PosterizationEffectImpl({ steps }),
      [steps]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
