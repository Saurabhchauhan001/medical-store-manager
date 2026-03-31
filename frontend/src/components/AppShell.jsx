import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BellRing,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react';
import api from '../lib/api';

const navItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory', name: 'Inventory', icon: Package },
  { path: '/suppliers', name: 'Suppliers', icon: Users },
  { path: '/alerts', name: 'Alerts', icon: BellRing },
];

export default function AppShell() {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchAlertCount = async () => {
      try {
        const response = await api.get('/alerts');

        if (active) {
          setAlertCount(response.data.length);
        }
      } catch {
        if (active) {
          setAlertCount(0);
        }
      }
    };

    fetchAlertCount();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-slate-100 lg:flex">
      <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col lg:border-r lg:border-white/10 lg:bg-slate-950/40 lg:backdrop-blur-xl">
        <div className="flex items-center gap-3 px-8 py-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-cyan-400 to-emerald-400 text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-white">PharmaSync</p>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Store Control</p>
          </div>
        </div>

        <nav className="px-4">
          <div className="space-y-2 rounded-3xl border border-white/5 bg-white/3 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-cyan-400/12 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] border border-cyan-300/15'
                      : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
                  }`}
                >
                  <div className={`${isActive ? 'text-cyan-300' : 'text-slate-500'} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Alerts' && alertCount > 0 && (
                    <span className="ml-auto rounded-full border border-red-400/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-200">
                      {alertCount > 9 ? '9+' : alertCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Simple Mode</p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-white">Daily store focus</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Keep medicines searchable, stock healthy, and expiry dates visible without extra clutter.
            </p>
            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
              <p className="text-sm text-slate-300">Alerts</p>
              <p className="mt-1 text-2xl font-semibold text-white">{alertCount}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-cyan-400 to-emerald-400 text-white shadow-lg shadow-cyan-500/20">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">PharmaSync</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">Store Control</p>
              </div>
            </Link>
            <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200">
              {alertCount} alerts
            </span>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-10%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[140px]" />
            <div className="absolute bottom-[-12%] right-[-8%] h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-xs ${
                    isActive
                      ? 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
                      : 'border-white/8 bg-white/4 text-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{item.name}</span>
                  {item.name === 'Alerts' && alertCount > 0 && (
                    <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-200">
                      {alertCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
