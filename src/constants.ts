export const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 10;
export const MAP_SCALE = 64;

export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 640;

export const START_POS_X = MAP_SCALE * 4;
export const START_POS_Y = MAP_SCALE * 4;
export const START_DIR_X = -1;
export const START_DIR_Y = 0;
export const START_PLANE_X = 0;
export const START_PLANE_Y = 0.66;
export const MOVE_SPEED = MAP_SCALE * 1; // squares per second
export const ROTATION_SPEED = 3; // radians per second;
