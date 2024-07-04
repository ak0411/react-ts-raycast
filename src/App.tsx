import React, { useEffect, useRef } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { useGame } from './hooks/useGame';
import { useRenderer } from './hooks/useRenderer';
import './styles.css';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { player, handleKeyDown } = useGame();
  const { drawMap2D, drawPlayer2D, drawRays2D } = useRenderer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      drawMap2D(ctx);
      drawPlayer2D(ctx, player);
      drawRays2D(ctx, player);
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawMap2D, drawPlayer2D, drawRays2D, handleKeyDown, player]);

  return (
    <div className='container'>
      <canvas ref={canvasRef} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
    </div>
  );
};

export default App;
