import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PackageOpen, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { money } from '../components/CardTile';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your orders" />;

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-bold text-white">Your orders</h1>

      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <PackageOpen size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No orders yet.</p>
          <Link to="/cards" className="mt-4 inline-block text-sm font-medium text-brand-400 hover:text-brand-300">
            Browse cards →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/orders/${o.id}`} className="glass card-shine flex items-center justify-between rounded-2xl p-5 transition-shadow hover:shadow-glow-sm">
                <div>
                  <p className="font-mono text-xs text-slate-500">{o.orderNumber}</p>
                  <p className="mt-1 font-medium text-white">{o.items.length} item(s) · {money(o.totalAmount)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
