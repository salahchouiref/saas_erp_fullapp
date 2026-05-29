import { useState, useEffect } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../api/tasks';
import { useToast } from './Toast';

const columns = [
  { id: 'todo', label: 'À faire', color: 'bg-slate-100 border-slate-200' },
  { id: 'in_progress', label: 'En cours', color: 'bg-blue-100 border-blue-200' },
  { id: 'review', label: 'En revue', color: 'bg-amber-100 border-amber-200' },
  { id: 'done', label: 'Terminé', color: 'bg-emerald-100 border-emerald-200' }
];

const priorities = [
  { value: 'low', label: 'Basse', color: 'text-slate-500', bg: 'bg-slate-100' },
  { value: 'medium', label: 'Moyenne', color: 'text-amber-600', bg: 'bg-amber-100' },
  { value: 'high', label: 'Haute', color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'critical', label: 'Critique', color: 'text-red-600', bg: 'bg-red-100' }
];

function getPriorityColor(priority) {
  const p = priorities.find(x => x.value === priority);
  return p || priorities[1];
}

function getPriorityLabel(priority) {
  const p = priorities.find(x => x.value === priority);
  return p ? p.label : priority;
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const priorityStyle = getPriorityColor(task.priority);
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onEdit(task)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-800 line-clamp-2">{task.title}</h4>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          className="text-slate-400 hover:text-red-500 p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.color}`}>
          {getPriorityLabel(task.priority)}
        </span>
        
        {task.assignedTo && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {(task.assignedTo.name || 'U')[0]}
          </div>
        )}
      </div>
      
      {task.dueDate && (
        <div className="mt-2 text-xs text-slate-400">
          📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}
        </div>
      )}
    </div>
  );
}

function TaskFormModal({ task, projectId, onSave, onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: projectId,
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast('Le titre est obligatoire', 'warning');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(task?._id, form);
      onClose();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">
          {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Titre de la tâche"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              rows={2}
              placeholder="Description..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date limite</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks(projectId);
      setTasks(data);
    } catch (e) {
      addToast(e.data?.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadTasks();
  }, [projectId]);

  const handleSave = async (taskId, data) => {
    if (taskId) {
      await updateTask(projectId, taskId, data);
      addToast('Tâche mise à jour', 'success');
    } else {
      await createTask(projectId, data);
      addToast('Tâche créée', 'success');
    }
    loadTasks();
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await deleteTask(projectId, taskId);
      addToast('Tâche supprimée', 'success');
      loadTasks();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(projectId, task._id, { status: newStatus });
      loadTasks();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(t => t.status === columnId);
  };

  const onDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  const onDrop = (e, columnId) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t._id === taskId);
    if (task && task.status !== columnId) {
      handleStatusChange(task, columnId);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 bg-slate-800">
        <h2 className="text-xl font-semibold text-white">Tableau Kanban</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedTask(null); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            + Nouvelle tâche
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition"
          >
            ✕ Fermer
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map(column => (
            <div
              key={column.id}
              className={`w-72 flex flex-col ${column.color} rounded-xl p-3`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700">{column.label}</h3>
                <span className="px-2 py-0.5 bg-white rounded-full text-xs font-medium text-slate-600">
                  {getTasksByColumn(column.id).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  getTasksByColumn(column.id).map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={e => onDragStart(e, task)}
                    >
                      <TaskCard
                        task={task}
                        onEdit={(t) => { setSelectedTask(t); setShowForm(true); }}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => { setSelectedTask(null); setShowForm(true); }}
                className="mt-2 w-full py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition"
              >
                + Ajouter une tâche
              </button>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <TaskFormModal
          task={selectedTask}
          projectId={projectId}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}