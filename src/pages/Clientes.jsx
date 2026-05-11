import { useState } from "react";
import { useCollection } from "../useCollection";
import { fmtDate } from "../utils";
import { PageHeader, Card, Btn, Input, Modal, EmptyState } from "../components";

const EMPTY = { nome: "", telefone: "" };

export default function Clientes() {
  const { data: clientes, loading, add, update, remove } = useCollection("clientes");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = clientes.filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone?.includes(search)
  );

  function openNew() { setForm(EMPTY); setEditing(null); setModal(true); }
  function openEdit(c) { setForm({ nome: c.nome, telefone: c.telefone || "" }); setEditing(c.id); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); }

  async function save() {
    if (!form.nome.trim()) return alert("Nome é obrigatório.");
    setSaving(true);
    try {
      if (editing) {
        await update(editing, { nome: form.nome, telefone: form.telefone });
      } else {
        await add({ nome: form.nome, telefone: form.telefone });
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    await remove(id);
    setConfirmDel(null);
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}`}
        action={<Btn onClick={openNew}>＋ Novo Cliente</Btn>}
      />
      <Card style={{ marginBottom: 20 }}>
        <Input placeholder="🔍  Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
      </Card>
      {loading ? (
        <Card><EmptyState icon="⏳" title="Carregando..." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="👤" title="Nenhum cliente encontrado" subtitle={search ? "Tente outro termo." : "Clique em '+ Novo Cliente' para começar."} /></Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F8FB" }}>
                {["Nome", "Telefone", "Cadastrado em", "Ações"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderTop: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#1A1A2E" }}>{c.nome}</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>{c.telefone || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#94A3B8", fontSize: 13 }}>{fmtDate(c.criadoEm)}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn small variant="secondary" onClick={() => openEdit(c)}>✏️ Editar</Btn>
                      <Btn small danger onClick={() => setConfirmDel(c)}>🗑️</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {modal && (
        <Modal title={editing ? "Editar Cliente" : "Novo Cliente"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nome *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
            <Input label="Telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="secondary" onClick={closeModal}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}</Btn>
            </div>
          </div>
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Excluir Cliente" onClose={() => setConfirmDel(null)}>
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
