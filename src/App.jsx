import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Relatorios from "./pages/Relatorios";

const NAV = [
  { id: "clientes", label: "Clientes", icon: "👤" },
  { id: "produtos", label: "Produtos", icon: "📦" },
  { id: "vendas", label: "Vendas", icon: "🛒" },
  { id: "relatorios", label: "Relatórios", icon: "📊" },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function App() {
  const [usuario, setUsuario] = useState(undefined);
  const [page, setPage] = useState("vendas");
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user || null);
    });
    return unsub;
  }, []);

  async function sair() {
    await signOut(auth);
  }

  if (usuario === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A2E" }}>
        <div style={{ color: "#fff", fontSize: 16, fontFamily: "sans-serif" }}>⏳ Carregando...</div>
      </div>
    );
  }

  if (!usuario) return <Login onLogin={() => {}} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F4F0", fontFamily: "'DM Sans', sans-serif" }}>
      {!isMobile && (
        <aside style={{
          width: 220, background: "#1A1A2E", display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
          boxShadow: "4px 0 24px #0003",
        }}>
          <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#6366F1", textTransform: "uppercase", marginBottom: 4 }}>Gestão</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Vendas<br /><span style={{ color: "#6366F1" }}>Pro</span></div>
          </div>
          <nav style={{ flex: 1, padding: "16px 12px" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px",
                background: page === n.id ? "#6366F1" : "transparent", border: "none", borderRadius: 10,
                cursor: "pointer", color: page === n.id ? "#fff" : "#94A3B8",
                fontWeight: page === n.id ? 700 : 500, fontSize: 14, marginBottom: 4,
                transition: "all 0.15s", textAlign: "left",
              }}>
                <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 12px", borderTop: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, paddingLeft: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{usuario.email}</div>
            <button onClick={sair} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
              background: "transparent", border: "1px solid #ffffff20", borderRadius: 10,
              cursor: "pointer", color: "#94A3B8", fontSize: 13, fontWeight: 600,
            }}>🚪 Sair</button>
          </div>
        </aside>
      )}

      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, background: "#1A1A2E",
          padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 100, boxShadow: "0 2px 12px #0003",
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Vendas <span style={{ color: "#6366F1" }}>Pro</span></div>
          <button onClick={sair} style={{
            background: "transparent", border: "1px solid #ffffff20", borderRadius: 8,
            padding: "6px 12px", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>🚪 Sair</button>
        </div>
      )}

      <main style={{
        marginLeft: isMobile ? 0 : 220, flex: 1,
        padding: isMobile ? "72px 16px 90px" : "32px 36px", minHeight: "100vh",
      }}>
        {page === "clientes" && <Clientes />}
        {page === "produtos" && <Produtos />}
        {page === "vendas" && <Vendas />}
        {page === "relatorios" && <Relatorios />}
      </main>

      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1A2E",
          display: "flex", borderTop: "1px solid #ffffff15", zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 4px", background: "transparent", border: "none",
              cursor: "pointer", color: page === n.id ? "#6366F1" : "#64748B", transition: "color 0.15s",
            }}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: page === n.id ? 700 : 500 }}>{n.label}</span>
              {page === n.id && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366F1", marginTop: 1 }} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
