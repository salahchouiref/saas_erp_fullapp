import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getStockMovements, createStockMovement, getStockLevels } from '../../api/stock';

const tabs = [
  { id: 'products', label: 'Produits' },
  { id: 'movements', label: 'Mouvements' },
  { id: 'stock', label: 'Niveaux de Stock' }
];

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ name: '', sku: '', description: '', unitPrice: '', unitCost: '', unit: 'piece', categoryId: '', minStockLevel: '', warehouseId: '' });

  useEffect(() => { loadProducts(); loadCategories(); loadMovements(); loadLevels(); }, []);

  const loadProducts = async () => {
    try { const data = await getProducts({ search }); setProducts(data); } catch {}
  };
  const loadCategories = async () => {
    try { const data = await getCategories(); setCategories(data); } catch {}
  };
  const loadMovements = async () => {
    try { const data = await getStockMovements(); setMovements(data); } catch {}
  };
  const loadLevels = async () => {
    try { const data = await getStockLevels(); setLevels(data); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, unitPrice: Number(form.unitPrice), unitCost: form.unitCost ? Number(form.unitCost) : undefined, minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : 0 };
      if (editItem) { await updateProduct(editItem._id, payload); } else { await createProduct(payload); }
      setShowForm(false); setEditItem(null); resetForm(); loadProducts();
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const handleEdit = (product) => {
    setEditItem(product);
    setForm({ name: product.name, sku: product.sku, description: product.description || '', unitPrice: String(product.unitPrice), unitCost: product.unitCost ? String(product.unitCost) : '', unit: product.unit, categoryId: product.categoryId?._id || product.categoryId || '', minStockLevel: String(product.minStockLevel || 0), warehouseId: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try { await deleteProduct(id); loadProducts(); } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', sku: '', description: '', unitPrice: '', unitCost: '', unit: 'piece', categoryId: '', minStockLevel: '', warehouseId: '' });
  };

  const getStatusBadge = (level) => {
    if (!level.productId?.minStockLevel) return null;
    if (level.quantity <= level.productId.minStockLevel) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Stock faible</span>;
    if (level.quantity <= level.productId.minStockLevel * 2) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Stock moyen</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestion de Stock</h2>
        {activeTab === 'products' && !showForm && (
          <button onClick={() => { setShowForm(true); setEditItem(null); resetForm(); }} className="btn-primary">+ Nouveau Produit</button>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === 'products' && (
        <>
          {showForm && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-soft" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{editItem ? 'Modifier' : 'Nouveau'} Produit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="label-field">Nom <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
                  <label className="label-field">SKU <input className="input-field" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required /></label>
                  <label className="label-field">Description <textarea className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="label-field">Prix unitaire <input type="number" className="input-field" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required /></label>
                    <label className="label-field">Coût unitaire <input type="number" className="input-field" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} /></label>
                  </div>
                  <label className="label-field">Catégorie
                    <select className="input-field" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">Sélectionner...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </label>
                  <label className="label-field">Stock minimum <input type="number" className="input-field" value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: e.target.value })} /></label>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1">{editItem ? 'Modifier' : 'Créer'}</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mb-4">
            <input className="input-field max-w-sm" placeholder="Rechercher un produit..." value={search} onChange={e => { setSearch(e.target.value); setTimeout(loadProducts, 300); }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{product.name}</h4>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{product.unit}</span>
                </div>
                {product.categoryId && <p className="text-xs text-indigo-600 mb-2">{product.categoryId.name}</p>}
                {product.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{Number(product.unitPrice).toLocaleString()} DH</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="text-xs text-indigo-600 hover:underline">Modifier</button>
                    <button onClick={() => handleDelete(product._id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Aucun produit trouvé</p>}
          </div>
        </>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-4">Produit</th>
                <th className="text-left p-4">Type</th>
                <th className="text-right p-4">Quantité</th>
                <th className="text-left p-4">Entrepôt</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{m.productId?.name || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.type === 'in' ? 'bg-green-100 text-green-700' : m.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {m.type === 'in' ? 'Entrée' : m.type === 'out' ? 'Sortie' : m.type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">{m.quantity}</td>
                  <td className="p-4">{m.warehouseId?.name || 'N/A'}</td>
                  <td className="p-4 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan="5" className="text-center text-slate-400 py-8">Aucun mouvement</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map(l => (
            <div key={l._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-800">{l.productId?.name || 'N/A'}</h4>
                {getStatusBadge(l)}
              </div>
              <p className="text-xs text-slate-500 mb-3">SKU: {l.productId?.sku}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">En stock</p>
                  <p className="text-2xl font-bold text-slate-900">{l.quantity} {l.productId?.unit || 'pcs'}</p>
                </div>
                {l.productId?.minStockLevel > 0 && (
                  <p className="text-xs text-slate-400">Min: {l.productId.minStockLevel}</p>
                )}
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                {l.productId?.minStockLevel > 0 && (
                  <div className={`h-2 rounded-full transition-all ${l.quantity <= l.productId.minStockLevel ? 'bg-red-500' : l.quantity <= l.productId.minStockLevel * 2 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (l.quantity / (l.productId.maxStockLevel || l.productId.minStockLevel * 3)) * 100)}%` }}
                  />
                )}
              </div>
            </div>
          ))}
          {levels.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Aucun niveau de stock</p>}
        </div>
      )}
    </div>
  );
}
