"use client";

import { useEffect, useRef } from "react";

type Cell = { grid_100m: string; cnt: number; center: { lat: number; lon: number } };

export default function MapView({ cells }: { cells: Cell[] }) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      const map = L.map(divRef.current!).setView([-34.123774, -59.431373], 14);
      mapRef.current = map;

      const tileUrl = process.env.NEXT_PUBLIC_TILE_URL!;
      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
    })();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    // limpiar capas previas
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    // círculos: tamaño proporcional a cnt
    cells.forEach((c) => {
      const radius = Math.min(220, 60 + c.cnt * 25);
      const circle = L.circle([c.center.lat, c.center.lon], { radius });
      circle.bindPopup(`${c.grid_100m}<br/>Reportes: ${c.cnt}`);
      circle.addTo(map);
      layersRef.current.push(circle);
    });
  }, [cells]);

  return <div ref={divRef} style={{ height: "70vh", width: "100%" }} />;
}
