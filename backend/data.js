// Dummy database arrays
const medicines = [
    { id: '1', name: 'Paracetamol 500mg', batch: 'B101', expiry: '2026-06-30', price: 5.0, stock: 120 },
    { id: '2', name: 'Amoxicillin 250mg', batch: 'B102', expiry: '2026-08-15', price: 12.5, stock: 45 },
    { id: '3', name: 'Ibuprofen 400mg', batch: 'B103', expiry: '2026-04-10', price: 8.0, stock: 15 }, // Low stock & Near expiry
    { id: '4', name: 'Cetirizine 10mg', batch: 'B104', expiry: '2027-01-20', price: 3.5, stock: 200 },
    { id: '5', name: 'Vitamin C 1000mg', batch: 'B105', expiry: '2026-05-05', price: 15.0, stock: 80 } // Near expiry (40 days)
];

const suppliers = [
    { id: '1', name: 'PharmaCorp Inc.', contact: 'john@pharmacorp.com', phone: '123-456-7890' },
    { id: '2', name: 'HealthMeds Ltd.', contact: 'supplier@healthmeds.com', phone: '098-765-4321' }
];

const purchases = [
    { id: '101', supplierId: '1', medicineName: 'Paracetamol 500mg', quantity: 200, date: '2026-03-01', totalCost: 500 },
    { id: '102', supplierId: '2', medicineName: 'Amoxicillin 250mg', quantity: 100, date: '2026-03-15', totalCost: 800 }
];

const sales = [
    { id: '201', medicineId: '1', quantity: 5, date: new Date().toISOString().split('T')[0], total: 25.0, profit: 10.0 },
    { id: '202', medicineId: '4', quantity: 10, date: new Date().toISOString().split('T')[0], total: 35.0, profit: 15.0 },
    { id: '203', medicineId: '2', quantity: 2, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], total: 25.0, profit: 8.0 }
];

module.exports = { medicines, suppliers, purchases, sales };
