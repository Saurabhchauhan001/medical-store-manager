import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import {
  AlertCircle,
  PencilLine,
  PackagePlus,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { formatDate } from '../lib/format';

const initialFormState = {
  name: '',
  batch: '',
  expiry: '',
  stock: '',
};

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [form, setForm] = useState(initialFormState);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [editForm, setEditForm] = useState(initialFormState);
  const [stockForm, setStockForm] = useState({ operation: 'add', quantity: '' });

  const hydrateSelectedMedicine = (items, activeId) => {
    if (!activeId) {
      return;
    }

    const currentMedicine = items.find((medicine) => medicine.id === activeId);

    if (!currentMedicine) {
      setSelectedMedicineId('');
      setEditForm(initialFormState);
      setStockForm({ operation: 'add', quantity: '' });
      return;
    }

    setEditForm({
      name: currentMedicine.name,
      batch: currentMedicine.batch,
      expiry: currentMedicine.expiry?.slice(0, 10) || '',
      stock: String(currentMedicine.stock ?? 0),
    });
  };

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      setMedicines(response.data);
      hydrateSelectedMedicine(response.data, selectedMedicineId);
      setFeedback((current) => (current.type === 'error' ? { type: '', message: '' } : current));
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [selectedMedicineId]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleStockFormChange = (event) => {
    const { name, value } = event.target;
    setStockForm((current) => ({ ...current, [name]: value }));
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicineId(medicine.id);
    setEditForm({
      name: medicine.name,
      batch: medicine.batch,
      expiry: medicine.expiry?.slice(0, 10) || '',
      stock: String(medicine.stock ?? 0),
    });
    setStockForm({ operation: 'add', quantity: '' });
    setFeedback({ type: '', message: '' });
  };

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });

      const response = await api.post('/inventory', {
        ...form,
        stock: Number(form.stock),
      });

      setForm(initialFormState);
      setFeedback({ type: 'success', message: response.data.message });
      await fetchMedicines();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMedicine = medicines.find((medicine) => medicine.id === selectedMedicineId) || null;

  const handleUpdateMedicine = async (event) => {
    event.preventDefault();

    if (!selectedMedicine) {
      return;
    }

    try {
      setSavingEdit(true);
      setFeedback({ type: '', message: '' });

      const response = await api.patch(`/inventory/${selectedMedicine.id}`, {
        ...editForm,
      });

      setFeedback({ type: 'success', message: response.data.message });
      await fetchMedicines();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAdjustStock = async (event) => {
    event.preventDefault();

    if (!selectedMedicine) {
      return;
    }

    try {
      setSavingStock(true);
      setFeedback({ type: '', message: '' });

      const response = await api.patch(`/inventory/${selectedMedicine.id}/stock`, {
        operation: stockForm.operation,
        quantity: Number(stockForm.quantity),
      });

      setFeedback({ type: 'success', message: response.data.message });
      setStockForm({ operation: 'add', quantity: '' });
      await fetchMedicines();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSavingStock(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!selectedMedicine) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedMedicine.name} (${selectedMedicine.batch}) from inventory?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setFeedback({ type: '', message: '' });
      const response = await api.delete(`/inventory/${selectedMedicine.id}`);
      setFeedback({ type: 'success', message: response.data.message });
      setSelectedMedicineId('');
      setEditForm(initialFormState);
      setStockForm({ operation: 'add', quantity: '' });
      await fetchMedicines();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
  const filteredMedicines = medicines.filter((medicine) => (
    (!normalizedSearch ||
      medicine.name.toLowerCase().includes(normalizedSearch) ||
      medicine.batch.toLowerCase().includes(normalizedSearch)) &&
    (filter === 'all' ||
      (filter === 'low-stock' && medicine.stock > 0 && medicine.stock <= 20) ||
      (filter === 'out-of-stock' && medicine.stock === 0) ||
      (filter === 'expiring-soon' && getDaysUntilExpiry(medicine.expiry) >= 0 && getDaysUntilExpiry(medicine.expiry) <= 90))
  ));

  const summary = {
    totalMedicines: medicines.length,
    totalUnits: medicines.reduce((sum, medicine) => sum + medicine.stock, 0),
    lowStockItems: medicines.filter((medicine) => medicine.stock > 0 && medicine.stock <= 20).length,
    expiringSoon: medicines.filter((medicine) => {
      const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
    }).length,
  };
  const selectedMedicineDaysUntilExpiry = selectedMedicine ? getDaysUntilExpiry(selectedMedicine.expiry) : Number.POSITIVE_INFINITY;
  const selectedMedicineOutOfStock = selectedMedicine?.stock === 0;
  const selectedMedicineLowStock = selectedMedicine && selectedMedicine.stock > 0 && selectedMedicine.stock <= 20;
  const selectedMedicineExpiringSoon = selectedMedicine && selectedMedicineDaysUntilExpiry >= 0 && selectedMedicineDaysUntilExpiry <= 90;

  const filters = [
    { id: 'all', label: 'All', count: medicines.length },
    { id: 'low-stock', label: 'Low Stock', count: medicines.filter((medicine) => medicine.stock > 0 && medicine.stock <= 20).length },
    { id: 'out-of-stock', label: 'Out Of Stock', count: medicines.filter((medicine) => medicine.stock === 0).length },
    { id: 'expiring-soon', label: 'Expiring Soon', count: summary.expiringSoon },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Inventory Management</h1>
          <p className="text-slate-400 mt-2">Keep medicine records simple, searchable, and easy to update on any screen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl">
          <p className="text-sm text-slate-400">Medicine Batches</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-100">{summary.totalMedicines}</h2>
        </div>
        <div className="glass p-5 rounded-2xl">
          <p className="text-sm text-slate-400">Total Units in Stock</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-100">{summary.totalUnits}</h2>
        </div>
        <div className="glass p-5 rounded-2xl">
          <p className="text-sm text-slate-400">Low Stock Items</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-400">{summary.lowStockItems}</h2>
        </div>
        <div className="glass p-5 rounded-2xl">
          <p className="text-sm text-slate-400">Expiring In 90 Days</p>
          <h2 className="mt-2 text-3xl font-bold text-red-300">{summary.expiringSoon}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl relative overflow-hidden group border-t-2 border-t-primary/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <PackagePlus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Add Medicine</h2>
                <p className="mt-1 text-sm text-slate-400">Save a new batch or add stock to an existing one with the same medicine name and batch number.</p>
              </div>
            </div>

            {feedback.message && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${feedback.type === 'error' ? 'border border-red-500/30 bg-red-500/10 text-red-200' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleAddMedicine} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Medicine Name</label>
                <input required name="name" value={form.name} onChange={handleFormChange} type="text" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="e.g. Paracetamol 500mg" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Batch No.</label>
                  <input required name="batch" value={form.batch} onChange={handleFormChange} type="text" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="B101" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Expiry Date</label>
                  <input required name="expiry" value={form.expiry} onChange={handleFormChange} type="date" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Initial Stock</label>
                <input required name="stock" value={form.stock} onChange={handleFormChange} type="number" min="0" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="100" />
              </div>

              <button disabled={submitting} type="submit" className="mt-4 w-full bg-gradient-to-r from-primary to-primaryHover hover:from-primaryHover hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Saving...' : 'Save Medicine'}
              </button>
            </form>
          </div>

          <div className="glass p-6 rounded-2xl border-t-2 border-t-cyan-400/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-400/15 text-cyan-200 rounded-lg">
                <PencilLine size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Manage Selected Medicine</h2>
                <p className="mt-1 text-sm text-slate-400">Update details, adjust stock quickly, or remove an item if it is no longer needed.</p>
              </div>
            </div>

            {!selectedMedicine ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-8 text-center text-sm text-slate-500">
                Select a medicine from the table to manage it here.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="font-semibold text-slate-100">{selectedMedicine.name}</p>
                  <p className="mt-1 text-sm text-slate-400">Batch {selectedMedicine.batch} • {selectedMedicine.stock} units in stock</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedMedicineOutOfStock && (
                      <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                        Out of stock
                      </span>
                    )}
                    {selectedMedicineLowStock && !selectedMedicineOutOfStock && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        Low stock
                      </span>
                    )}
                    {selectedMedicineExpiringSoon && (
                      <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                        {selectedMedicineDaysUntilExpiry} days to expiry
                      </span>
                    )}
                    {!selectedMedicineOutOfStock && !selectedMedicineLowStock && !selectedMedicineExpiringSoon && (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        Healthy batch
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleUpdateMedicine} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Medicine Name</label>
                    <input required name="name" value={editForm.name} onChange={handleEditFormChange} type="text" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Batch No.</label>
                      <input required name="batch" value={editForm.batch} onChange={handleEditFormChange} type="text" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Expiry Date</label>
                      <input required name="expiry" value={editForm.expiry} onChange={handleEditFormChange} type="date" className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                  </div>

                  <button disabled={savingEdit} type="submit" className="w-full rounded-xl bg-cyan-400/90 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
                    {savingEdit ? 'Updating Medicine...' : 'Update Medicine'}
                  </button>
                </form>

                <form onSubmit={handleAdjustStock} className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-300" />
                    <h3 className="font-semibold text-slate-100">Stock Adjustment</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="operation"
                      value={stockForm.operation}
                      onChange={handleStockFormChange}
                      className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
                    >
                      <option value="add">Add Stock</option>
                      <option value="remove">Remove Stock</option>
                      <option value="set">Set Stock</option>
                    </select>
                    <input
                      required
                      name="quantity"
                      value={stockForm.quantity}
                      onChange={handleStockFormChange}
                      type="number"
                      min="0"
                      className="w-full bg-surfaceHover/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <button disabled={savingStock} type="submit" className="w-full rounded-xl bg-amber-400/90 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
                    {savingStock ? 'Adjusting Stock...' : 'Apply Stock Change'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleDeleteMedicine}
                  disabled={deleting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {deleting ? 'Deleting...' : 'Delete Medicine'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="glass p-6 flex flex-col h-full rounded-2xl min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-6 bg-accent rounded-full"></span>
                  Current Stock
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Showing {filteredMedicines.length} of {medicines.length} batches. Select any medicine to edit details or adjust stock.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-surfaceHover/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="Search medicine or batch"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.id}
                  type="button"
                  onClick={() => setFilter(filterItem.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    filter === filterItem.id
                      ? 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100'
                      : 'border-white/10 bg-white/4 text-slate-300 hover:bg-white/7'
                  }`}
                >
                  {filterItem.label} ({filterItem.count})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:hidden">
                  {filteredMedicines.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-8 text-center text-slate-500">
                      No medicines found.
                    </div>
                  ) : (
                    filteredMedicines.map((medicine) => {
                      const isLowStock = medicine.stock > 0 && medicine.stock <= 20;
                      const isOutOfStock = medicine.stock === 0;
                      const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry);
                      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
                      const isSelected = medicine.id === selectedMedicineId;

                      return (
                        <div key={medicine.id} className={`rounded-2xl border p-4 ${isSelected ? 'border-cyan-300/20 bg-cyan-400/8' : 'border-white/8 bg-white/4'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-100">{medicine.name}</p>
                              <p className="text-xs text-slate-500">Batch {medicine.batch}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectMedicine(medicine)}
                              className="rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-950/45 px-3 py-2">
                              <p className="text-xs text-slate-500">Expiry</p>
                              <p className="mt-1 text-slate-200">{formatDate(medicine.expiry)}</p>
                            </div>
                            <div className="rounded-xl bg-slate-950/45 px-3 py-2">
                              <p className="text-xs text-slate-500">Stock</p>
                              <p className="mt-1 text-slate-200">{medicine.stock} units</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {isOutOfStock && (
                              <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                                Out of stock
                              </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                                Low stock
                              </span>
                            )}
                            {isExpiringSoon && (
                              <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                {daysUntilExpiry} days left
                              </span>
                            )}
                            {!isOutOfStock && !isLowStock && !isExpiringSoon && (
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                Healthy
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-xs text-slate-400 uppercase bg-surfaceHover/30">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Medicine</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Expiry</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No medicines found.</td>
                      </tr>
                    ) : (
                      filteredMedicines.map((medicine) => {
                        const isLowStock = medicine.stock > 0 && medicine.stock <= 20;
                        const isOutOfStock = medicine.stock === 0;
                        const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry);
                        const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
                        const isSelected = medicine.id === selectedMedicineId;

                        return (
                          <tr key={medicine.id} className={`border-b border-white/5 transition-colors ${isSelected ? 'bg-cyan-400/5' : 'hover:bg-surfaceHover/20'}`}>
                            <td className="px-4 py-4 font-medium text-slate-200">{medicine.name}</td>
                            <td className="px-4 py-4 text-slate-400">{medicine.batch}</td>
                            <td className="px-4 py-4 text-slate-400">{formatDate(medicine.expiry)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                isOutOfStock
                                  ? 'bg-red-500/15 text-red-200 border border-red-400/20'
                                  : isLowStock
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                    : 'bg-surfaceHover border border-white/10'
                              }`}>
                                {(isLowStock || isOutOfStock) && <AlertCircle size={12} />}
                                {medicine.stock} units
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                {isOutOfStock && (
                                  <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                                    Out of stock
                                  </span>
                                )}
                                {isLowStock && !isOutOfStock && (
                                  <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                                    Low stock
                                  </span>
                                )}
                                {isExpiringSoon && (
                                  <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                    {daysUntilExpiry} days left
                                  </span>
                                )}
                                {!isOutOfStock && !isLowStock && !isExpiringSoon && (
                                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    Healthy
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectMedicine(medicine)}
                                  className="rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/15"
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDaysUntilExpiry(expiry) {
  const expiryDate = new Date(expiry);

  if (Number.isNaN(expiryDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
