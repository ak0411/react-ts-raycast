import React, { useEffect, useRef, useState } from 'react';
import { Caster, Vector2D } from './types';
import {
  MAP,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAP_SCALE,
  ROTATION_SPEED,
  MOVE_SPEED,
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

const drawMap2D = (ctx: CanvasRenderingContext2D) => {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      ctx.fillStyle = MAP[y][x] === 1 ? '#182634' : '#060b11';
      ctx.fillRect(x * MAP_SCALE, y * MAP_SCALE, MAP_SCALE - 1, MAP_SCALE - 1);
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

const drawRays2D = (
  ctx: CanvasRenderingContext2D,
  caster: Caster,
  w: number
) => {
  if (w < 1) return;

  const { pos, dir, plane } = caster;

  for (let x = 0; x < w; x++) {
    // Calculate ray position and direction
    const cameraX = (2 * x) / w - 1;
    const rayDirX = dir.x + plane.x * cameraX;
    const rayDirY = dir.y + plane.y * cameraX;

    // Which box of the map we're in
    let mapX = Math.floor(pos.x / MAP_SCALE);
    let mapY = Math.floor(pos.y / MAP_SCALE);

    // Length of ray from one x or y-side to next x or y-side
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // Calculate step and initial sideDist
    let stepX: number;
    let stepY: number;
    let sideDistX: number;
    let sideDistY: number;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (pos.x / MAP_SCALE - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - pos.x / MAP_SCALE) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (pos.y / MAP_SCALE - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - pos.y / MAP_SCALE) * deltaDistY;
    }

    // Perform DDA
    let hit = 0;
    let side = 0;
    while (hit == 0) {
      // Jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      // Check if ray has hit a wall
      if (MAP[mapY][mapX] > 0) hit = 1;
    }

    // Calculate distance projected on camera direction
    let perpWallDist: number;
    if (side == 0) {
      perpWallDist = (mapX - pos.x / MAP_SCALE + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - pos.y / MAP_SCALE + (1 - stepY) / 2) / rayDirY;
    }

    // Draw the ray
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    const rayEndX = pos.x + rayDirX * perpWallDist * MAP_SCALE;
    const rayEndY = pos.y + rayDirY * perpWallDist * MAP_SCALE;
    ctx.lineTo(rayEndX, rayEndY);
    ctx.strokeStyle = side == 1 ? '#9200007d' : '#50000096';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const isCollision = (x: number, y: number): boolean => {
  const mapX = Math.floor(x / MAP_SCALE);
  const mapY = Math.floor(y / MAP_SCALE);

  if (mapX < 0 || mapX >= MAP_WIDTH || mapY < 0 || mapY >= MAP_HEIGHT) {
    return true; // Collision with map bounds
  }

  return MAP[mapY][mapX] === 1; // Check collision with wall
};

// move the caster with W,A,S,D
const move = (frameTime: number, caster: Caster, keys: Set<string>) => {
  const moveSpeed = frameTime * MOVE_SPEED;
  const rotSpeed = frameTime * ROTATION_SPEED;
  const { pos, dir, plane } = caster;

  const movePlayer = (direction: number) => {
    const newPos: Vector2D = {
      x: pos.x + direction * dir.x * moveSpeed,
      y: pos.y + direction * dir.y * moveSpeed,
    };

    if (!isCollision(newPos.x, newPos.y)) {
      pos.x = newPos.x;
      pos.y = newPos.y;
    } else {
      // Allow sliding along walls
      if (!isCollision(pos.x, newPos.y)) pos.y = newPos.y;
      else if (!isCollision(newPos.x, pos.y)) pos.x = newPos.x;
    }
  };

  const rotatePlayer = (direction: number) => {
    const oldDir = { ...dir };
    const oldPlane = { ...plane };
    const cos = Math.cos(direction * rotSpeed);
    const sin = Math.sin(direction * rotSpeed);

    dir.x = dir.x * cos - dir.y * sin;
    dir.y = oldDir.x * sin + dir.y * cos;
    plane.x = plane.x * cos - plane.y * sin;
    plane.y = oldPlane.x * sin + plane.y * cos;
  };

  if (keys.has('w')) movePlayer(1);
  if (keys.has('s')) movePlayer(-1);
  if (keys.has('a')) rotatePlayer(-1);
  if (keys.has('d')) rotatePlayer(1);
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const casterRef = useRef<Caster>({
    pos: {
      x: START_POS_X,
      y: START_POS_Y,
    },
    dir: {
      x: START_DIR_X,
      y: START_DIR_Y,
    },
    plane: {
      x: START_PLANE_X,
      y: START_PLANE_Y,
    },
  });
  const keysRef = useRef<Set<string>>(new Set());
  const timeRef = useRef<number>(0);
  const oldTimeRef = useRef<number>(0);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [fps, setFps] = useState<number>(0);

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
        //timing for input and FPS counter
        oldTimeRef.current = timeRef.current;
        timeRef.current = performance.now();
        const frameTime = (timeRef.current - oldTimeRef.current) / 1000.0; //frameTime is the time this frame has taken, in seconds
        setFps(1.0 / frameTime);

        move(frameTime, casterRef.current, keysRef.current);
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // clear canvas
        drawMap2D(context);
        drawCaster2D(context, casterRef.current);
        drawRays2D(context, casterRef.current, RAYS);

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
      <span className='fps-counter'>{fps.toFixed(0)}</span>
    </div>
  );
};

export default App;
