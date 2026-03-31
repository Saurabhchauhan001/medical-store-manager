import { useEffect, useState } from 'react';
import { FileText, PackagePlus, Truck, Users } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { formatDate } from '../lib/format';

const initialSupplierForm = {
  name: '',
  contact: '',
  phone: '',
};

const initialPurchaseForm = {
  supplierId: '',
  medicineId: '',
  quantity: '',
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierForm, setSupplierForm] = useState(initialSupplierForm);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [supplierResponse, purchaseResponse, medicineResponse] = await Promise.all([
        api.get('/suppliers'),
        api.get('/suppliers/purchases'),
        api.get('/inventory'),
      ]);

      setSuppliers(supplierResponse.data);
      setPurchases(purchaseResponse.data);
      setMedicines(medicineResponse.data);
      setFeedback((current) => (current.type === 'error' ? { type: '', message: '' } : current));
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (event) => {
    const { name, value } = event.target;
    setSupplierForm((current) => ({ ...current, [name]: value }));
  };

  const handlePurchaseChange = (event) => {
    const { name, value } = event.target;
    setPurchaseForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddSupplier = async (event) => {
    event.preventDefault();

    try {
      setSavingSupplier(true);
      setFeedback({ type: '', message: '' });

      const response = await api.post('/suppliers', supplierForm);

      setSupplierForm(initialSupplierForm);
      setFeedback({ type: 'success', message: response.data.message });
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSavingSupplier(false);
    }
  };

  const handleRecordPurchase = async (event) => {
    event.preventDefault();

    try {
      setSavingPurchase(true);
      setFeedback({ type: '', message: '' });

      const response = await api.post('/suppliers/purchases', {
        supplierId: purchaseForm.supplierId,
        medicineId: purchaseForm.medicineId,
        quantity: Number(purchaseForm.quantity),
      });

      setPurchaseForm(initialPurchaseForm);
      setFeedback({ type: 'success', message: response.data.message });
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSavingPurchase(false);
    }
  };

  const supplierSummary = {
    totalSuppliers: suppliers.length,
    totalRestocks: purchases.length,
    totalUnitsReceived: purchases.reduce((sum, purchase) => sum + Number(purchase.quantity || 0), 0),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Suppliers & Restocks</h1>
        <p className="text-slate-400 mt-2">Keep supplier contacts handy and record incoming stock in a few quick steps.</p>
      </div>

      {feedback.message && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${feedback.type === 'error' ? 'border border-red-500/30 bg-red-500/10 text-red-200' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-slate-400">Suppliers</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{supplierSummary.totalSuppliers}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-slate-400">Restock Entries</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{supplierSummary.totalRestocks}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-slate-400">Units Received</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{supplierSummary.totalUnitsReceived}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass rounded-2xl border-t-2 border-t-violet-400/50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-400/15 p-2 text-violet-200">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Supplier Directory</h2>
              <p className="mt-1 text-sm text-slate-400">Add your regular wholesalers and keep their contact details ready.</p>
            </div>
          </div>

          <form onSubmit={handleAddSupplier} className="grid grid-cols-1 gap-4 mb-6">
            <input
              required
              name="name"
              value={supplierForm.name}
              onChange={handleSupplierChange}
              type="text"
              className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
              placeholder="Supplier name"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="contact"
                value={supplierForm.contact}
                onChange={handleSupplierChange}
                type="text"
                className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
                placeholder="Contact person or email"
              />
              <input
                required
                name="phone"
                value={supplierForm.phone}
                onChange={handleSupplierChange}
                type="text"
                className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
                placeholder="Phone number"
              />
            </div>
            <button disabled={savingSupplier} type="submit" className="rounded-xl bg-violet-500/90 py-3 font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
              {savingSupplier ? 'Saving Supplier...' : 'Add Supplier'}
            </button>
          </form>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map((item) => <div key={item} className="h-16 bg-surfaceHover/50 rounded-xl"></div>)}
              </div>
            ) : suppliers.length === 0 ? (
              <p className="text-slate-500 text-sm">No suppliers found.</p>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surfaceHover/30 p-4 transition-colors hover:bg-surfaceHover/50 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200">{supplier.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{supplier.contact}</p>
                  </div>
                  <div className="w-fit rounded-lg border border-white/5 bg-surface px-3 py-1.5 font-mono text-sm text-slate-300">
                    {supplier.phone}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass rounded-2xl border-t-2 border-t-cyan-400/50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-200">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Record Restock</h2>
              <p className="mt-1 text-sm text-slate-400">Choose a supplier, select the medicine batch, and record how many units arrived.</p>
            </div>
          </div>

          <form onSubmit={handleRecordPurchase} className="grid grid-cols-1 gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                name="supplierId"
                value={purchaseForm.supplierId}
                onChange={handlePurchaseChange}
                className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              <select
                required
                name="medicineId"
                value={purchaseForm.medicineId}
                onChange={handlePurchaseChange}
                className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} ({medicine.batch})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="quantity"
                value={purchaseForm.quantity}
                onChange={handlePurchaseChange}
                type="number"
                min="1"
                className="w-full rounded-xl border border-white/10 bg-surfaceHover/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
                placeholder="Units received"
              />
              <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-400">
                This restock will increase stock for the selected batch immediately.
              </div>
            </div>

            <button disabled={savingPurchase || suppliers.length === 0 || medicines.length === 0} type="submit" className="rounded-xl bg-cyan-500/90 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
              {savingPurchase ? 'Recording Restock...' : 'Record Restock'}
            </button>

            {(suppliers.length === 0 || medicines.length === 0) && (
              <p className="text-xs text-slate-400">Add at least one supplier and one medicine before recording a restock.</p>
            )}
          </form>

          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-cyan-200" />
            <h3 className="font-semibold text-slate-100">Recent Restocks</h3>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map((item) => <div key={item} className="h-20 bg-surfaceHover/50 rounded-xl"></div>)}
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent restocks.</p>
            ) : (
              purchases.map((purchase) => {
                const supplierName = purchase.supplierId?.name || purchase.supplierName || 'Unknown';

                return (
                  <div key={purchase.id} className="rounded-2xl border border-white/5 bg-surfaceHover/30 p-4 transition-colors hover:bg-surfaceHover/50">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-cyan-200" />
                          <h3 className="font-semibold text-slate-200">{purchase.medicineName}</h3>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{supplierName}</p>
                        <p className="mt-1 text-xs text-slate-500">Recorded on {formatDate(purchase.date)}</p>
                      </div>
                      <div className="flex gap-3 sm:flex-col sm:items-end">
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                          {purchase.quantity} units
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-slate-300">
                          Batch {purchase.medicineId?.batch || '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
