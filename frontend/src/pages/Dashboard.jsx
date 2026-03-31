import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Clock3,
  Search,
  Package,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/format';

function getDaysUntilExpiry(expiry) {
  const expiryDate = new Date(expiry);

  if (Number.isNaN(expiryDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    stats: {
      medicines: 0,
      inventoryUnits: 0,
      alerts: 0,
      suppliers: 0,
      lowStock: 0,
      expiringSoon: 0,
    },
    alerts: [],
    reorderList: [],
    expiringSoon: [],
    recentActivity: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');

        const [
          inventoryResponse,
          alertResponse,
          supplierResponse,
          purchaseResponse,
        ] = await Promise.all([
          api.get('/inventory'),
          api.get('/alerts'),
          api.get('/suppliers'),
          api.get('/suppliers/purchases'),
        ]);

        const medicines = inventoryResponse.data;
        setInventory(medicines);
        const alerts = alertResponse.data;
        const purchases = purchaseResponse.data.slice(0, 6);
        const allLowStockMedicines = medicines
          .filter((medicine) => medicine.stock <= 20)
          .sort((left, right) => left.stock - right.stock);
        const allExpiringSoonMedicines = medicines
          .map((medicine) => ({
            ...medicine,
            daysUntilExpiry: getDaysUntilExpiry(medicine.expiry),
          }))
          .filter((medicine) => medicine.daysUntilExpiry >= 0 && medicine.daysUntilExpiry <= 90)
          .sort((left, right) => left.daysUntilExpiry - right.daysUntilExpiry);
        const lowStockMedicines = allLowStockMedicines.slice(0, 5);
        const expiringSoonMedicines = allExpiringSoonMedicines.slice(0, 5);
        const recentActivity = [
          ...purchases.map((purchase) => ({
            id: `purchase-${purchase.id}`,
            type: 'purchase',
            title: `${purchase.medicineName} restocked`,
            subtitle: `${purchase.supplierId?.name || purchase.supplierName || 'Supplier'} • ${purchase.quantity} units`,
            date: purchase.date,
          })),
        ]
          .sort((left, right) => new Date(right.date) - new Date(left.date))
          .slice(0, 8);

        setDashboard({
          stats: {
            medicines: medicines.length,
            inventoryUnits: medicines.reduce((sum, medicine) => sum + medicine.stock, 0),
            alerts: alerts.length,
            suppliers: supplierResponse.data.length,
            lowStock: allLowStockMedicines.length,
            expiringSoon: allExpiringSoonMedicines.length,
          },
          alerts: alerts.slice(0, 4),
          reorderList: lowStockMedicines,
          expiringSoon: expiringSoonMedicines,
          recentActivity,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Medicine Batches', value: dashboard.stats.medicines, icon: Package, color: 'text-cyan-300', bg: 'bg-cyan-400/10' },
    { title: 'Inventory Units', value: dashboard.stats.inventoryUnits, icon: Boxes, color: 'text-blue-300', bg: 'bg-blue-400/10' },
    { title: 'Low Stock Items', value: dashboard.stats.lowStock, icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-400/10' },
    { title: 'Expiring Soon', value: dashboard.stats.expiringSoon, icon: Clock3, color: 'text-orange-300', bg: 'bg-orange-400/10' },
    { title: 'Suppliers', value: dashboard.stats.suppliers, icon: Truck, color: 'text-violet-300', bg: 'bg-violet-400/10' },
    { title: 'Active Alerts', value: dashboard.stats.alerts, icon: AlertTriangle, color: 'text-red-300', bg: 'bg-red-500/10' },
  ];

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchedMedicines = inventory
    .filter((medicine) => medicine.name.toLowerCase().includes(normalizedSearch))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Dashboard</p>
        <h1 className="font-display mt-3 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-400">
          Medical store overview
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl">
          Search medicines quickly, spot low stock early, and keep expiry-sensitive batches under control.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div key={index} className="glass p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="glass p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-cyan-400 rounded-full"></span>
            Medicine Search
          </h2>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search medicine by name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/45 py-3 pl-12 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div className="mt-5 space-y-3">
              {normalizedSearch === '' ? (
                <p className="text-sm text-slate-500">Type a medicine name to find its batch, stock, and expiry quickly.</p>
              ) : matchedMedicines.length === 0 ? (
                <p className="text-sm text-slate-500">No medicine found for that name.</p>
              ) : (
                matchedMedicines.map((medicine) => {
                  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry);
                  const isOutOfStock = medicine.stock === 0;
                  const isLowStock = medicine.stock > 0 && medicine.stock <= 20;
                  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

                  return (
                    <div key={medicine.id} className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-100">{medicine.name}</p>
                          <p className="text-xs text-slate-500">Batch {medicine.batch}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            isOutOfStock
                              ? 'border-red-400/20 bg-red-500/10 text-red-200'
                              : isLowStock
                                ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                                : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                          }`}>
                            {medicine.stock} units
                          </span>
                          {isOutOfStock ? (
                            <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                              Low stock
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                              {daysUntilExpiry} days left
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                              Stable batch
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>Expiry date: {formatDate(medicine.expiry)}</p>
                        <Link to="/inventory" className="text-cyan-200 transition-colors hover:text-cyan-100">
                          Open inventory
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/inventory" className="p-4 rounded-2xl border border-white/5 bg-surfaceHover/30 hover:bg-surfaceHover/50 transition-colors flex flex-col items-center justify-center gap-3 text-center">
              <Package size={28} className="text-primary" />
              <span className="font-medium text-slate-200">Add Medicine</span>
            </Link>
            <Link to="/suppliers" className="p-4 rounded-2xl border border-white/5 bg-surfaceHover/30 hover:bg-surfaceHover/50 transition-colors flex flex-col items-center justify-center gap-3 text-center">
              <Truck size={28} className="text-violet-300" />
              <span className="font-medium text-slate-200">Manage Suppliers</span>
            </Link>
            <Link to="/alerts" className="p-4 rounded-2xl border border-white/5 bg-surfaceHover/30 hover:bg-surfaceHover/50 transition-colors flex flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle size={28} className="text-amber-300" />
              <span className="font-medium text-slate-200">Review Alerts</span>
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-white">Reorder Shortlist</h3>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Low Stock</span>
              </div>
              <div className="mt-5 space-y-3">
                {dashboard.reorderList.length === 0 ? (
                  <p className="text-sm text-slate-500">No low stock medicines right now.</p>
                ) : (
                  dashboard.reorderList.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-100">{medicine.name}</p>
                        <p className="text-xs text-slate-500">{medicine.batch}</p>
                      </div>
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        {medicine.stock} left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-white">Upcoming Expiries</h3>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Next 90 Days</span>
              </div>
              <div className="mt-5 space-y-3">
                {dashboard.expiringSoon.length === 0 ? (
                  <p className="text-sm text-slate-500">No batches expiring soon.</p>
                ) : (
                  dashboard.expiringSoon.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-100">{medicine.name}</p>
                        <p className="text-xs text-slate-500">Expires {formatDate(medicine.expiry)}</p>
                      </div>
                      <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                        {medicine.daysUntilExpiry} days
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                Priority Alerts
              </h2>
              <Link to="/alerts" className="inline-flex items-center gap-1 text-sm text-cyan-200 hover:text-cyan-100">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {dashboard.alerts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  No active alerts.
                </div>
              ) : (
                dashboard.alerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 relative overflow-hidden flex flex-col gap-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-amber-500"></div>
                    <span className="text-xs font-semibold text-red-400 capitalize">{alert.type.replace(/_/g, ' ')}</span>
                    <p className="text-sm text-slate-100">{alert.medicineName}</p>
                    <p className="text-xs leading-6 text-slate-400">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Recent Activity
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Latest</span>
            </div>

            <div className="space-y-3">
              {dashboard.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No recent restock activity yet.</p>
              ) : (
                dashboard.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/6 bg-white/3 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-100">{activity.title}</p>
                      <p className="text-sm text-slate-400">{activity.subtitle}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(activity.date)}</p>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      {activity.subtitle}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
