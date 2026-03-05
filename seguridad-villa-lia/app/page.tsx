import AuthGate from "../components/AuthGate";
import TopNav from "../components/TopNav";

export default function HomePage() {
  return (
    <AuthGate>
      <TopNav />
      <div className="container">
        <h2>Inicio</h2>
        <p>
          Esta app no reemplaza emergencias. Ante riesgo inmediato llamá al 911.
          Sirve para registrar hechos y prevenir.
        </p>
        <p className="small">
          Recomendación: usá “Ubicación aproximada (100m)” salvo que la Comisión necesite precisión exacta.
        </p>
      </div>
    </AuthGate>
  );
}
