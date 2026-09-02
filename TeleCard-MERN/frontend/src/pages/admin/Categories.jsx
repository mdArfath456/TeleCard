import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

const empty = { name: '', description: '', active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(empty);

  const load = () => api.get('/api/categories/admin/all').then(({ data }) => setCategories(data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const startEdit = (c) => { setEditing(c.id); setForm({ name: c.name, description: c.description || '', active: c.active }); };
  const startNew = () => { setEditing('new'); setForm(empty); };
  const cancel = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    try {
      if (editing === 'new') {
        await api.post('/api/categories/admin', form);
        toast.success('Category created');
      } else {
        await api.put(`/api/categories/admin/${editing}`, form);
        toast.success('Category updated');
      }
      cancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/categories/admin/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (c) => {
    try {
      await api.put(`/api/categories/admin/${c.id}/${c.active ? 'deactivate' : 'activate'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <Loader label="Loading categories" />;

  return (
    <div>
      <AdminTabs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Categories</h1>
        <button onClick={startNew} className="btn-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm">
          <Plus size={15} /> New category
        </button>
      </div>

      {editing === 'new' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-4 rounded-2xl p-5">
          <CategoryForm form={form} setForm={setForm} onSave={save} onCancel={cancel} />
        </motion.div>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <motion.div key={c.id} layout className="glass rounded-2xl p-5">
            {editing === c.id ? (
              <CategoryForm form={form} setForm={setForm} onSave={save} onCancel={cancel} />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{c.name}</p>
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'}`}
                    >
                      {c.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  {c.description && <p className="mt-1 text-sm text-slate-400">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2">
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

function CategoryForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Category name"
        className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 sm:col-span-2"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        rows={2}
        className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 sm:col-span-2"
      />
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
        Active
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"><X size={14} /> Cancel</button>
        <button onClick={onSave} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"><Check size={14} /> Save</button>
      </div>
    </div>
  );
}
