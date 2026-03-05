"use client";

import { useEffect, useMemo, useState } from "react";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  const anyNav: any = navigator;
  return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || anyNav.standalone === true;
}

export default function OnboardPage() {
  const [invite, setInvite] = useState<string>("");
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const inv = (url.searchParams.get("invite") || "").trim();
    if (inv) {
      localStorage.setItem("pending_invite_code", inv);
      setInvite(inv);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installed = useMemo(() => isStandalone(), []);

  async function doInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setCanInstall(false);
  }

  return (
    <div className="container">
      <h1>Seguridad Villa Lía</h1>

      {invite ? <p>Invitación cargada ✅</p> : <p className="error">Falta el código en el link. Escaneá el QR correcto.</p>}

      {installed ? (
        <div className="card">
          <p>✅ La app ya está instalada.</p>
          <a href="/login">Continuar</a>
        </div>
      ) : (
        <div className="card">
          <h2>Instalar</h2>

          {!isIOS() && canInstall && (
            <button onClick={doInstall} style={{ fontSize: 18, padding: "12px 16px" }}>
              Instalar ahora
            </button>
          )}

          {isIOS() ? (
            <>
              <p className="small">iPhone/iPad no permite instalar automáticamente. Hacelo así:</p>
              <ol>
                <li>Tocá <b>Compartir</b> (cuadrado con flecha).</li>
                <li>Elegí <b>“Agregar a pantalla de inicio”</b>.</li>
                <li>Confirmá.</li>
              </ol>
            </>
          ) : (
            <p className="small">
              En Android, si no aparece el botón, abrí el menú del navegador y tocá <b>“Instalar app”</b>.
            </p>
          )}

          <div style={{ marginTop: 12 }}>
            <a href="/login">Continuar al ingreso</a>
          </div>
        </div>
      )}
    </div>
  );
}
