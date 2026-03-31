import { useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, BellRing, Clock3, Info } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { formatDate } from '../lib/format';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setError('');
      const response = await api.get('/alerts');
      setAlerts(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return { icon: AlertOctagon, color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' };
      case 'high':
        return { icon: AlertTriangle, color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'High' };
      case 'medium':
        return { icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Monitor' };
      default:
        return { icon: Info, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Watch' };
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-danger/20 border-t-danger rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-amber-300">Alerts & Expiry Watch</h1>
        <p className="text-slate-400 mt-2">Review low stock and expiry-sensitive batches in one place.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-2 text-red-200">
                  <AlertOctagon size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Critical</p>
                  <p className="text-2xl font-bold text-slate-100">{alerts.filter((alert) => alert.severity === 'critical').length}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-200">
                  <BellRing size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Needs Action</p>
                  <p className="text-2xl font-bold text-slate-100">{alerts.filter((alert) => alert.severity === 'high').length}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-200">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Under Watch</p>
                  <p className="text-2xl font-bold text-slate-100">{alerts.filter((alert) => alert.severity !== 'critical' && alert.severity !== 'high').length}</p>
                </div>
              </div>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                <Info size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-200">All Clear</h2>
              <p className="mt-2 max-w-sm text-slate-400">There are no active alerts right now. Stock levels and expiry dates look healthy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {alerts.map((alert) => {
                const { icon: Icon, color, bg, border, label } = getSeverityConfig(alert.severity);

                return (
                  <div key={alert.id} className={`glass rounded-2xl border ${border} p-5`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 rounded-xl p-3 ${bg} ${color}`}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border border-white/10 px-3 py-1 text-xs font-semibold ${color}`}>
                              {label}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-slate-300">
                              {alert.type.replace(/_/g, ' ')}
                            </span>
                            {alert.batch && (
                              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-slate-300">
                                Batch {alert.batch}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-lg font-bold text-slate-100">{alert.medicineName}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-300">{alert.message}</p>
                          {alert.expiryDate && (
                            <p className="mt-2 text-xs text-slate-500">Expiry date: {formatDate(alert.expiryDate)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {typeof alert.daysUntilExpiry === 'number' && (
                          <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-200">
                            {alert.daysUntilExpiry <= 0 ? 'Expired' : `${alert.daysUntilExpiry} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
