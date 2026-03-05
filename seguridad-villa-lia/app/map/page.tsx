"use client";

import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MapView from "../../components/MapView";

type Category = "robo_intento" | "merodeo" | "vandalismo" | "violencia" | "sospechoso" | "otro";

function parsePointWkt(wkt: string) {
  const m = /POINT\(([-0-9.]+)\s+([-0-9.]+)\)/.exec(wkt);
  if (!m) return null;
  return { lon: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

export default function MapPage() {
  const [cells, setCells] = useState<any[]>([]);
  const [days, setDays] = useState(7);
  const [category, setCategory] = useState<Category | "all">("all");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const until = new Date();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase.rpc("heatmap_100m", {
      p_since: since.toISOString(),
      p_until: until.toISOString(),
      p_category: category === "all" ? null : category,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    const normalized = (data || []).map((x: any) => {
      const pt = parsePointWkt(String(x.grid_center)) || { lat: -34.123774, lon: -59.431373 };
      return { grid_100m: x.grid_100m, cnt: Number(x.cnt), center: { lat: pt.lat, lon: pt.lon } };
    });

    setCells(normalized);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, category]);

  return (
    <AuthGate>
      <TopNav />
      <div className="container">
        <h2>Mapa de calor</h2>
        <p className="small">Se muestran celdas con mínimo 3 reportes (k-anonimato) según el backend.</p>

        <div className="row">
          <label>Ventana</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
            <option value={1}>24 horas</option>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
          </select>

          <label>Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="all">Todas</option>
            <option value="robo_intento">Robo / intento</option>
            <option value="merodeo">Merodeo</option>
            <option value="vandalismo">Vandalismo</option>
            <option value="violencia">Violencia</option>
            <option value="sospechoso">Sospechoso</option>
            <option value="otro">Otro</option>
          </select>

          <button onClick={load}>Actualizar</button>
        </div>

        {err && <p className="error">{err}</p>}
        <MapView cells={cells} />
      </div>
    </AuthGate>
  );
}
