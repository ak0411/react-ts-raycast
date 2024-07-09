import {
  MAP_HEIGHT,
  MAP_WIDTH,
  MAP,
  MAP_SCALE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './constants';
import { Caster, Ray, Vector2D } from './types';

export const drawMap = (ctx: CanvasRenderingContext2D) => {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      ctx.fillStyle = MAP[y][x] === 1 ? '#888888' : '#555555';
      ctx.fillRect(x * MAP_SCALE, y * MAP_SCALE, MAP_SCALE - 1, MAP_SCALE - 1);
    }
  }
};

export const drawCaster = (ctx: CanvasRenderingContext2D, caster: Caster) => {
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

export const drawRays = (
  ctx: CanvasRenderingContext2D,
  caster: Caster,
  w: number
) => {
  if (w < 1) return;

  const { pos, dir, plane } = caster;
  const view3DWidth = SCREEN_WIDTH - MAP_WIDTH * MAP_SCALE;
  const stripWidth = view3DWidth / w;

  for (let x = 0; x < w; x++) {
    // Calculate ray position and direction
    const cameraX = (2 * x) / w - 1;
    const ray: Ray = {
      dir: {
        x: dir.x + plane.x * cameraX,
        y: dir.y + plane.y * cameraX,
      },
      sideDist: {
        x: 0,
        y: 0,
      },
      deltaDist: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
    };

    // Which box of the map we're in
    const map: Vector2D = {
      x: Math.floor(pos.x / MAP_SCALE),
      y: Math.floor(pos.y / MAP_SCALE),
    };

    // Length of ray from one x or y-side to next x or y-side
    ray.deltaDist.x = Math.abs(1 / ray.dir.x);
    ray.deltaDist.y = Math.abs(1 / ray.dir.y);

    const step: Vector2D = {
      x: 0,
      y: 0,
    };

    //calculate step and initial sideDist
    if (ray.dir.x < 0) {
      step.x = -1;
      ray.sideDist.x = (pos.x / MAP_SCALE - map.x) * ray.deltaDist.x;
    } else {
      step.x = 1;
      ray.sideDist.x = (map.x + 1.0 - pos.x / MAP_SCALE) * ray.deltaDist.x;
    }
    if (ray.dir.y < 0) {
      step.y = -1;
      ray.sideDist.y = (pos.y / MAP_SCALE - map.y) * ray.deltaDist.y;
    } else {
      step.y = 1;
      ray.sideDist.y = (map.y + 1.0 - pos.y / MAP_SCALE) * ray.deltaDist.y;
    }

    // Perform DDA
    let hit = 0;
    let side = 0;
    while (hit == 0) {
      // Jump to next map square, either in x-direction, or in y-direction
      if (ray.sideDist.x < ray.sideDist.y) {
        ray.sideDist.x += ray.deltaDist.x;
        map.x += step.x;
        side = 0;
      } else {
        ray.sideDist.y += ray.deltaDist.y;
        map.y += step.y;
        side = 1;
      }
      // Check if ray has hit a wall
      if (MAP[map.y][map.x] > 0) hit = 1;
    }

    // Calculate distance projected on camera direction
    let perpWallDist: number;
    if (side == 0) {
      perpWallDist = (map.x - pos.x / MAP_SCALE + (1 - step.x) / 2) / ray.dir.x;
    } else {
      perpWallDist = (map.y - pos.y / MAP_SCALE + (1 - step.y) / 2) / ray.dir.y;
    }

    // Draw the ray
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ray.end.x = pos.x + ray.dir.x * perpWallDist * MAP_SCALE;
    ray.end.y = pos.y + ray.dir.y * perpWallDist * MAP_SCALE;
    ctx.lineTo(ray.end.x, ray.end.y);
    ctx.strokeStyle = side == 1 ? '#9200007d' : '#50000096';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Calculate height of line to draw on screen
    const lineHeight = Math.floor(SCREEN_HEIGHT / perpWallDist);

    // Calculate lowest and highest pixel to fill in current stripe
    let drawStart = -lineHeight / 2 + SCREEN_HEIGHT / 2;
    if (drawStart < 0) drawStart = 0;
    let drawEnd = lineHeight / 2 + SCREEN_HEIGHT / 2;
    if (drawEnd >= SCREEN_HEIGHT) drawEnd = SCREEN_HEIGHT - 1;

    // Calculate the x-coordinate for the 3D view
    const view3DX =
      MAP_WIDTH * MAP_SCALE + ((w - 1 - x) / (w - 1)) * view3DWidth;

    // Draw a filled rectangle for the wall strip
    ctx.fillStyle = side === 1 ? '#555555' : '#888888';
    ctx.fillRect(view3DX, drawStart, stripWidth, drawEnd - drawStart);

    // Add simple shading based on distance
    const shade = Math.min(1, 1 - perpWallDist / 10); // Adjust divisor for shading intensity
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - shade})`;
    ctx.fillRect(view3DX, drawStart, stripWidth, drawEnd - drawStart);
  }
};
