import {
  MAP_SCALE,
  MAP_WIDTH,
  MAP_HEIGHT,
  MAP,
  MOVE_SPEED,
  ROTATION_SPEED,
} from './constants';
import { Caster, Vector2D } from './types';

const isCollision = (x: number, y: number): boolean => {
  const mapX = Math.floor(x / MAP_SCALE);
  const mapY = Math.floor(y / MAP_SCALE);

  if (mapX < 0 || mapX >= MAP_WIDTH || mapY < 0 || mapY >= MAP_HEIGHT) {
    return true; // Collision with map bounds
  }

  return MAP[mapY][mapX] === 1; // Check collision with wall
};

export const move = (frameTime: number, caster: Caster, keys: Set<string>) => {
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
