import React, { useEffect, useRef, useState } from 'react';
import { Caster } from './types';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  START_POS_X,
  START_DIR_Y,
  START_POS_Y,
  START_DIR_X,
  START_PLANE_X,
  START_PLANE_Y,
  RAYS,
} from './constants';
import { drawMap, drawCaster, drawRays } from './drawing';
import { move } from './movement';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const casterRef = useRef<Caster>({
    pos: { x: START_POS_X, y: START_POS_Y },
    dir: { x: START_DIR_X, y: START_DIR_Y },
    plane: { x: START_PLANE_X, y: START_PLANE_Y },
  });
  const keysRef = useRef<Set<string>>(new Set());
  const timeRef = useRef<number>(0);
  const oldTimeRef = useRef<number>(0);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setContext(ctx);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    if (context) {
      const render = () => {
        // Timing for input and FPS counter
        oldTimeRef.current = timeRef.current;
        timeRef.current = performance.now();
        const frameTime = (timeRef.current - oldTimeRef.current) / 1000.0;
        setFps(1.0 / frameTime);

        // Clear the canvas
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Move the caster
        move(frameTime, casterRef.current, keysRef.current);

        // Draw the map
        drawMap(context);

        // Cast the rays and draw the 3D view
        drawRays(context, casterRef.current, RAYS);

        // Draw the caster on the 2D map
        drawCaster(context, casterRef.current);

        // Request the next frame
        animationFrameId = window.requestAnimationFrame(render);
      };
      render();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [context]);

  return (
    <div className='container'>
      <canvas ref={canvasRef} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
      <div className='info'>
        <span>
          [W] forward, [S] backward, [A] rotate left, [D] rotate right
        </span>
        <span className='fps-counter'>FPS: {fps.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default App;
