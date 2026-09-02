import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { money } from '../../components/CardTile';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

const FILTERS = ['ALL', 'PAYMENT_SUBMITTED', 'PROCESSING', 'COMPLETED', 'PAYMENT_REJECTED', 'PAYMENT_PENDING'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/api/orders/admin/all').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading orders" />;

  const visible = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <AdminTabs />
      <h1 className="font-display mb-6 text-3xl font-bold text-white">Orders</h1>

      <div className="glass mb-6 flex items-center gap-1 overflow-x-auto rounded-xl p-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-slate-400">No orders in this view.</div>
        ) : (
          visible.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/admin/orders/${o.id}`} className="glass flex items-center justify-between rounded-2xl p-5 transition-shadow hover:shadow-glow-sm">
                <div>
                  <p className="font-mono text-xs text-slate-500">{o.orderNumber}</p>
                  <p className="mt-1 font-medium text-white">{o.userName} · {money(o.totalAmount)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{o.items.length} item(s) · {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
