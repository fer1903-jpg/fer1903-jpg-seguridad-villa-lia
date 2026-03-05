"use client";

import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ActivityPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("incidents_public")
        .select("id,category,severity,occurred_at,created_at,status,location_precision")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setErr(error.message);
        return;
      }
      setItems(data || []);
    })();
  }, []);

  return (
    <AuthGate>
      <TopNav />
      <div className="container">
        <h2>Actividad</h2>
        <p className="small">
          Se muestran reportes pendientes y verificados. Para vecinos, la ubicación es siempre aproximada.
        </p>

        {err && <p className="error">{err}</p>}

        <ul>
          {items.map((x) => (
            <li key={x.id} style={{ marginBottom: 10 }}>
              <b>{x.category}</b> · sev {x.severity} · <i>{x.status}</i>
              <div className="small">Ocurrió: {new Date(x.occurred_at).toLocaleString()}</div>
              <div className="small">Precisión elegida al reportar: {x.location_precision}</div>
            </li>
          ))}
        </ul>
      </div>
    </AuthGate>
  );
}
