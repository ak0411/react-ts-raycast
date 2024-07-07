// Precompute sin and cos values for optimization
export const sinTable: number[] = new Array(360);
export const cosTable: number[] = new Array(360);

for (let i = 0; i < 360; i++) {
  const rad = (i * Math.PI) / 180;
  sinTable[i] = Math.sin(rad);
  cosTable[i] = Math.cos(rad);
}
