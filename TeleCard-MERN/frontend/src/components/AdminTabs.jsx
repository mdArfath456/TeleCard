import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/cards', label: 'Cards' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminTabs() {
  return (
    <div className="glass mb-6 flex items-center gap-1 overflow-x-auto rounded-xl p-1.5">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
