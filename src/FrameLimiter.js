import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export default function FrameLimiter({ limit = 60,children }) {
  const { invalidate, clock, advance } = useThree();
  useEffect(() => {
    let delta = 0;
    const interval = 1 / limit;
    const update = () => {
      requestAnimationFrame(update);
      delta += clock.getDelta();

      if (delta > interval) {
        invalidate();
        delta = delta % interval;
      }
    }

    update();
  }, [])

  return children;
}
