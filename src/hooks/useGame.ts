import { useState, useCallback } from 'react';
import { Player } from '../types';
import { PLAYER_SPEED, ROTATION_SPEED } from '../constants';
import { fixAngle, degToRad, isCollision } from '../utils';
import { map } from '../map';

export const useGame = () => {
  const [player, setPlayer] = useState<Player>({
    x: 300,
    y: 300,
    angle: 90,
    dx: Math.cos(degToRad(90)),
    dy: -Math.sin(degToRad(90)),
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { key } = e;
    setPlayer((prev) => {
      let newX = prev.x;
      let newY = prev.y;
      let newAngle = prev.angle;

      switch (key.toLowerCase()) {
        case 'a':
          newAngle = fixAngle(prev.angle + ROTATION_SPEED);
          break;
        case 'd':
          newAngle = fixAngle(prev.angle - ROTATION_SPEED);
          break;
        case 'w':
          newX += prev.dx * PLAYER_SPEED;
          newY += prev.dy * PLAYER_SPEED;
          break;
        case 's':
          newX -= prev.dx * PLAYER_SPEED;
          newY -= prev.dy * PLAYER_SPEED;
          break;
      }

      const newDx = Math.cos(degToRad(newAngle));
      const newDy = -Math.sin(degToRad(newAngle));

      if (!isCollision(newX, newY, map)) {
        return {
          ...prev,
          x: newX,
          y: newY,
          angle: newAngle,
          dx: newDx,
          dy: newDy,
        };
      } else {
        return { ...prev, angle: newAngle, dx: newDx, dy: newDy };
      }
    });
  }, []);

  return { player, handleKeyDown };
};
