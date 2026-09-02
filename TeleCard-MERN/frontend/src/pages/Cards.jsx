import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import CardTile from '../components/CardTile';
import Loader from '../components/Loader';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    else if (categoryId) params.categoryId = categoryId;

    const t = setTimeout(() => {
      api
        .get('/api/cards', { params })
        .then(({ data }) => setCards(data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(t);
  }, [search, categoryId]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Browse cards</h1>
        <p className="mt-1 text-sm text-slate-400">Filter by category or search across our whole catalog.</p>
      </motion.div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-3">
          <Search size={16} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type or network…"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-600"
          />
        </div>

        <div className="glass flex items-center gap-2 overflow-x-auto rounded-xl px-2 py-2">
          <SlidersHorizontal size={14} className="ml-2 shrink-0 text-slate-500" />
          <button
            onClick={() => { setCategoryId(''); setSearch(''); }}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !categoryId ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategoryId(c.id); setSearch(''); }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryId === c.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader label="Fetching cards" />
      ) : cards.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center text-slate-400">No cards match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <CardTile key={c.id} card={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
