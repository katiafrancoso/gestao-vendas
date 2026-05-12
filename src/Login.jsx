import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return setErro("Preencha email e senha.");
    setCarregando(true);
    setErro("");
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLogin();
    } catch (e) {
      setErro("Email ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 25px 60px #0005",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1A1A2E" }}>Gestão de Vendas</h1>
        <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 6, marginBottom: 28 }}>Digite seu email e senha para acessar</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Email"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 15,
              border: `2px solid ${erro ? "#EF4444" : "#E2E8F0"}`,
              borderRadius: 10,
              outline: "none",
              boxSizing: "border-box",
              background: "#FAFAF9",
            }}
          />

          <div style={{ position: "relative" }}>
            <input
              type={mostrar ? "text" : "password"}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Senha"
              style={{
                width: "100%",
                padding: "12px 44px 12px 16px",
                fontSize: 15,
                border: `2px solid ${erro ? "#EF4444" : "#E2E8F0"}`,
                borderRadius: 10,
                outline: "none",
                boxSizing: "border-box",
                background: "#FAFAF9",
              }}
            />
            <button
              onClick={() => setMostrar(m => !m)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94A3B8",
              }}
            >
              {mostrar ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {erro && (
          <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
            ❌ {erro}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={carregando}
          style={{
            width: "100%",
            padding: "12px",
            background: carregando ? "#A5B4FC" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: carregando ? "not-allowed" : "pointer",
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p style={{ color: "#CBD5E1", fontSize: 11, marginTop: 24, marginBottom: 0 }}>
          🔒 Acesso restrito
        </p>
      </div>
    </div>
  );
}
