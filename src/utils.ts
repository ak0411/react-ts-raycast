export const degToRad = (angle: number) => (angle * Math.PI) / 180;
export const fixAngle = (angle: number) => ((angle % 360) + 360) % 360;
