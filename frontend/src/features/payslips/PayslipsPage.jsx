import { useState, useEffect } from 'react';

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const statusOptions = [
  { value: 'draft', label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
  { value: 'pending', label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'paid', label: 'Payé', color: 'bg-emerald-100 text-emerald-700' }
];

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [filter, setFilter] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    status: '',
    employeeId: ''
  });

  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    baseSalary: 0,
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    cnss: 0,
    amo: 0,
    taxableIncome: 0,
    netSalary: 0,
    status: 'draft',
    paymentDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateNetSalary();
  }, [form.baseSalary, form.overtime, form.bonuses, form.deductions, form.cnss, form.amo]);

  const loadData = async () => {
    setLoading(true);
    setTimeout(() => {
      setEmployees([
        { _id: '1', firstName: 'Ahmed', lastName: 'Alaoui', position: 'Développeur', salary: 8000 },
        { _id: '2', firstName: 'Fatima', lastName: 'Zahra', position: 'Chef de projet', salary: 12000 },
        { _id: '3', firstName: 'Youssef', lastName: 'El Amrani', position: 'Designer', salary: 7000 },
      ]);
      setPayslips([
        { _id: '1', employeeId: { _id: '1', firstName: 'Ahmed', lastName: 'Alaoui' }, month: 4, year: 2026, baseSalary: 8000, overtime: 500, bonuses: 200, cnss: 480, amo: 240, netSalary: 7480, status: 'paid', paymentDate: '2026-05-01' },
        { _id: '2', employeeId: { _id: '2', firstName: 'Fatima', lastName: 'Zahra' }, month: 4, year: 2026, baseSalary: 12000, overtime: 0, bonuses: 1000, cnss: 720, amo: 360, netSalary: 11920, status: 'paid', paymentDate: '2026-05-01' },
        { _id: '3', employeeId: { _id: '3', firstName: 'Youssef', lastName: 'El Amrani' }, month: 4, year: 2026, baseSalary: 7000, overtime: 300, bonuses: 0, cnss: 420, amo: 210, netSalary: 6670, status: 'pending', paymentDate: '' },
      ]);
      setLoading(false);
    }, 500);
  };

  const calculateNetSalary = () => {
    const gross = Number(form.baseSalary) + Number(form.overtime) + Number(form.bonuses);
    const deductions = Number(form.deductions) + Number(form.cnss) + Number(form.amo);
    setForm(prev => ({
      ...prev,
      taxableIncome: gross - deductions,
      netSalary: gross - deductions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPayslip = {
      ...form,
      _id: Date.now().toString(),
      employeeId: employees.find(e => e._id === form.employeeId)
    };
    setPayslips([newPayslip, ...payslips]);
    setShowForm(false);
    setForm({
      employeeId: '', month: new Date().getMonth(), year: new Date().getFullYear(),
      baseSalary: 0, overtime: 0, bonuses: 0, deductions: 0, cnss: 0, amo: 0,
      taxableIncome: 0, netSalary: 0, status: 'draft', paymentDate: ''
    });
  };

  const handleEdit = (payslip) => {
    setSelectedPayslip(payslip);
    setForm({
      employeeId: payslip.employeeId?._id || '',
      month: payslip.month,
      year: payslip.year,
      baseSalary: payslip.baseSalary,
      overtime: payslip.overtime || 0,
      bonuses: payslip.bonuses || 0,
      deductions: payslip.deductions || 0,
      cnss: payslip.cnss,
      amo: payslip.amo,
      taxableIncome: payslip.taxableIncome,
      netSalary: payslip.netSalary,
      status: payslip.status,
      paymentDate: payslip.paymentDate ? payslip.paymentDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce bulletin de paie?')) return;
    setPayslips(payslips.filter(p => p._id !== id));
  };

  const exportPDF = (payslip) => {
    alert(`Export PDF du bulletin de paie de ${payslip.employeeId?.firstName} ${payslip.employeeId?.lastName}`);
  };

  const getStatusColor = (status) => statusOptions.find(s => s.value === status)?.color || 'bg-slate-100';
  const getStatusLabel = (status) => statusOptions.find(s => s.value === status)?.label || status;

  const filteredPayslips = payslips.filter(p => {
    if (filter.status && p.status !== filter.status) return false;
    if (filter.employeeId && p.employeeId?._id !== filter.employeeId) return false;
    return true;
  });

  const totalPayroll = filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion de la Paie</h1>
          <p className="text-slate-500 mt-1">Gérez les bulletins de salaire de vos employés</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSelectedPayslip(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Bulletin
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">💰</div>
            <div>
              <p className="text-sm text-slate-500">Masse Salariale</p>
              <p className="text-xl font-bold text-slate-900">{totalPayroll.toLocaleString()} DH</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">👥</div>
            <div>
              <p className="text-sm text-slate-500">Employés Payés</p>
              <p className="text-xl font-bold text-slate-900">{payslips.filter(p => p.status === 'paid').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">⏳</div>
            <div>
              <p className="text-sm text-slate-500">En Attente</p>
              <p className="text-xl font-bold text-slate-900">{payslips.filter(p => p.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.month}
            onChange={e => setFilter({ ...filter, month: Number(e.target.value) })}
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.year}
            onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.employeeId}
            onChange={e => setFilter({ ...filter, employeeId: e.target.value })}
          >
            <option value="">Tous les employés</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-4">Employé</th>
                  <th className="text-left p-4">Période</th>
                  <th className="text-right p-4">Salaire Base</th>
                  <th className="text-right p-4">Heures Sup.</th>
                  <th className="text-right p-4">Bonus</th>
                  <th className="text-right p-4">CNSS</th>
                  <th className="text-right p-4">AMO</th>
                  <th className="text-right p-4">Net à Payer</th>
                  <th className="text-center p-4">Statut</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayslips.map(payslip => (
                  <tr key={payslip._id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium">{payslip.employeeId?.firstName} {payslip.employeeId?.lastName}</td>
                    <td className="p-4">{months[payslip.month]} {payslip.year}</td>
                    <td className="p-4 text-right">{payslip.baseSalary.toLocaleString()} DH</td>
                    <td className="p-4 text-right">+{payslip.overtime?.toLocaleString() || 0} DH</td>
                    <td className="p-4 text-right">+{payslip.bonuses?.toLocaleString() || 0} DH</td>
                    <td className="p-4 text-right text-red-600">-{payslip.cnss} DH</td>
                    <td className="p-4 text-right text-red-600">-{payslip.amo} DH</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{payslip.netSalary.toLocaleString()} DH</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
                        {getStatusLabel(payslip.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(payslip)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Modifier">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l3.293 3.293-1.414 1.414z" />
                          </svg>
                        </button>
                        <button onClick={() => exportPDF(payslip)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Exporter PDF">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(payslip._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayslips.length === 0 && (
                  <tr><td colSpan="10" className="text-center text-slate-400 py-8">Aucun bulletin de paie trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-6">{selectedPayslip ? 'Modifier' : 'Nouveau'} Bulletin de Paie</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Employé</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    value={form.employeeId}
                    onChange={e => {
                      const emp = employees.find(em => em._id === e.target.value);
                      setForm({ ...form, employeeId: e.target.value, baseSalary: emp?.salary || 0 });
                    }}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Statut</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Mois</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    value={form.month}
                    onChange={e => setForm({ ...form, month: Number(e.target.value) })}
                  >
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Année</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                  >
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-medium text-slate-800 mb-3">Éléments du Salaire</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Salaire Base</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.baseSalary}
                      onChange={e => setForm({ ...form, baseSalary: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Heures Sup.</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.overtime}
                      onChange={e => setForm({ ...form, overtime: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Bonus</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.bonuses}
                      onChange={e => setForm({ ...form, bonuses: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-medium text-slate-800 mb-3">Cotisations & Déductions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">CNSS (6%)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.cnss}
                      onChange={e => setForm({ ...form, cnss: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">AMO (3%)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.amo}
                      onChange={e => setForm({ ...form, amo: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Autres Déductions</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={form.deductions}
                      onChange={e => setForm({ ...form, deductions: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Salaire Imposable</p>
                    <p className="text-xl font-bold text-slate-800">{form.taxableIncome.toLocaleString()} DH</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Net à Payer</p>
                    <p className="text-xl font-bold text-emerald-600">{form.netSalary.toLocaleString()} DH</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                  {selectedPayslip ? 'Mettre à jour' : 'Créer le Bulletin'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}