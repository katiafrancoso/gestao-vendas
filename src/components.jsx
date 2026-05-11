export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1A1A2E" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: "20px 24px",
      boxShadow: "0 1px 4px #0001",
      border: "1px solid #E8E8EC",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", small, danger, style }) {
  const base = {
    border: "none", borderRadius: 9, cursor: "pointer",
    fontWeight: 700, fontSize: small ? 12 : 14,
    padding: small ? "6px 12px" : "10px 20px",
    transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6,
    ...style,
  };
  const variants = {
    primary: { background: "#6366F1", color: "#fff" },
    secondary: { background: "#F1F5F9", color: "#475569" },
    ghost: { background: "transparent", color: "#6366F1", border: "1.5px solid #6366F1" },
    danger: { background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...(danger ? variants.danger : variants[variant]) }}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: "0.04em" }}>{label}</label>}
      <input {...props} style={{
        border: "1.5px solid #E2E8F0",
        borderRadius: 8, padding: "9px 12px",
        fontSize: 14, color: "#1A1A2E",
        outline: "none",
        background: "#FAFAF9",
        width: "100%", boxSizing: "border-box",
        ...props.style,
      }} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: "0.04em" }}>{label}</label>}
      <select {...props} style={{
        border: "1.5px solid #E2E8F0",
        borderRadius: 8, padding: "9px 12px",
        fontSize: 14, color: "#1A1A2E",
        background: "#FAFAF9",
        width: "100%", boxSizing: "border-box",
        ...props.style,
      }}>
        {children}
      </select>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0007",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540,
        maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 20px 60px #0004",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E8E8EC" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8" }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

export function Badge({ children, color }) {
  const colors = {
    green: { bg: "#DCFCE7", text: "#16A34A" },
    yellow: { bg: "#FEF9C3", text: "#CA8A04" },
    red: { bg: "#FEE2E2", text: "#DC2626" },
    blue: { bg: "#DBEAFE", text: "#2563EB" },
    gray: { bg: "#F1F5F9", text: "#64748B" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
    }}>{children}</span>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#64748B", marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
    </div>
  );
}
