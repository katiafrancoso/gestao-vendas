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
          width: 220,
          background: "#1A1A2E",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
          boxShadow: "4px 0 24px #0003",
        }}>
          <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#6366F1", textTransform: "uppercase", marginBottom: 4 }}>Gestão</div>
            <div style={{ fontSize: 22, fontWeight: 800,
