import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function Register() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) return <Loader label="Checking your session" />;
  if (user) return <Navigate to="/" replace />;

  const field = (key, label, icon, type = 'text', placeholder = '') => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-brand-500 transition-colors">
        {icon}
        <input
          type={type}
          required
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-600"
        />
      </div>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — welcome to TeleCard!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Join TeleCard to browse and order cards.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {field('name', 'Full name', <User size={16} className="text-slate-500" />, 'text', 'Arfath Ahmed')}
          {field('email', 'Email', <Mail size={16} className="text-slate-500" />, 'email', 'you@example.com')}
          {field('phone', 'Phone', <Phone size={16} className="text-slate-500" />, 'tel', '9876543210')}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-brand-500 transition-colors">
              <Lock size={16} className="text-slate-500" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-500 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {field('confirmPassword', 'Confirm password', <Lock size={16} className="text-slate-500" />, showPw ? 'text' : 'password', 'Repeat your password')}

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-glow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
