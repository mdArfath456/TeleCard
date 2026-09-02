import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/api/user/profile', profileForm);
      await refresh();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.put('/api/user/change-password', pwForm);
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed');
    } finally {
      setSavingPw(false);
    }
  };

  const deactivate = async () => {
    if (!confirm('Deactivate your account? This cannot be undone from here.')) return;
    try {
      await api.delete('/api/user/account');
      await logout();
      toast.success('Account deactivated');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-xl font-bold text-white">
            {user?.name?.[0]}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{user?.name}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Full name</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5">
              <User size={15} className="text-slate-500" />
              <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-transparent text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Phone</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5">
              <Phone size={15} className="text-slate-500" />
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-transparent text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email (read-only)</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 opacity-60">
              <Mail size={15} className="text-slate-500" />
              <span className="text-sm text-slate-400">{user?.email}</span>
            </div>
          </div>
          <button disabled={savingProfile} className="btn-glow rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60">
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display mb-4 text-lg font-bold text-white">Change password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            ['currentPassword', 'Current password'],
            ['newPassword', 'New password'],
            ['confirmPassword', 'Confirm new password'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5">
                <Lock size={15} className="text-slate-500" />
                <input
                  type="password"
                  required
                  value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  className="w-full bg-transparent text-sm text-white"
                />
              </div>
            </div>
          ))}
          <button disabled={savingPw} className="btn-glow rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60">
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl border border-rose-500/20 p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2 text-rose-300">
          <ShieldAlert size={16} />
          <h2 className="font-display text-lg font-bold">Danger zone</h2>
        </div>
        <p className="mb-4 text-sm text-slate-400">Deactivating your account disables login. Contact support to reactivate.</p>
        <button onClick={deactivate} className="flex items-center gap-2 rounded-xl border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10">
          <LogOut size={15} /> Deactivate account
        </button>
      </motion.div>
    </div>
  );
}
