import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkBase = 'relative px-3 py-2 text-sm font-medium transition-colors duration-200';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <span className="relative">
          {children}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
            />
          )}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 shadow-card">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow-sm"
            >
              <CreditCard size={18} className="text-white" />
            </motion.div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Tele<span className="text-gradient">Card</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/cards">Cards</NavItem>
            {user && <NavItem to="/orders">Orders</NavItem>}
            {user?.role === 'ADMIN' && <NavItem to="/admin">Admin</NavItem>}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <Link to="/cart" className="relative rounded-xl p-2.5 text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
                <ShoppingCart size={19} />
                <AnimatePresence>
                  {cart.totalItems > 0 && (
                    <motion.span
                      key={cart.totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[10px] font-bold text-white"
                    >
                      {cart.totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[11px] font-bold uppercase">
                    {user.name?.[0] || 'U'}
                  </span>
                  <span className="hidden sm:block">{user.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="glass-strong absolute right-0 mt-2 w-48 overflow-hidden rounded-xl py-1 shadow-card"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                      >
                        <User size={15} /> Profile
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                        >
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-300 hover:bg-white/5"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-glow rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-glow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button className="rounded-xl p-2.5 text-slate-300 md:hidden" onClick={() => setOpen((o) => !o)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="glass-strong mt-2 flex flex-col gap-1 rounded-2xl p-3">
                <Link onClick={() => setOpen(false)} to="/" className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">Home</Link>
                <Link onClick={() => setOpen(false)} to="/cards" className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">Cards</Link>
                {user && <Link onClick={() => setOpen(false)} to="/orders" className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">Orders</Link>}
                {!user && (
                  <>
                    <Link onClick={() => setOpen(false)} to="/login" className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">Log in</Link>
                    <Link onClick={() => setOpen(false)} to="/register" className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Sign up</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
