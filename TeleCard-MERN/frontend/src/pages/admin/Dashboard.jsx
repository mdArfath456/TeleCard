import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, Layers, ShoppingBag, Wallet, Users, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios';
import { money } from '../../components/CardTile';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

const TILES = [
  { key: 'cards', label: 'Cards', icon: CreditCard, to: '/admin/cards' },
  { key: 'categories', label: 'Categories', icon: Layers, to: '/admin/categories' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
  { key: 'payments', label: 'Pending payments', icon: Wallet, to: '/admin/payments' },
  { key: 'users', label: 'Customers', icon: Users, to: '/admin/users' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/cards/admin/all'),
      api.get('/api/categories/admin/all'),
      api.get('/api/orders/admin/all'),
      api.get('/api/payments/admin/submitted'),
      api.get('/api/admin/users/customers'),
    ])
      .then(([cards, categories, orders, payments, users]) => {
        const revenue = orders.data
          .filter((o) => ['PROCESSING', 'COMPLETED'].includes(o.status))
          .reduce((s, o) => s + o.totalAmount, 0);
        setStats({
          cards: cards.data.length,
          categories: categories.data.length,
          orders: orders.data.length,
          payments: payments.data.length,
          users: users.data.length,
          revenue,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;

  return (
    <div>
      <AdminTabs />
      <h1 className="font-display mb-1 text-3xl font-bold text-white">Admin dashboard</h1>
      <p className="mb-8 text-sm text-slate-400">Manage your catalog, orders and customers.</p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-8 rounded-2xl p-6">
        <p className="text-xs text-slate-500">Revenue from verified orders</p>
        <p className="font-display mt-1 text-3xl font-bold text-white">{money(stats.revenue)}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t, i) => (
          <motion.div key={t.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={t.to} className="glass card-shine flex items-center justify-between rounded-2xl p-6 transition-shadow hover:shadow-glow-sm">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/40 to-accent-500/30">
                  <t.icon size={18} className="text-accent-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats[t.key]}</p>
                <p className="text-sm text-slate-400">{t.label}</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-600" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
