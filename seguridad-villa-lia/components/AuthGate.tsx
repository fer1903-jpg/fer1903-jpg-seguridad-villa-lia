"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      // Ensure profile exists
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profErr) {
        setError(profErr.message);
        return;
      }

      if (!prof) {
        const code = (localStorage.getItem("pending_invite_code") || "").trim();
        if (!code) {
          setError("Falta invitación. Escaneá el QR de invitación.");
          await supabase.auth.signOut();
          window.location.href = "/login";
          return;
        }

        const { data: ok, error: redErr } = await supabase.rpc("redeem_invitation", { p_code: code });
        if (redErr || ok !== true) {
          setError("Invitación inválida o vencida. Pedí un QR nuevo.");
          await supabase.auth.signOut();
          window.location.href = "/login";
          return;
        }

        localStorage.removeItem("pending_invite_code");

        const displayName = data.user.email?.split("@")[0] || "Vecino";
        const { error: insErr } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          display_name: displayName,
          role: "neighbor",
          status: "active",
          trust_score: 0,
        });

        if (insErr) {
          setError(insErr.message);
          return;
        }
      }

      setReady(true);
    })();
  }, []);

  if (error) return <div className="container error">{error}</div>;
  if (!ready) return <div className="container">Cargando…</div>;
  return <>{children}</>;
}
