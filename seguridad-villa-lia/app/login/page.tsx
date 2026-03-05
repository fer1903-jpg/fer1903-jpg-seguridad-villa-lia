"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const inv = (url.searchParams.get("invite") || "").trim();
    if (inv) localStorage.setItem("pending_invite_code", inv);

    const stored = (localStorage.getItem("pending_invite_code") || "").trim();
    setInvite(stored);
    setInviteInput(stored);
  }, []);

  function saveInviteManually() {
    setMsg(null);
    const clean = inviteInput.trim();
    if (!clean) {
      setMsg("Ingresá un código o escaneá el QR.");
      return;
    }
    localStorage.setItem("pending_invite_code", clean);
    setInvite(clean);
    setMsg("Invitación cargada. Ahora podés ingresar.");
  }

  function clearInvite() {
    localStorage.removeItem("pending_invite_code");
    setInvite("");
    setInviteInput("");
    setMsg("Invitación borrada. Escaneá un QR nuevo.");
  }

  async function signInWithGoogle() {
    setMsg(null);
    if (!invite) {
      setMsg("Falta invitación. Escaneá el QR de la Comisión o cargá el código manualmente.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });

    if (error) setMsg(error.message);
  }

  async function signInWithEmailLink() {
    setMsg(null);
    if (!invite) {
      setMsg("Falta invitación. Escaneá el QR de la Comisión o cargá el código manualmente.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setMsg(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h1>Ingresar</h1>

      {!invite ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <h3>Te falta la invitación</h3>
          <p className="small">
            Para usar la app necesitás escanear el QR de la Comisión (recomendado) o ingresar el código manualmente.
          </p>

          <div className="row">
            <button onClick={() => (window.location.href = "/onboard")} style={{ fontSize: 16, padding: "10px 14px" }}>
              Ver cómo instalar
            </button>
            <button onClick={clearInvite}>Borrar invitación</button>
          </div>

          <hr />

          <label>Código de invitación (manual)</label>
          <input value={inviteInput} onChange={(e) => setInviteInput(e.target.value)} placeholder="VLIA-SEC-XXXXXX" />
          <button onClick={saveInviteManually}>Cargar invitación</button>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 14 }}>
          <p className="small">
            Invitación cargada: <b>{invite}</b>
          </p>
          <div className="row">
            <button onClick={clearInvite}>Cambiar invitación</button>
            <button onClick={() => (window.location.href = "/onboard")}>Ver instalación</button>
          </div>
        </div>
      )}

      <button onClick={signInWithGoogle} style={{ fontSize: 18, padding: "12px 16px" }}>
        Continuar con Google
      </button>

      <hr />

      <p className="small">Alternativa por email (sin contraseña):</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuemail@gmail.com" />
      <button onClick={signInWithEmailLink} disabled={!email}>
        Enviar link por email
      </button>

      {sent && <p>Listo. Revisá tu email (también spam/promociones).</p>}
      {msg && <p className={msg.includes("cargada") ? "" : "error"}>{msg}</p>}
    </div>
  );
}
