"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function TopNav() {
  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #e5e7eb" }}>
      <Link href="/">Inicio</Link>
      <Link href="/report">Reportar</Link>
      <Link href="/map">Mapa</Link>
      <Link href="/activity">Actividad</Link>
      <Link href="/admin">Comisión</Link>

      <button
        style={{ marginLeft: "auto" }}
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
      >
        Salir
      </button>
    </div>
  );
}
