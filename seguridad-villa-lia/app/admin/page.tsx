"use client";

import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getMyRole } from "../../lib/roles";
import QRCode from "qrcode";

export default function AdminPage() {
  const [role, setRole] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [genCount, setGenCount] = useState(20);
  const [expiresDays, setExpiresDays] = useState(30);
  const [codes, setCodes] = useState<string[]>([]);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

  async function load() {
    setErr(null);
    const r = await getMyRole();
    if (!r) return;

    setRole(r.role);
    if (r.role !== "admin" && r.role !== "moderator") {
      setErr("Acceso solo para Comisión (moderadores/admin).");
      setItems([]);
      return;
    }

    const { data, error } = await supabase
      .from("incidents")
      .select(
        "id,category,severity,description,occurred_at,created_at,status,location_precision,grid_100m,geom_exact,grid_center,reported_by,possible_duplicate_of"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setErr(error.message);
      return;
    }
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setErr(null);

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("incidents").update({ status }).eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }

    await supabase.from("moderation_audit").insert({
      incident_id: id,
      action: `status:${status}`,
      notes: null,
      acted_by: uid,
    });

    await load();
  }

  async function generateCodes() {
    setErr(null);

    const r = await getMyRole();
    if (!r || (r.role !== "admin" && r.role !== "moderator")) {
      setErr("Acceso solo Comisión.");
      return;
    }

    const { data, error } = await supabase.rpc("generate_invitation_codes", {
      p_count: genCount,
      p_max_uses: 1,
      p_expires_days: expiresDays,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    const list = (data || []).map((x: any) => x.code);
    setCodes(list);

    const map: Record<string, string> = {};
    for (const c of list) {
      const url = `${window.location.origin}/onboard?invite=${encodeURIComponent(c)}`;
      map[c] = await QRCode.toDataURL(url, { margin: 1, width: 280 });
    }
    setQrDataUrls(map);
  }

  return (
    <AuthGate>
      <TopNav />
      <div className="container">
        <h2>Comisión de Seguridad</h2>
        <p className="small">Rol: {role || "-"}</p>
        {err && <p className="error">{err}</p>}

        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Invitaciones (QR)</h3>

          <div className="row">
            <label>Cantidad</label>
            <input
              type="number"
              value={genCount}
              onChange={(e) => setGenCount(parseInt(e.target.value || "20", 10))}
              style={{ width: 120 }}
              min={1}
              max={500}
            />

            <label>Vence (días)</label>
            <input
              type="number"
              value={expiresDays}
              onChange={(e) => setExpiresDays(parseInt(e.target.value || "30", 10))}
              style={{ width: 120 }}
              min={1}
              max={365}
            />

            <button onClick={generateCodes}>Generar QRs</button>
          </div>

          {codes.length > 0 && (
            <>
              <p className="small" style={{ marginTop: 10 }}>
                Cada QR abre la app, carga la invitación y muestra instalación guiada.
              </p>

              <div className="row" style={{ alignItems: "flex-start" }}>
                {codes.map((c) => (
                  <div key={c} className="card" style={{ width: 260 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{c}</div>
                    {qrDataUrls[c] && <img src={qrDataUrls[c]} alt={`QR ${c}`} style={{ width: 220, height: 220 }} />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <h3>Reportes</h3>
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {items.map((x) => (
            <li key={x.id} className="card" style={{ marginBottom: 10 }}>
              <div>
                <b>{x.category}</b> · sev {x.severity} · <i>{x.status}</i>
              </div>
              <div className="small">Ocurrió: {new Date(x.occurred_at).toLocaleString()}</div>
              <div className="small">Precisión: {x.location_precision}</div>

              {x.possible_duplicate_of && <div className="small">⚠ Posible duplicado de: {x.possible_duplicate_of}</div>}

              {x.location_precision === "exact" ? (
                <div className="small">
                  <b>Ubicación exacta:</b> {String(x.geom_exact)}
                </div>
              ) : (
                <div className="small">
                  <b>Ubicación aprox:</b> {x.grid_100m}
                </div>
              )}

              {x.description && <div className="small">Detalle: {x.description}</div>}

              <div className="row" style={{ marginTop: 10 }}>
                <button onClick={() => setStatus(x.id, "verified")}>Verificar</button>
                <button onClick={() => setStatus(x.id, "duplicate")}>Duplicado</button>
                <button onClick={() => setStatus(x.id, "false")}>Falso</button>
                <button onClick={() => setStatus(x.id, "not_verifiable")}>No verificable</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AuthGate>
  );
}
