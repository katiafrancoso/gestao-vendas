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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user || null);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  async function sair() {
    await signOut(auth);
  }

  function navegar(id) {
    setPage(id);
    setSidebarOpen(false);
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
      {/* OVERLAY — mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "#0007", zIndex: 98,
        }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: "#1A1A2E", display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, zIndex: 99,
        left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
        transition: "left 0.25s ease",
        boxShadow: sidebarOpen || !isMobile ? "4px 0 24px #0003" : "none",
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #ffffff10", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <
