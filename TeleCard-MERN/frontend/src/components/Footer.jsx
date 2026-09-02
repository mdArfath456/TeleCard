import { CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
              <CreditCard size={15} className="text-white" />
            </div>
            <span className="font-display text-sm font-bold text-white">
              Tele<span className="text-gradient">Card</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TeleCard. Built for demo purposes — no real cards are issued.</p>
        </div>
      </div>
    </footer>
  );
}
