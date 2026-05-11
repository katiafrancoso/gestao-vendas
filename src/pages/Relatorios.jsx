import { useState } from "react";
import { useCollection } from "../useCollection";
import { fmtMoney, fmtDate } from "../utils";
import { PageHeader, Card, Badge } from "../components";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const STATUS_COLOR = { Pago: "green", Pendente: "yellow", Cancelado: "red" };

export default function Relatorios() {
  const { data: vendas, loading } = useCollection("vendas");
  const { data: clientes } = useCollection("clientes");
  const [modo, setModo] = useState("mensal");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [dia, setDia] = useState(new Date().toISOString().slice(0, 10));

  const clienteNome = (id, nome) => nome || clientes.find(c => c.id === id)?.nome || "—";

  const vendasPeriodo = vendas.filter(v => {
    if (v.status === "Cancelado") return false;
    const d = v.dataVenda;
    if (!d) return false;
    if (modo === "diario") return d === dia;
    if (modo === "mensal") return d.startsWith(`${ano}-${String(mes + 1).padStart(2, "0")}`);
    if (modo === "anual") return d.startsWith(String(ano));
    return true;
  });

  const totalReceita = vendasPeriodo.reduce((s, v) => s + (v.total || 0), 0);
  const totalCusto = vendasPeriodo.reduce((s, v) => s + (v.custo || 0), 0);
  const totalLucro = totalReceita - totalCusto;
  const margem = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : 0;
  const totalRecebido = vendasPeriodo.filter(v => v.status === "Pago").reduce((s, v) => s + (v.total || 0), 0);
  const totalPendente = vendasPeriodo.filter(v => v.status === "Pendente").reduce((s, v) => s + (v.total || 0), 0);
  const totalDesconto = vendasPeriodo.reduce((s, v) => s + (v.descontoVal || 0), 0);

  const anualData = MESES.map((m, i) => {
    const mvs = vendas.filter(v => v.status !== "Cancelado" && v.dataVenda?.startsWith(`${ano}-${String(i + 1).padStart(2, "0")}`));
    return { mes: m, receita: mvs.reduce((s, v) => s + (v.total || 0), 0), lucro: mvs.reduce((s, v) => s + (v.total || 0) - (v.custo || 0), 0), qtd: mvs.length };
  });
  const maxAnual = Math.max(...anualData.map(d => d.receita), 1);

  const prodMap = {};
  vendasPeriodo.forEach(v => {
    v.itens?.forEach(item => {
      if (!prodMap[item.produtoId]) prodMap[item.produtoId] = { nome: item.nome, qtd: 0, receita: 0, lucro: 0 };
      prodMap[item.produtoId].qtd += item.qtd;
      prodMap[item.produtoId].receita += item.valor * item.qtd;
      prodMap[item.produtoId].lucro += (item.valor - item.custo) * item.qtd;
    });
  });
  const topProdutos = Object.values(prodMap).sort((a, b) => b.receita - a.receita).slice(0, 5);

  const cliMap = {};
  vendasPeriodo.forEach(v => {
    const nome = v.clienteNome || clienteNome(v.clienteId);
    if (!cliMap[v.clienteId]) cliMap[v.clienteId] = { nome, total: 0, qtd: 0 };
    cliMap[v.clienteId].total += v.total || 0;
    cliMap[v.clienteId].qtd += 1;
  });
  const topClientes = Object.values(cliMap).sort((a, b) => b.total - a.total).slice(0, 5);

  const anos = [...new Set(vendas.map(v => v.dataVenda?.slice(0, 4)).filter(Boolean))].sort().reverse();
  if (!anos.includes(String(ano))) anos.unshift(String(ano));

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Análise de vendas e lucratividade" />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["diario","Diário"],["mensal","Mensal"],["anual","Anual"]].map(([v,l]) => (
              <button key={v} onClick={() => setModo(v)} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid", borderColor: modo === v ? "#6366F1" : "#E2E8F0", background: modo === v ? "#6366F1" : "#fff", color: modo === v ? "#fff" : "#64748B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          {modo === "diario" && <input type="date" value={dia} onChange={e => setDia(e.target.value)} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "#FAFAF9" }} />}
          {modo === "mensal" && <>
            <select value={mes} onChange={e => setMes(Number(e.target.value))} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "#FAFAF9" }}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={ano} onChange={e => setAno(Number(e.target.value))} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "#FAFAF9" }}>
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </>}
          {modo === "anual" && <select value={ano} onChange={e => setAno(Number(e.target.value))} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 14, background: "#FAFAF9" }}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#94A3B8" }}>{vendasPeriodo.length} vendas no período</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Receita Total", value: fmtMoney(totalReceita), color: "#6366F1", icon: "💰" },
          { label: "Recebido", value: fmtMoney(totalRecebido), color: "#16A34A", icon: "✅" },
          { label: "Pendente", value: fmtMoney(totalPendente), color: "#D97706", icon: "⏳" },
          { label: "Custo Total", value: fmtMoney(totalCusto), color: "#EF4444", icon: "📉" },
          { label: "Lucro Bruto", value: fmtMoney(totalLucro), color: "#0EA5E9", icon: "📈" },
          { label: "Margem %", value: `${margem}%`, color: Number(margem) >= 30 ? "#16A34A" : Number(margem) >= 10 ? "#D97706" : "#EF4444", icon: "📊" },
          { label: "Descontos", value: fmtMoney(totalDesconto), color: "#8B5CF6", icon: "🏷️" },
          { label: "Nº de Vendas", value: vendasPeriodo.length, color: "#64748B", icon: "🛒" },
        ].map(c => (
          <Card key={c.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
          </Card>
        ))}
      </div>

      {modo === "anual" && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A2E", marginBottom: 16 }}>📊 Receita Mensal — {ano}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
            {anualData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600 }}>{d.receita > 0 ? `R$${(d.receita/1000).toFixed(0)}k` : ""}</div>
                <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 120 }}>
                  <div style={{ flex: 1, background: "#6366F1", borderRadius: "4px 4px 0 0", height: `${(d.receita / maxAnual) * 120}px`, minHeight: d.receita > 0 ? 4 : 0 }} />
                  <div style={{ flex: 1, background: "#10B981", borderRadius: "4px 4px 0 0", height: `${(Math.max(0, d.lucro) / maxAnual) * 120}px`, minHeight: d.lucro > 0 ? 4 : 0 }} />
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{d.mes}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}><span style={{ width: 12, height: 12, background: "#6366F1", borderRadius: 3, display: "inline-block" }}></span> Receita</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}><span style={{ width: 12, height: 12, background: "#10B981", borderRadius: 3, display: "inline-block" }}></span> Lucro</div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A2E", marginBottom: 14 }}>🏆 Top Produtos</div>
          {topProdutos.length === 0 ? <div style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: 20 }}>Sem dados no período</div>
          : topProdutos.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < topProdutos.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1A1A2E" }}><span style={{ color: "#94A3B8", marginRight: 6 }}>#{i + 1}</span>{p.nome}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{p.qtd} unid.</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#6366F1" }}>{fmtMoney(p.receita)}</div>
                <div style={{ fontSize: 11, color: "#16A34A" }}>lucro: {fmtMoney(p.lucro)}</div>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A2E", marginBottom: 14 }}>👤 Top Clientes</div>
          {topClientes.length === 0 ? <div style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: 20 }}>Sem dados no período</div>
          : topClientes.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < topClientes.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1A1A2E" }}><span style={{ color: "#94A3B8", marginRight: 6 }}>#{i + 1}</span>{c.nome}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{c.qtd} pedido{c.qtd !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#6366F1" }}>{fmtMoney(c.total)}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 15, color: "#1A1A2E" }}>🧾 Vendas do Período</div>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>Carregando...</div>
        : vendasPeriodo.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>Nenhuma venda neste período.</div>
        : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F8FB" }}>
                {["Data","Cliente","Itens","Receita","Custo","Lucro","Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendasPeriodo.sort((a, b) => (b.dataVenda || "").localeCompare(a.dataVenda || "")).map((v, i) => {
                const lucro = (v.total || 0) - (v.custo || 0);
                return (
                  <tr key={v.id} style={{ borderTop: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{fmtDate(v.dataVenda)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1A1A2E" }}>{v.clienteNome || clienteNome(v.clienteId)}</td>
                    <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13 }}>{v.itens?.length}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#6366F1" }}>{fmtMoney(v.total)}</td>
                    <td style={{ padding: "12px 16px", color: "#EF4444", fontSize: 13 }}>{fmtMoney(v.custo)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: lucro >= 0 ? "#16A34A" : "#EF4444" }}>{fmtMoney(lucro)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge color={STATUS_COLOR[v.status]}>{v.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#F8F8FB", borderTop: "2px solid #E2E8F0" }}>
                <td colSpan={3} style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#6366F1" }}>{fmtMoney(totalReceita)}</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#EF4444" }}>{fmtMoney(totalCusto)}</td>
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "#16A34A" }}>{fmtMoney(totalLucro)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </div>
  );
}
