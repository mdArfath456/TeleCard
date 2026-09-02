import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, ShieldPlus, ShieldMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/api/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const block = async (id) => { await api.put(`/api/admin/users/${id}/block`); toast.success('User blocked'); load(); };
  const activate = async (id) => { await api.put(`/api/admin/users/${id}/activate`); toast.success('User activated'); load(); };
  const changeRole = async (id, role) => {
    await api.put(`/api/admin/users/${id}/role`, null, { params: { role } });
    toast.success('Role updated');
    load();
  };

  if (loading) return <Loader label="Loading users" />;

  return (
    <div>
      <AdminTabs />
      <h1 className="font-display mb-6 text-3xl font-bold text-white">Users</h1>

      <div className="space-y-3">
        {users.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{u.name}</p>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">{u.role}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{u.email} · {u.phone}</p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={u.status} />
              {u.role === 'USER' ? (
                <button onClick={() => changeRole(u.id, 'ADMIN')} title="Promote to admin" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                  <ShieldPlus size={16} />
                </button>
              ) : (
                <button onClick={() => changeRole(u.id, 'USER')} title="Demote to user" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                  <ShieldMinus size={16} />
                </button>
              )}
              {u.status === 'BLOCKED' ? (
                <button onClick={() => activate(u.id)} title="Activate" className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/10">
                  <CheckCircle2 size={16} />
                </button>
              ) : (
                <button onClick={() => block(u.id)} title="Block" className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10">
                  <Ban size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
