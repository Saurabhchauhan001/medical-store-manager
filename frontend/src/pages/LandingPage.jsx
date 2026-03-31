import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Boxes,
  ChartColumnBig,
  Pill,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
} from 'lucide-react';

const featureCards = [
  {
    icon: Boxes,
    title: 'Inventory That Thinks Ahead',
    description: 'Track batches, prices, low stock, and expiry risk before it hurts your counter sales.',
  },
  {
    icon: ReceiptText,
    title: 'Fast Billing Support',
    description: 'Record medicine sales quickly and keep daily revenue and profit visible in real time.',
  },
  {
    icon: Truck,
    title: 'Supplier Coordination',
    description: 'Manage your suppliers, purchases, and restocking history from one place.',
  },
  {
    icon: BellRing,
    title: 'Expiry & Reorder Alerts',
    description: 'Spot expiring stock and urgent reorder needs early so your shelves stay healthy.',
  },
];

const workflow = [
  'Add batches with cost price, selling price, and expiry dates.',
  'Record supplier purchases to increase stock automatically.',
  'Sell medicines and watch revenue, profit, and stock update live.',
  'Review alerts, top movers, and daily activity before closing the shop.',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.16),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_44%,_#08121f_100%)] text-slate-100">
      <header className="border-b border-white/8 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-primary to-emerald-400 text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-white">PharmaSync</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Medical Store Suite</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/8"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <Sparkles size={16} />
              Built for pharmacy counters, shelves, and daily decisions
            </div>
            <h1 className="font-display mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">
              Run your medical store with calm, clarity, and fewer stock surprises.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              PharmaSync helps you handle medicines, suppliers, billing insights, and expiry alerts in one focused dashboard built for everyday shop operations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
              >
                Start Managing
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/8"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Fast setup</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">1 app</p>
                <p className="mt-2 text-sm text-slate-400">Inventory, suppliers, reports, and alerts together.</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Daily visibility</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">Live</p>
                <p className="mt-2 text-sm text-slate-400">Revenue, profit, fast movers, and low stock in real time.</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Operational focus</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">Less waste</p>
                <p className="mt-2 text-sm text-slate-400">Expiry and replenishment signals before stock becomes a problem.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-400/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">Today at a glance</p>
                  <h2 className="font-display mt-2 text-2xl font-bold text-white">Store pulse</h2>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                  <ChartColumnBig size={22} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/8 p-5">
                  <p className="text-sm text-cyan-100/80">Low stock shortlist</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Pill size={16} className="text-cyan-300" />
                        <span className="text-sm text-slate-200">Amoxicillin 250mg</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-300">14 left</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Pill size={16} className="text-cyan-300" />
                        <span className="text-sm text-slate-200">Vitamin C 1000mg</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-300">18 left</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/8 p-5">
                  <p className="text-sm text-emerald-100/80">Counter performance</p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue today</p>
                      <p className="font-display mt-1 text-3xl font-bold text-white">$2,480</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-900/50 px-4 py-3">
                        <p className="text-xs text-slate-400">Profit</p>
                        <p className="mt-1 font-semibold text-emerald-300">$610</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900/50 px-4 py-3">
                        <p className="text-xs text-slate-400">Alerts</p>
                        <p className="mt-1 font-semibold text-amber-300">6 active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">What the app covers</p>
                    <p className="mt-1 font-display text-xl font-semibold text-white">One workflow from shelf to sale</p>
                  </div>
                  <Stethoscope className="text-cyan-300" size={22} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/55 px-4 py-3 text-sm text-slate-300">Batch and expiry tracking</div>
                  <div className="rounded-2xl bg-slate-900/55 px-4 py-3 text-sm text-slate-300">Supplier purchase records</div>
                  <div className="rounded-2xl bg-slate-900/55 px-4 py-3 text-sm text-slate-300">Daily sales and profit view</div>
                  <div className="rounded-2xl bg-slate-900/55 px-4 py-3 text-sm text-slate-300">Low stock and expiry alerts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Core Features</p>
            <h2 className="font-display mt-3 text-4xl font-bold text-white">The essential tools a medical store needs every day.</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="group rounded-[2rem] border border-white/8 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/15 text-cyan-200">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/8 bg-white/5 p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Daily Flow</p>
              <h2 className="font-display mt-3 text-4xl font-bold text-white">Built around the rhythm of a pharmacy counter.</h2>
            </div>

            <div className="grid gap-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[1.75rem] border border-white/8 bg-slate-950/45 p-5">
                  <div className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/15 text-lg font-bold text-cyan-200">
                    0{index + 1}
                  </div>
                  <p className="pt-2 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/8 bg-[linear-gradient(135deg,_rgba(34,211,238,0.16),_rgba(15,23,42,0.6)_46%,_rgba(16,185,129,0.14))] p-8 sm:p-10">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/70">Ready To Start</p>
              <h2 className="font-display mt-3 text-4xl font-bold text-white">Bring your stock, supplier, and sales operations into one cleaner workflow.</h2>
              <p className="mt-4 text-slate-200/90">
                Launch the app, sign in, and start managing your store with a dashboard that keeps the essentials visible.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
              >
                Continue To Login
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 py-3.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/12"
              >
                Open Demo Access
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
