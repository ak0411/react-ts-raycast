import { MAP_WIDTH, MAP_HEIGHT, MAP_SCALE } from './constants';

export const degToRad = (angle: number) => (angle * Math.PI) / 180;
export const fixAngle = (angle: number) => ((angle % 360) + 360) % 360;

export const isCollision = (x: number, y: number, map: number[]): boolean => {
  const gridX = Math.floor(x / MAP_SCALE);
  const gridY = Math.floor(y / MAP_SCALE);
  if (gridX < 0 || gridX >= MAP_WIDTH || gridY < 0 || gridY >= MAP_HEIGHT) {
    return true;
  }
  return map[gridY * MAP_WIDTH + gridX] === 1;
};
