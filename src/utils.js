export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function fmtMoney(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(val) {
  if (!val) return "—";
  // Firestore Timestamp
  if (val?.toDate) {
    const d = val.toDate();
    return d.toLocaleDateString("pt-BR");
  }
  // ISO string "YYYY-MM-DD"
  if (typeof val === "string" && val.length >= 10) {
    const [y, m, d] = val.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  return "—";
}
