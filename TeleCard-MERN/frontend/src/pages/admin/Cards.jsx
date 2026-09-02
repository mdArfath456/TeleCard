import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { money } from '../../components/CardTile';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

const empty = {
  cardName: '', cardType: 'CREDIT', cardNetwork: 'VISA', validity: '5 years', price: '',
  annualFee: '', interestRate: '', creditLimit: '', cashWithdrawalLimit: '',
  rewards: '', benefits: '', eligibility: '', description: '', imageUrl: '', stock: 0,
  status: 'ACTIVE', categoryId: '',
};

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () =>
    Promise.all([api.get('/api/cards/admin/all'), api.get('/api/categories/admin/all')])
      .then(([c, cat]) => { setCards(c.data); setCategories(cat.data); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing('new'); setForm({ ...empty, categoryId: categories[0]?.id || '' }); };
  const startEdit = (c) => {
    setEditing(c.id);
    setForm({
      cardName: c.cardName, cardType: c.cardType, cardNetwork: c.cardNetwork, validity: c.validity || '',
      price: c.price, annualFee: c.annualFee ?? '', interestRate: c.interestRate ?? '', creditLimit: c.creditLimit ?? '',
      cashWithdrawalLimit: c.cashWithdrawalLimit ?? '', rewards: c.rewards || '', benefits: c.benefits || '',
      eligibility: c.eligibility || '', description: c.description || '', imageUrl: c.imageUrl || '',
      stock: c.stock, status: c.status, categoryId: c.categoryId,
    });
  };
  const cancel = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    ['annualFee', 'interestRate', 'creditLimit', 'cashWithdrawalLimit'].forEach((k) => {
      payload[k] = payload[k] === '' ? undefined : Number(payload[k]);
    });
    try {
      if (editing === 'new') {
        await api.post('/api/cards/admin', payload);
        toast.success('Card created');
      } else {
        await api.put(`/api/cards/admin/${editing}`, payload);
        toast.success('Card updated');
      }
      cancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this card?')) return;
    try {
      await api.delete(`/api/cards/admin/${id}`);
      toast.success('Card deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Loader label="Loading cards" />;

  return (
    <div>
      <AdminTabs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Cards</h1>
        <button onClick={startNew} className="btn-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm">
          <Plus size={15} /> New card
        </button>
      </div>

      {editing === 'new' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-4 rounded-2xl p-5">
          <CardForm form={form} setForm={setForm} categories={categories} onSave={save} onCancel={cancel} />
        </motion.div>
      )}

      <div className="space-y-3">
        {cards.map((c) => (
          <motion.div key={c.id} layout className="glass rounded-2xl p-5">
            {editing === c.id ? (
              <CardForm form={form} setForm={setForm} categories={categories} onSave={save} onCancel={cancel} />
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-white">{c.cardName}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{c.cardType} · {c.cardNetwork} · {c.categoryName} · Stock {c.stock}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="font-semibold text-white">{money(c.price)}</p>
                  <button onClick={() => startEdit(c)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil size={15} /></button>
                  <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 size={15} /></button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600';

function CardForm({ form, setForm, categories, onSave, onCancel }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Card name" span><input className={inputCls} value={form.cardName} onChange={set('cardName')} /></Field>
      <Field label="Category">
        <select className={inputCls} value={form.categoryId} onChange={set('categoryId')}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Type"><input className={inputCls} value={form.cardType} onChange={set('cardType')} placeholder="CREDIT / DEBIT / BUSINESS" /></Field>
      <Field label="Network"><input className={inputCls} value={form.cardNetwork} onChange={set('cardNetwork')} placeholder="VISA / MASTERCARD / RUPAY" /></Field>
      <Field label="Validity"><input className={inputCls} value={form.validity} onChange={set('validity')} /></Field>
      <Field label="Price (₹)"><input type="number" className={inputCls} value={form.price} onChange={set('price')} /></Field>
      <Field label="Stock"><input type="number" className={inputCls} value={form.stock} onChange={set('stock')} /></Field>
      <Field label="Annual fee (₹)"><input type="number" className={inputCls} value={form.annualFee} onChange={set('annualFee')} /></Field>
      <Field label="Interest rate (%)"><input type="number" className={inputCls} value={form.interestRate} onChange={set('interestRate')} /></Field>
      <Field label="Credit limit (₹)"><input type="number" className={inputCls} value={form.creditLimit} onChange={set('creditLimit')} /></Field>
      <Field label="Cash withdrawal limit (₹)"><input type="number" className={inputCls} value={form.cashWithdrawalLimit} onChange={set('cashWithdrawalLimit')} /></Field>
      <Field label="Status">
        <select className={inputCls} value={form.status} onChange={set('status')}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
        </select>
      </Field>
      <Field label="Image URL" span><input className={inputCls} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></Field>
      <Field label="Description" span><textarea rows={2} className={inputCls} value={form.description} onChange={set('description')} /></Field>
      <Field label="Rewards" span><textarea rows={2} className={inputCls} value={form.rewards} onChange={set('rewards')} /></Field>
      <Field label="Benefits" span><textarea rows={2} className={inputCls} value={form.benefits} onChange={set('benefits')} /></Field>
      <Field label="Eligibility" span><textarea rows={2} className={inputCls} value={form.eligibility} onChange={set('eligibility')} /></Field>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"><X size={14} /> Cancel</button>
        <button onClick={onSave} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"><Check size={14} /> Save</button>
      </div>
    </div>
  );
}
