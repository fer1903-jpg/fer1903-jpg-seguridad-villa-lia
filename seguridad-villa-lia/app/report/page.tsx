"use client";

import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { grid100m } from "../../lib/geoGrid100m";

type Category = "robo_intento" | "merodeo" | "vandalismo" | "violencia" | "sospechoso" | "otro";
type Precision = "exact" | "approx_100m";

function toGeogPoint(lon: number, lat: number) {
  return `SRID=4326;POINT(${lon} ${lat})`;
}

export default function ReportPage() {
  const [category, setCategory] = useState<Category>("merodeo");
  const [precision, setPrecision] = useState<Precision>("approx_100m");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(2);
  const [msg, setMsg] = useState<string | null>(null);

  async function createReport() {
    setMsg(null);

    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 })
    ).catch(() => null);

    if (!pos) {
      setMsg("No se pudo obtener ubicación. Activá GPS y volvé a intentar.");
      return;
    }

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const g = grid100m(lat, lon);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    const payload: any = {
      category,
      severity,
      description: description.trim() || null,
      occurred_at: new Date().toISOString(),
      reported_by: auth.user.id,
      status: "pending",
      location_precision: precision,
      grid_100m: g.gridId,
      grid_center: toGeogPoint(g.centerLon, g.centerLat),
      geom_exact: precision === "exact" ? toGeogPoint(lon, lat) : null,
    };

    const { error } = await supabase.from("incidents").insert(payload);
    if (error) {
      setMsg(error.message);
      return;
    }

    setDescription("");
    setMsg("Reporte enviado. Queda pendiente de revisión por la Comisión.");
  }

  return (
    <AuthGate>
      <TopNav />
      <div className="container" style={{ maxWidth: 650 }}>
        <h2>Reportar hecho</h2>

        <label>Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="robo_intento">Robo / intento</option>
          <option value="merodeo">Merodeo</option>
          <option value="vandalismo">Vandalismo</option>
          <option value="violencia">Violencia</option>
          <option value="sospechoso">Sospechoso</option>
          <option value="otro">Otro</option>
        </select>

        <br />
        <br />

        <label>Ubicación</label>
        <select value={precision} onChange={(e) => setPrecision(e.target.value as any)}>
          <option value="approx_100m">Aproximada (zona 100m)</option>
          <option value="exact">Exacta (GPS)</option>
        </select>
        <div className="small">
          Si elegís “Exacta”, la Comisión verá el punto exacto. Si elegís “Aproximada”, verá solo la zona.
        </div>

        <br />

        <label>Severidad</label>
        <select value={severity} onChange={(e) => setSeverity(parseInt(e.target.value, 10))}>
          <option value={1}>Baja</option>
          <option value={2}>Media</option>
          <option value={3}>Alta</option>
        </select>

        <br />
        <br />

        <label>Descripción (opcional, máx 280)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={280} />

        <br />
        <br />

        <button onClick={createReport}>Enviar reporte</button>
        {msg && <p className={msg.startsWith("Reporte") ? "" : "error"}>{msg}</p>}
      </div>
    </AuthGate>
  );
}
