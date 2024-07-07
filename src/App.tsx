import React, { useEffect, useRef, useState } from 'react';
import { Caster } from './types';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  map,
  MAP_SCALE,
  CASTER_RADIUS,
  START_X,
  START_Y,
  START_ANGLE,
  ROTATION_SPEED,
  MOVE_SPEED,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './constants';
import { cosTable, sinTable } from './utils';

const drawMap2D = (ctx: CanvasRenderingContext2D) => {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      ctx.fillStyle = map[y][x] === 1 ? '#182634' : '#060b11';
      ctx.fillRect(x * MAP_SCALE, y * MAP_SCALE, MAP_SCALE, MAP_SCALE);
    }
  }
};

const drawCaster2D = (ctx: CanvasRenderingContext2D, caster: Caster) => {
  ctx.fillStyle = '#e4b57b';
  ctx.beginPath();
  ctx.arc(caster.pos.x, caster.pos.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e4b57b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(caster.pos.x, caster.pos.y);
  ctx.lineTo(
    caster.pos.x + caster.dir.x * 15,
    caster.pos.y + caster.dir.y * 15
  );
  ctx.stroke();
};

// Check for collisions with offset
const isValidPosition = (x: number, y: number): boolean => {
  const checkPoint = (px: number, py: number) => {
    const cellX = Math.floor(px / MAP_SCALE);
    const cellY = Math.floor(py / MAP_SCALE);
    return (
      cellX >= 0 &&
      cellX < MAP_WIDTH &&
      cellY >= 0 &&
      cellY < MAP_HEIGHT &&
      map[cellY][cellX] === 0
    );
  };

  return (
    checkPoint(x - CASTER_RADIUS, y - CASTER_RADIUS) &&
    checkPoint(x + CASTER_RADIUS, y - CASTER_RADIUS) &&
    checkPoint(x - CASTER_RADIUS, y + CASTER_RADIUS) &&
    checkPoint(x + CASTER_RADIUS, y + CASTER_RADIUS)
  );
};

// move the caster with W,A,S,D and rotate with Q,E
const move = (caster: Caster, keys: Set<string>) => {
  // Rotation
  if (keys.has('q')) {
    caster.angle = (caster.angle + ROTATION_SPEED) % 360;
  }
  if (keys.has('e')) {
    caster.angle = (caster.angle - ROTATION_SPEED + 360) % 360;
  }

  // Update direction vectors using precomputed sin and cos
  caster.dir.x = cosTable[caster.angle];
  caster.dir.y = -sinTable[caster.angle];

  // Movement
  let dirX = 0;
  let dirY = 0;

  if (keys.has('w')) {
    dirX += caster.dir.x * MOVE_SPEED;
    dirY += caster.dir.y * MOVE_SPEED;
  }
  if (keys.has('s')) {
    dirX -= caster.dir.x * MOVE_SPEED;
    dirY -= caster.dir.y * MOVE_SPEED;
  }
  if (keys.has('a')) {
    dirX += caster.dir.y * MOVE_SPEED;
    dirY -= caster.dir.x * MOVE_SPEED;
  }
  if (keys.has('d')) {
    dirX -= caster.dir.y * MOVE_SPEED;
    dirY += caster.dir.x * MOVE_SPEED;
  }

  // Apply movement if valid
  const newX = caster.pos.x + dirX;
  const newY = caster.pos.y + dirY;

  // Update position if no collision
  if (isValidPosition(newX, newY)) {
    caster.pos.x = newX;
    caster.pos.y = newY;
  } else {
    // If there's a collision, try to slide along the wall
    if (isValidPosition(caster.pos.x, newY)) {
      caster.pos.y = newY;
    } else if (isValidPosition(newX, caster.pos.y)) {
      caster.pos.x = newX;
    }
  }
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const casterRef = useRef<Caster>({
    pos: {
      x: START_X,
      y: START_Y,
    },
    angle: START_ANGLE,
    dir: {
      x: cosTable[START_ANGLE],
      y: -sinTable[START_ANGLE],
    },
  });
  const keysRef = useRef<Set<string>>(new Set());
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Effect for initializing the canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setContext(ctx);
    }
  }, []);

  // Effect for initializing event listeners
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

  // Effect for the game loop
  useEffect(() => {
    let animationFrameId: number;

    if (context) {
      const render = () => {
        move(casterRef.current, keysRef.current);
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        drawMap2D(context);
        drawCaster2D(context, casterRef.current);
        animationFrameId = window.requestAnimationFrame(render);
      };
      render();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [context]);

  return <canvas ref={canvasRef} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />;
};

export default App;
