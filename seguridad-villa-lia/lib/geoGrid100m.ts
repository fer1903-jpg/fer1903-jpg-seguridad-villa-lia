// Aproximación simple: suficiente para grilla 100m en un pueblo.
// 1° lat ≈ 111.320m
export function grid100m(lat: number, lon: number) {
  const meters = 100;

  const latStep = meters / 111_320;
  const lonStep = meters / (111_320 * Math.cos((lat * Math.PI) / 180));

  const latIdx = Math.floor(lat / latStep);
  const lonIdx = Math.floor(lon / lonStep);

  const centerLat = (latIdx + 0.5) * latStep;
  const centerLon = (lonIdx + 0.5) * lonStep;

  const gridId = `100m:${latIdx}:${lonIdx}`;
  return { gridId, centerLat, centerLon };
}
