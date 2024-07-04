import { useCallback } from 'react';
import { Player } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, MAP_SCALE } from '../constants';
import { fixAngle, degToRad } from '../utils';
import { map } from '../map';

export const useRenderer = () => {
  const drawMap2D = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        ctx.fillStyle = map[y * MAP_WIDTH + x] === 1 ? 'white' : 'black';
        ctx.fillRect(
          x * MAP_SCALE,
          y * MAP_SCALE,
          MAP_SCALE - 1,
          MAP_SCALE - 1
        );
      }
    }
  }, []);

  const drawPlayer2D = useCallback(
    (ctx: CanvasRenderingContext2D, player: Player) => {
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x + player.dx * 15, player.y + player.dy * 15);
      ctx.stroke();
    },
    []
  );

  const drawRays2D = useCallback(
    (ctx: CanvasRenderingContext2D, player: Player) => {
      let ra = fixAngle(player.angle + 30);

      for (let r = 0; r < 60; r++) {
        let dof = 0;
        let disV = 100000;
        let rx = 0,
          ry = 0,
          xo = 0,
          yo = 0;
        const tan = Math.tan(degToRad(ra));

        // Vertical
        if (Math.cos(degToRad(ra)) > 0.001) {
          rx = ((player.x >> 6) << 6) + 64;
          ry = (player.x - rx) * tan + player.y;
          xo = 64;
          yo = -xo * tan;
        } else if (Math.cos(degToRad(ra)) < -0.001) {
          rx = ((player.x >> 6) << 6) - 0.0001;
          ry = (player.x - rx) * tan + player.y;
          xo = -64;
          yo = -xo * tan;
        } else {
          rx = player.x;
          ry = player.y;
          dof = 8;
        }

        while (dof < 8) {
          const mx = rx >> 6;
          const my = ry >> 6;
          const mp = my * MAP_WIDTH + mx;
          if (mp > 0 && mp < MAP_WIDTH * MAP_HEIGHT && map[mp] === 1) {
            dof = 8;
            disV =
              Math.cos(degToRad(ra)) * (rx - player.x) -
              Math.sin(degToRad(ra)) * (ry - player.y);
          } else {
            rx += xo;
            ry += yo;
            dof += 1;
          }
        }

        const vx = rx;
        const vy = ry;

        // Horizontal
        dof = 0;
        let disH = 100000;
        if (Math.sin(degToRad(ra)) > 0.001) {
          ry = ((player.y >> 6) << 6) - 0.0001;
          rx = (player.y - ry) / tan + player.x;
          yo = -64;
          xo = -yo / tan;
        } else if (Math.sin(degToRad(ra)) < -0.001) {
          ry = ((player.y >> 6) << 6) + 64;
          rx = (player.y - ry) / tan + player.x;
          yo = 64;
          xo = -yo / tan;
        } else {
          rx = player.x;
          ry = player.y;
          dof = 8;
        }

        while (dof < 8) {
          const mx = rx >> 6;
          const my = ry >> 6;
          const mp = my * MAP_WIDTH + mx;
          if (mp > 0 && mp < MAP_WIDTH * MAP_HEIGHT && map[mp] === 1) {
            dof = 8;
            disH =
              Math.cos(degToRad(ra)) * (rx - player.x) -
              Math.sin(degToRad(ra)) * (ry - player.y);
          } else {
            rx += xo;
            ry += yo;
            dof += 1;
          }
        }

        ctx.strokeStyle = 'rgba(0, 200, 0, 0.3)';
        ctx.lineWidth = 2;

        if (disV < disH) {
          rx = vx;
          ry = vy;
          disH = disV;
          ctx.strokeStyle = 'rgba(0, 150, 0, 0.3)';
        }

        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(rx, ry);
        ctx.stroke();

        // Draw 3D
        const ca = fixAngle(player.angle - ra);
        disH = disH * Math.cos(degToRad(ca));
        let lineH = (MAP_SCALE * 320) / disH;
        if (lineH > 320) lineH = 320;
        const lineOff = 160 - (lineH >> 1);

        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(r * 8 + 530, lineOff);
        ctx.lineTo(r * 8 + 530, lineOff + lineH);
        ctx.stroke();

        ra = fixAngle(ra - 1);
      }
    },
    []
  );

  return { drawMap2D, drawPlayer2D, drawRays2D };
};
