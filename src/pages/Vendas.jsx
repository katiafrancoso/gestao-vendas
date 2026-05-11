import { useState } from "react";
import { useCollection } from "../useCollection";
import { fmtMoney, fmtDate } from "../utils";
import { PageHeader, Card, Btn, Input, Select, Modal, EmptyState, Badge } from "../components";

const PAGAMENTOS = ["PIX", "Dinheiro", "Cartão de Débito", "Cartão de Crédito", "Boleto", "Transferência"];
const STATUS_COLOR = { Pago: "green", Pendente: "yellow", Cancelado: "red" };

const EMPTY_FORM = {
  clienteId: "", clienteNome: "",
  itens: [], desconto: "", tipoDesconto: "R$",
  modoPagamento: "", dataVenda: new Date().toISOString().slice(0, 10),
  dataPagamento: "", status: "Pendente", obs: "",
};

export default function Vendas() {
  const { data: vendas, loading, add, update, remove } = useCollection("vendas");
  const { data: clientes } = useCollection("clientes");
  const { data: produtos } = useCollection("produtos");

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [itemProdId, setItemProdId] = useState("");
  const [itemQtd, setItemQtd] = useState("1");
  const [saving, setSaving] = useState(false);

  function openNew() { setForm(EMPTY_FORM); setEditing(null); setItemProdId(""); setItemQtd("1"); setModal(true); }
  function openEdit(v) {
    setForm({ clienteId: v.clienteId, clienteNome: v.clienteNome || "", itens: v.itens || [], desconto: String(v.desconto || ""), tipoDesconto: v.tipoDesconto || "R$", modoPagamento: v.modoPagamento || "", dataVenda: v.dataVenda || "", dataPagamento: v.dataPagamento || "", status: v.status || "Pendente", obs: v.obs || "" });
    setEditing(v.id); setItemProdId(""); setItemQtd("1"); setModal(true);
  }
  function closeModal() { setModal(false); setEditing(null); }

  function addItem() {
    if (!itemProdId) return;
    const prod = produtos.find(p => p.id === itemProdId);
    if (!prod) return;
    const qtd = Math.max(1, Number(itemQtd) || 1);
    setForm(f => {
      const existing = f.itens.findIndex(i => i.produtoId === itemProdId);
      if (existing >= 0) {
        const itens = [...f.itens];
        itens[existing] = { ...itens[existing], qtd: itens[existing].qtd + qtd };
        return { ...f, itens };
      }
      return { ...f, itens: [...f.itens, { produtoId: prod.id, nome: prod.nome, valor: prod.valor, custo: prod.custo, qtd }] };
    });
    setItemProdId(""); setItemQtd("1");
  }

  function removeItem(idx) { setForm(f => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) })); }

  function calcSubtotal(itens) { return itens.reduce((s, i) => s + i.valor * i.qtd, 0); }
  function calcDesconto(sub, desc, tipo) { const d = Number(desc) || 0; return tipo === "%" ? sub * (d / 100) : d; }
  function calcTotal(itens, desc, tipo) { return Math.max(0, calcSubtotal(itens) - calcDesconto(calcSubtotal(itens), desc, tipo)); }

  async function save() {
    if (!form.clienteId) return alert("Selecione um cliente.");
    if (form.itens.length === 0) return alert("Adicione pelo menos um produto.");
    if (!form.modoPagamento) return alert("Selecione o modo de pagamento.");
    if (!form.dataVenda) return alert("Informe a data da venda.");
    const subtotal = calcSubtotal(form.itens);
    const descontoVal = calcDesconto(subtotal, form.desconto, form.tipoDesconto);
    const total = Math.max(0, subtotal - descontoVal);
    const custo = form.itens.reduce((s, i) => s + i.custo * i.qtd, 0);
    const data = { ...form, subtotal, descontoVal, total, custo, desconto: Number(form.desconto) || 0 };
    setSaving(true);
    try {
      if (editing) { await update(editing, data); }
      else { await add(data); }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleRemove(id) { await remove(id); setConfirmDel(null); }

  async function markPago(id, v) {
    await update(id, { status: "Pago", dataPagamento: v.dataPagamento || new Date().toISOString().slice(0, 10) });
  }

  const clienteNome = (id) => clientes.find(c => c.id === id)?.nome || "—";

  const filtered = vendas
    .filter(v => filtroStatus === "Todos" || v.status === filtroStatus)
    .filter(v => (v.clienteNome || clienteNome(v.clienteId)).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.dataVenda || "").localeCompare(a.dataVenda || ""));

  const subtotalForm = calcSubtotal(form.itens);
  const totalForm = calcTotal(form.itens, form.desconto, form.tipoDesconto);

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle={`${vendas.length} venda${vendas.length !== 1 ? "s" : ""} registrada${vendas.length !== 1 ? "s" : ""}`}
        action={<Btn onClick={openNew}>＋ Nova Venda</Btn>}
      />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input placeholder="🔍  Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Todos", "Pendente", "Pago", "Cancelado"].map(s => (
              <button key={s} onClick={() => setFiltroStatus(s)} style={{
                padding: "8px 14px", borderRadius: 8, border: "1.5px solid",
                borderColor: filtroStatus === s ? "#6366F1" : "#E2E8F0",
                background: filtroStatus === s ? "#6366F1" : "#fff",
                color: filtroStatus === s ? "#fff" : "#64748B",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total em Vendas", value: fmtMoney(vendas.reduce((s, v) => s + (v.total || 0), 0)), color: "#6366F1" },
          { label: "Recebido", value: fmtMoney(vendas.filter(v => v.status === "Pago").reduce((s, v) => s + (v.total || 0), 0)), color: "#16A34A" },
          { label: "Pendente", value: fmtMoney(vendas.filter(v => v.status === "Pendente").reduce((s, v) => s + (v.total || 0), 0)), color: "#D97706" },
          { label: "Lucro Bruto", value: fmtMoney(vendas.filter(v => v.status === "Pago").reduce((s, v) => s + ((v.total || 0) - (v.custo || 0)), 0)), color: "#0EA5E9" },
        ].map(c => (
          <Card key={c.label} style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.value}</div>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card><EmptyState icon="⏳" title="Carregando..." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="🛒" title="Nenhuma venda encontrada" subtitle="Clique em '+ Nova Venda' para começar." /></Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F8FB" }}>
                {["Cliente", "Itens", "Total", "Desconto", "Pagamento", "Data", "Status", "Ações"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} style={{ borderTop: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: "#1A1A2E" }}>{v.clienteNome || clienteNome(v.clienteId)}</td>
                  <td style={{ padding: "13px 16px", color: "#64748B", fontSize: 13 }}>{v.itens?.length} item{v.itens?.length !== 1 ? "s" : ""}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "#16A34A" }}>{fmtMoney(v.total)}</td>
                  <td style={{ padding: "13px 16px", color: "#64748B", fontSize: 13 }}>{v.descontoVal > 0 ? fmtMoney(v.descontoVal) : "—"}</td>
                  <td style={{ padding: "13px 16px", color: "#475569", fontSize: 13 }}>{v.modoPagamento}</td>
                  <td style={{ padding: "13px 16px", color: "#64748B", fontSize: 13 }}>{fmtDate(v.dataVenda)}</td>
                  <td style={{ padding: "13px 16px" }}><Badge color={STATUS_COLOR[v.status] || "gray"}>{v.status}</Badge></td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="secondary" onClick={() => setDetailView(v)}>👁️</Btn>
                      <Btn small variant="secondary" onClick={() => openEdit(v)}>✏️</Btn>
                      {v.status === "Pendente" && <Btn small variant="ghost" onClick={() => markPago(v.id, v)}>✔ Pago</Btn>}
                      <Btn small danger onClick={() => setConfirmDel(v)}>🗑️</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && (
        <Modal title={editing ? "Editar Venda" : "Nova Venda"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Select label="Cliente *" value={form.clienteId} onChange={e => {
              const c = clientes.find(c => c.id === e.target.value);
              setForm(f => ({ ...f, clienteId: e.target.value, clienteNome: c?.nome || "" }));
            }}>
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>Produtos *</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={itemProdId} onChange={e => setItemProdId(e.target.value)} style={{ flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, background: "#FAFAF9" }}>
                  <option value="">Selecionar produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} — {fmtMoney(p.valor)}</option>)}
                </select>
                <input type="number" min="1" value={itemQtd} onChange={e => setItemQtd(e.target.value)} style={{ width: 64, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#FAFAF9", textAlign: "center" }} />
                <Btn onClick={addItem} variant="secondary">+ Add</Btn>
              </div>
              {form.itens.length > 0 && (
                <div style={{ border: "1px solid #E8E8EC", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr style={{ background: "#F8F8FB" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#94A3B8", fontWeight: 600 }}>Produto</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: "#94A3B8", fontWeight: 600 }}>Qtd</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", color: "#94A3B8", fontWeight: 600 }}>Subtotal</th>
                      <th></th>
                    </tr></thead>
                    <tbody>
                      {form.itens.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "8px 12px" }}>{item.nome}</td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.qtd}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#16A34A" }}>{fmtMoney(item.valor * item.qtd)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 12px", background: "#F8F8FB", textAlign: "right", fontWeight: 700, color: "#1A1A2E", fontSize: 14, borderTop: "1px solid #E8E8EC" }}>
                    Subtotal: {fmtMoney(subtotalForm)}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Desconto</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" min="0" step="0.01" value={form.desconto} onChange={e => setForm(f => ({ ...f, desconto: e.target.value }))} placeholder="0" style={{ flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#FAFAF9" }} />
                <select value={form.tipoDesconto} onChange={e => setForm(f => ({ ...f, tipoDesconto: e.target.value }))} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#FAFAF9" }}>
                  <option value="R$">R$</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>

            {form.itens.length > 0 && (
              <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#4338CA" }}>
                  <span>Total da Venda</span><span>{fmtMoney(totalForm)}</span>
                </div>
              </div>
            )}

            <Select label="Modo de Pagamento *" value={form.modoPagamento} onChange={e => setForm(f => ({ ...f, modoPagamento: e.target.value }))}>
              <option value="">Selecione...</option>
              {PAGAMENTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Data da Venda *" type="date" value={form.dataVenda} onChange={e => setForm(f => ({ ...f, dataVenda: e.target.value }))} />
              <Input label="Data do Pagamento" type="date" value={form.dataPagamento} onChange={e => setForm(f => ({ ...f, dataPagamento: e.target.value }))} />
            </div>

            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Cancelado">Cancelado</option>
            </Select>

            <Input label="Observações" value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} placeholder="Anotações opcionais..." />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="secondary" onClick={closeModal}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar Alterações" : "Registrar Venda"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {detailView && (
        <Modal title={`Venda — ${detailView.clienteNome || clienteNome(detailView.clienteId)}`} onClose={() => setDetailView(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><span style={{ color: "#94A3B8", fontSize: 12 }}>Status</span><br /><Badge color={STATUS_COLOR[detailView.status]}>{detailView.status}</Badge></div>
              <div><span style={{ color: "#94A3B8", fontSize: 12 }}>Pagamento</span><br /><strong>{detailView.modoPagamento}</strong></div>
              <div><span style={{ color: "#94A3B8", fontSize: 12 }}>Data da Venda</span><br /><strong>{fmtDate(detailView.dataVenda)}</strong></div>
              <div><span style={{ color: "#94A3B8", fontSize: 12 }}>Data Pagamento</span><br /><strong>{fmtDate(detailView.dataPagamento)}</strong></div>
            </div>
            <div style={{ border: "1px solid #E8E8EC", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#F8F8FB" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>Produto</th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>Qtd</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Unit.</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Total</th>
                </tr></thead>
                <tbody>
                  {detailView.itens?.map((item, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "8px 12px" }}>{item.nome}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.qtd}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmtMoney(item.valor)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmtMoney(item.valor * item.qtd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: "#F8F8FB", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#64748B" }}>Subtotal</span><span>{fmtMoney(detailView.subtotal)}</span></div>
              {detailView.descontoVal > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#64748B" }}>Desconto</span><span style={{ color: "#EF4444" }}>- {fmtMoney(detailView.descontoVal)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, borderTop: "1px solid #E8E8EC", paddingTop: 8, marginTop: 4 }}><span>Total</span><span style={{ color: "#6366F1" }}>{fmtMoney(detailView.total)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6, color: "#94A3B8" }}><span>Custo total</span><span>{fmtMoney(detailView.custo)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16A34A", fontWeight: 600 }}><span>Lucro bruto</span><span>{fmtMoney((detailView.total || 0) - (detailView.custo || 0))}</span></div>
            </div>
            {detailView.obs && <div style={{ color: "#64748B", fontSize: 13 }}><strong>Obs:</strong> {detailView.obs}</div>}
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir Venda" onClose={() => setConfirmDel(null)}>
          <p style={{ color: "#475569", marginTop: 0 }}>Deseja excluir esta venda de <strong>{confirmDel.clienteNome}</strong> no valor de <strong>{fmtMoney(confirmDel.total)}</strong>?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn danger onClick={() => handleRemove(confirmDel.id)}>🗑️ Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
