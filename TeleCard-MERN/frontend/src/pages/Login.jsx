import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function Login() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading) return <Loader label="Checking your session" />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full rounded-3xl p-8 shadow-card"
      >
        <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Log in to manage your cards and orders.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-brand-500 transition-colors">
              <Mail size={16} className="text-slate-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-brand-500 transition-colors">
              <Lock size={16} className="text-slate-500" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-500 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-glow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
