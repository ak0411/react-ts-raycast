export type Vector2D = {
  x: number;
  y: number;
};

export type Caster = {
  pos: Vector2D;
  dir: Vector2D;
  plane: Vector2D;
};

export type Ray = {
  dir: Vector2D; // ray direction
  sideDist: Vector2D; // length of ray from current position to next x or y-side
  deltaDist: Vector2D; // length of ray from one x or y-side to next x or y-side
  end: Vector2D; // end position of ray
};
