import { useState, useEffect } from 'react';
import { getWorkflows, createWorkflow, runWorkflow, deleteWorkflow, getAvailableActions } from '../api/workflow';
import { useToast } from '../components/Toast';

const stepTypes = [
  { id: 'action', label: 'Action', color: 'bg-blue-500' },
  { id: 'condition', label: 'Condition', color: 'bg-yellow-500' },
  { id: 'delay', label: 'Attente', color: 'bg-purple-500' }
];

const defaultActionTemplates = [
  { action: 'create_client', fields: { name: '', email: '', company: '' } },
  { action: 'create_project', fields: { name: '', description: '', priority: 'medium' } },
  { action: 'create_task', fields: { title: '', projectId: '', priority: 'medium' } },
  { action: 'create_reminder', fields: { title: '', message: '', type: 'reminder' } },
  { action: 'send_notification', fields: { message: '' } }
];

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: []
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadWorkflows();
    loadActions();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data.workflows || []);
    } catch (e) {
      console.error('Error loading workflows:', e);
    }
  };

  const loadActions = async () => {
    try {
      const data = await getAvailableActions();
      setActions(data.actions || []);
    } catch (e) {
      console.error('Error loading actions:', e);
    }
  };

  const addStep = (type) => {
    const newStep = {
      id: Date.now().toString(),
      type,
      name: `Step ${formData.steps.length + 1}`,
      config: type === 'action' ? { action: 'send_notification', fields: { message: '' } } :
             type === 'condition' ? { field: '', operator: 'equals', value: '' } :
             { seconds: 5 }
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const updateStep = (stepId, updates) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    });
  };

  const removeStep = (stepId) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter(s => s.id !== stepId)
    });
  };

  const handleSave = async () => {
    if (!formData.name || formData.steps.length === 0) {
      addToast('Nom et au moins une étape requis', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (editingWorkflow) {
        addToast('Workflow mis à jour', 'success');
      } else {
        await createWorkflow(formData);
        addToast('Workflow créé', 'success');
      }
      setShowCreate(false);
      setEditingWorkflow(null);
      setFormData({ name: '', description: '', steps: [] });
      loadWorkflows();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (id) => {
    setLoading(true);
    try {
      const result = await runWorkflow(id);
      addToast(`Workflow exécuté: ${result.results?.length || 0} étapes`, 'success');
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous supprimer ce workflow?')) return;
    setLoading(true);
    try {
      await deleteWorkflow(id);
      addToast('Workflow supprimé', 'success');
      loadWorkflows();
    } catch (e) {
      addToast('Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflows d'Automatisation</h1>
        <button
          onClick={() => { setShowCreate(true); setEditingWorkflow(null); setFormData({ name: '', description: '', steps: [] }); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Nouveau Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map(workflow => (
          <div key={workflow._id} className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{workflow.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${workflow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {workflow.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{workflow.description || 'Aucune description'}</p>
            <div className="flex gap-2 text-xs text-slate-400 mb-3">
              <span>{workflow.steps?.length || 0} étapes</span>
              <span>•</span>
              <span>{workflow.runCount || 0} exécutions</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRun(workflow._id)}
                disabled={loading || !workflow.isActive}
                className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 disabled:opacity-50"
              >
                ▶ Exécuter
              </button>
              <button
                onClick={() => handleDelete(workflow._id)}
                disabled={loading}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        
        {workflows.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <p className="text-xl mb-2">⚙️</p>
            <p>Aucun workflow créé</p>
            <p className="text-sm">Créez votre premier workflow d'automatisation</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{editingWorkflow ? 'Modifier' : 'Nouveau'} Workflow</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du workflow</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: Création automatique de projet"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Description optionnelle..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Étapes du workflow</label>
                <div className="flex gap-2 mb-3">
                  {stepTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => addStep(type.id)}
                      className={`px-3 py-1.5 ${type.color} text-white rounded-lg text-sm`}
                    >
                      + {type.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {formData.steps.map((step, idx) => (
                    <div key={step.id} className="border rounded-lg p-3 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Étape {idx + 1}: {step.type}</span>
                        <button onClick={() => removeStep(step.id)} className="text-red-500 text-sm">✕</button>
                      </div>
                      
                      {step.type === 'action' && (
                        <div className="space-y-2">
                          <select
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={step.config.action || ''}
                            onChange={e => updateStep(step.id, { 
                              config: { ...step.config, action: e.target.value, fields: {} }
                            })}
                          >
                            <option value="">Sélectionner une action</option>
                            {actions.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <input
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Paramètres (JSON)"
                            value={JSON.stringify(step.config.fields || {})}
                            onChange={e => {
                              try {
                                updateStep(step.id, { 
                                  config: { ...step.config, fields: JSON.parse(e.target.value) }
                                });
                              } catch {}
                            }}
                          />
                        </div>
                      )}
                      
                      {step.type === 'condition' && (
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="Champ"
                            value={step.config.field || ''}
                            onChange={e => updateStep(step.id, { 
                              config: { ...step.config, field: e.target.value }
                            })}
                          />
                          <select
                            className="px-2 py-1 border rounded text-sm"
                            value={step.config.operator || ''}
                            onChange={e => updateStep(step.id, { 
                              config: { ...step.config, operator: e.target.value }
                            })}
                          >
                            <option value="equals">=</option>
                            <option value="not_equals">≠</option>
                            <option value="contains">contient</option>
                          </select>
                          <input
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="Valeur"
                            value={step.config.value || ''}
                            onChange={e => updateStep(step.id, { 
                              config: { ...step.config, value: e.target.value }
                            })}
                          />
                        </div>
                      )}
                      
                      {step.type === 'delay' && (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="Secondes d'attente"
                          value={step.config.seconds || 5}
                          onChange={e => updateStep(step.id, { 
                            config: { ...step.config, seconds: parseInt(e.target.value) || 5 }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                Sauvegarder
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border rounded-lg">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}