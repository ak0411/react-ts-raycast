import React, { useEffect, useRef, useState } from 'react';
import { Caster } from './types';

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;
const MAP_SCALE = 64;
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 640;
const MOVEMENT_SPEED = 3;
const COLLISION_OFFSET = 8;

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

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
  ctx.arc(caster.x, caster.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e4b57b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(caster.x, caster.y);
  ctx.lineTo(caster.x + caster.dx * 15, caster.y + caster.dy * 15);
  ctx.stroke();
};

const degToRad = (a: number): number => {
  return (a * Math.PI) / 180.0;
};

const FixAng = (a: number): number => {
  if (a > 359) {
    a -= 360;
  } else if (a < 0) {
    a += 360;
  }
  return a;
};

const isWall = (x: number, y: number): boolean => {
  const mapX = Math.floor(x / MAP_SCALE);
  const mapY = Math.floor(y / MAP_SCALE);
  return map[mapY][mapX] === 1;
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const casterRef = useRef<Caster | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // move the caster with W,A,S,D
  const move = () => {
    if (!casterRef.current) return;

    const keys = keysPressed.current;
    const caster = casterRef.current;

    let newX = caster.x;
    let newY = caster.y;

    if (keys.has('a')) {
      caster.angle += MOVEMENT_SPEED;
      caster.angle = FixAng(caster.angle);
      caster.dx = Math.cos(degToRad(caster.angle));
      caster.dy = -Math.sin(degToRad(caster.angle));
    }
    if (keys.has('d')) {
      caster.angle -= MOVEMENT_SPEED;
      caster.angle = FixAng(caster.angle);
      caster.dx = Math.cos(degToRad(caster.angle));
      caster.dy = -Math.sin(degToRad(caster.angle));
    }
    if (keys.has('w')) {
      newX += caster.dx * MOVEMENT_SPEED;
      newY += caster.dy * MOVEMENT_SPEED;
    }
    if (keys.has('s')) {
      newX -= caster.dx * MOVEMENT_SPEED;
      newY -= caster.dy * MOVEMENT_SPEED;
    }

    // Check for collisions with offset
    const checkCollision = (x: number, y: number): boolean => {
      return (
        isWall(x + COLLISION_OFFSET, y + COLLISION_OFFSET) ||
        isWall(x - COLLISION_OFFSET, y - COLLISION_OFFSET) ||
        isWall(x + COLLISION_OFFSET, y - COLLISION_OFFSET) ||
        isWall(x - COLLISION_OFFSET, y + COLLISION_OFFSET)
      );
    };

    // Update position if no collision
    if (!checkCollision(newX, newY)) {
      caster.x = newX;
      caster.y = newY;
    } else {
      // If there's a collision, try to slide along the wall
      if (!checkCollision(caster.x, newY)) {
        caster.y = newY;
      } else if (!checkCollision(newX, caster.y)) {
        caster.x = newX;
      }
    }
  };

  // Effect for initializing
  useEffect(() => {
    // Initializing the canvas context
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setContext(ctx);
    }

    // Initializing caster
    const x = 250;
    const y = 250;
    const angle = 90;
    const dx = Math.cos(degToRad(90));
    const dy = -Math.sin(degToRad(90));
    casterRef.current = { x, y, angle, dx, dy };

    // Initializing event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
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

    if (context && casterRef.current) {
      const render = () => {
        move();
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        drawMap2D(context);
        drawCaster2D(context, casterRef.current!);
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
