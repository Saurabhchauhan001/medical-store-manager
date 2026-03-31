import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/format';

const initialSaleForm = {
  medicineId: '',
  quantity: '',
  unitPrice: '',
};

export default function Reports() {
  const [dailySales, setDailySales] = useState(null);
  const [fastMoving, setFastMoving] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [saleForm, setSaleForm] = useState(initialSaleForm);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [salesResponse, fastMovingResponse, inventoryResponse] = await Promise.all([
        api.get('/reports/daily'),
        api.get('/reports/fast-moving'),
        api.get('/inventory'),
      ]);

      setDailySales(salesResponse.data);
      setFastMoving(fastMovingResponse.data);
      setMedicines(inventoryResponse.data);
      setFeedback((current) => (current.type === 'error' ? { type: '', message: '' } : current));
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSaleChange = (event) => {
    const { name, value } = event.target;
    setSaleForm((current) => ({ ...current, [name]: value }));
  };

  const handleRecordSale = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });

      const response = await api.post('/sales', {
        medicineId: saleForm.medicineId,
        quantity: Number(saleForm.quantity),
        ...(saleForm.unitPrice ? { unitPrice: Number(saleForm.unitPrice) } : {}),
      });

      setSaleForm(initialSaleForm);
      setFeedback({ type: 'success', message: response.data.message });
      await fetchReports();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMedicine = medicines.find((medicine) => medicine.id === saleForm.medicineId);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Analytics & Reports</h1>
        <p className="text-slate-400 mt-2">Track sales performance and inventory movement.</p>
      </div>

      {feedback.message && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${feedback.type === 'error' ? 'border border-red-500/30 bg-red-500/10 text-red-200' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Daily Revenue</p>
            <h3 className="text-3xl font-bold text-slate-100">{formatCurrency(dailySales?.totalRevenue)}</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Net Profit</p>
            <h3 className="text-3xl font-bold text-slate-100">{formatCurrency(dailySales?.totalProfit)}</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Transactions</p>
            <h3 className="text-3xl font-bold text-slate-100">{dailySales?.salesCount || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Fast-Moving Medicines
          </h2>

          {fastMoving.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-center text-slate-500">
              Record a few sales to unlock movement analytics.
            </div>
          ) : (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fastMoving} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                    formatter={(value) => [`${value} units`, 'Quantity sold']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="totalSold" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass p-6 rounded-2xl flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Record Sale & Breakdown
          </h2>

          <form onSubmit={handleRecordSale} className="grid grid-cols-1 gap-4 mb-6">
            <select
              required
              name="medicineId"
              value={saleForm.medicineId}
              onChange={handleSaleChange}
              className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            >
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name} ({medicine.stock} units)
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="quantity"
                value={saleForm.quantity}
                onChange={handleSaleChange}
                type="number"
                min="1"
                className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                placeholder="Quantity sold"
              />
              <input
                name="unitPrice"
                value={saleForm.unitPrice}
                onChange={handleSaleChange}
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                placeholder="Unit price (optional)"
              />
            </div>

            {selectedMedicine && (
              <div className="rounded-xl border border-white/10 bg-surfaceHover/20 px-4 py-3 text-sm text-slate-300">
                Available stock: <span className="font-semibold text-slate-100">{selectedMedicine.stock}</span> • Default selling price: <span className="font-semibold text-slate-100">{formatCurrency(selectedMedicine.price)}</span>
              </div>
            )}

            <button disabled={submitting || medicines.length === 0} type="submit" className="bg-emerald-500/90 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Recording Sale...' : 'Record Sale'}
            </button>

            {medicines.length === 0 && (
              <p className="text-xs text-slate-400">Add inventory before recording sales.</p>
            )}
          </form>

          <div className="flex-1 overflow-auto pr-2">
            {!dailySales || dailySales.sales.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No transactions today.</p>
            ) : (
              <div className="space-y-3">
                {dailySales.sales.map((sale) => (
                  <div key={sale.id} className="p-4 rounded-xl border border-white/5 bg-surfaceHover/30 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-mono text-slate-500 mb-1 block">Sold {formatDateTime(sale.date)}</span>
                      <h4 className="font-semibold text-slate-200">{sale.medicineName}</h4>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="bg-surface px-2 py-1 rounded-md text-sm border border-white/5">{sale.quantity}x</span>
                      <div>
                        <p className="font-bold text-slate-100">{formatCurrency(sale.total)}</p>
                        <p className="text-xs text-emerald-400">+{formatCurrency(sale.profit)} profit</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
