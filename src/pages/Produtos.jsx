import { useState } from "react";
import { useCollection } from "../useCollection";
import { fmtMoney } from "../utils";
import { PageHeader, Card, Btn, Input, Modal, EmptyState, Badge } from "../components";

const EMPTY = { nome: "", descricao: "", valor: "", custo: "" };

export default function Produtos() {
  const { data: produtos, loading, add, update, remove } = useCollection("produtos");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = produtos.filter(p => p.nome?.toLowerCase().includes(search.toLowerCase()));

  function openNew() { setForm(EMPTY); setEditing(null); setModal(true); }
  function openEdit(p) { setForm({ nome: p.nome, descricao: p.descricao || "", valor: String(p.valor), custo: String(p.custo) }); setEditing(p.id); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); }

  async function save() {
    if (!form.nome.trim()) return alert("Nome é obrigatório.");
    if (!form.valor || isNaN(Number(form.valor))) return alert("Valor de venda inválido.");
    if (!form.custo || isNaN(Number(form.custo))) return alert("Custo inválido.");
    const data = { nome: form.nome, descricao: form.descricao, valor: Number(form.valor), custo: Number(form.custo) };
    setSaving(true);
    try {
      if (editing) { await update(editing, data); }
      else { await add(data); }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleRemove(id) { await remove(id); setConfirmDel(null); }

  function margem(p) {
    if (!p.custo || !p.valor) return null;
    return (((p.valor - p.custo) / p.valor) * 100).toFixed(1);
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} produto${produtos.length !== 1 ? "s" : ""} cadastrado${produtos.length !== 1 ? "s" : ""}`}
        action={<Btn onClick={openNew}>＋ Novo Produto</Btn>}
      />
      <Card style={{ marginBottom: 20 }}>
        <Input placeholder="🔍  Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
      </Card>
      {loading ? (
        <Card><EmptyState icon="⏳" title="Carregando..." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="📦" title="Nenhum produto encontrado" subtitle={search ? "Tente outro termo." : "Clique em '+ Novo Produto' para começar."} /></Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F8FB" }}>
                {["Produto", "Descrição", "Valor de Venda", "Custo", "Margem", "Ações"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const m = margem(p);
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "#1A1A2E" }}>{p.nome}</td>
                    <td style={{ padding: "14px 20px", color: "#64748B", fontSize: 13, maxWidth: 180 }}>{p.descricao || "—"}</td>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "#16A34A" }}>{fmtMoney(p.valor)}</td>
                    <td style={{ padding: "14px 20px", color: "#EF4444" }}>{fmtMoney(p.custo)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      {m !== null && <Badge color={Number(m) >= 30 ? "green" : Number(m) >= 10 ? "yellow" : "red"}>{m}%</Badge>}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn small variant="secondary" onClick={() => openEdit(p)}>✏️ Editar</Btn>
                        <Btn small danger onClick={() => setConfirmDel(p)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {modal && (
        <Modal title={editing ? "Editar Produto" : "Novo Produto"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nome *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" />
            <Input label="Descrição (opcional)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Valor de Venda (R$) *" type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
              <Input label="Custo (R$) *" type="number" min="0" step="0.01" value={form.custo} onChange={e => setForm(f => ({ ...f, custo: e.target.value }))} placeholder="0,00" />
            </div>
            {form.valor && form.custo && !isNaN(form.valor) && !isNaN(form.custo) && Number(form.valor) > 0 && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#16A34A", fontWeight: 600 }}>
                💰 Margem: {(((form.valor - form.custo) / form.valor) * 100).toFixed(1)}% — Lucro por unidade: {fmtMoney(form.valor - form.custo)}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="secondary" onClick={closeModal}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}</Btn>
            </div>
          </div>
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Excluir Produto" onClose={() => setConfirmDel(null)}>
          <p style={{ color: "#475569", marginTop: 0 }}>Tem certeza que deseja excluir <strong>{confirmDel.nome}</strong>?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn danger onClick={() => handleRemove(confirmDel.id)}>🗑️ Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
