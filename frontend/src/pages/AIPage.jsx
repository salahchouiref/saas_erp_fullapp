import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, clearChat, scheduleReminder, getReminders, deleteReminder, updateReminderStatus } from '../api/ai';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const suggestionQuestions = [
  "Liste tous les employés actifs",
  "Affiche les statistiques globales",
  "Quels sont les projets en cours?",
  "Liste les clients actifs"
];

const quickActions = [
  { label: 'Stats', prompt: 'Donne-moi les statistiques globales' },
  { label: 'Employés', prompt: 'Liste tous les employés' },
  { label: 'Projets', prompt: 'Liste tous les projets' },
  { label: 'Clients', prompt: 'Liste tous les clients' }
];



export default function AIPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [reminders, setReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ 
    title: '', 
    message: '', 
    type: 'reminder', 
    scheduledAt: '',
    priority: 'medium',
    isRecurring: false,
    recurringInterval: null
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const userRole = user?.role || 'employee';
  const canManage = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data.reminders || []);
    } catch (e) {
      console.error('Error loading reminders:', e);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    const userMessage = chatInput;
    setChatInput('');
    
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await sendChatMessage(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (e) {
      addToast(e.data?.message || 'Erreur de communication', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleQuickAction = async (prompt) => {
    setLoading(true);
    setChatInput(prompt);
    setActiveTab('chat');
    
    setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
    
    try {
      const response = await sendChatMessage(prompt);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleSaveReminder = async () => {
    if (!reminderForm.title || !reminderForm.message || !reminderForm.scheduledAt) {
      addToast('Titre, message et date requis', 'warning');
      return;
    }
    try {
      await scheduleReminder(reminderForm);
      addToast('Rappel planifié avec succès', 'success');
      setShowReminderModal(false);
      setReminderForm({ title: '', message: '', type: 'reminder', scheduledAt: '', priority: 'medium', isRecurring: false, recurringInterval: null });
      loadReminders();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);
      addToast('Rappel supprimé', 'success');
      loadReminders();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const handleCompleteReminder = async (id) => {
    try {
      await updateReminderStatus(id, 'completed');
      addToast('Rappel marqué comme terminé', 'success');
      loadReminders();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChat();
      setChatHistory([]);
      addToast('Conversation effacée', 'success');
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'deadline': return '⏰';
      case 'call': return '📞';
      case 'task': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex gap-2 mb-4">
            {['chat', 'reminders'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'chat' ? '💬 Chat' : tab === 'automation' ? '⚡ Automatisation' : '🔔 Rappels'}
              </button>
            ))}
          </div>

          {activeTab === 'chat' && (
            <div className="space-y-4">


              <div className="flex gap-2 flex-wrap mb-3">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-full transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <p className="text-2xl mb-2">🤖</p>
                    <p>Posez-moi des questions sur votre application</p>
                    <p className="text-xs mt-2">Ex: "Liste les employés du département IT"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-100 ml-8' : 'bg-white mr-8 border'}`}>
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                        {msg.role === 'user' ? 'Vous' : 'Assistant IA'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>En train de reflechir...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="Posez une question..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleChat()}
                />
                <button
                  onClick={handleChat}
                  disabled={loading || !chatInput.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Envoyer
                </button>
                {chatHistory.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
                    title="Effacer"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          )}



          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gestion des rappels</h3>
                {canManage && (
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    + Nouveau rappel
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Aucun rappel planifie</p>
                ) : (
                  reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-slate-500">{reminder.message}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                              {reminder.priority}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(reminder.scheduledAt).toLocaleString('fr-FR')}
                            </span>
                            {reminder.projectName && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                {reminder.projectName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {reminder.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteReminder(reminder.id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            Terminer
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold mb-3">Questions suggerees</h3>
          <div className="space-y-2">
            {suggestionQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(q)}
                className="w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white">
          <h3 className="font-semibold mb-2">Assistant IA</h3>
          <p className="text-sm text-indigo-100">
            Posez des questions en langage naturel. Je peux aussi creer et gerer vos donnees.
          </p>
        </div>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowReminderModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md shadow-xl w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Planifier un rappel</h3>
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Titre du rappel"
                value={reminderForm.title}
                onChange={e => setReminderForm({ ...reminderForm, title: e.target.value })}
              />
              <textarea
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Message"
                rows={2}
                value={reminderForm.message}
                onChange={e => setReminderForm({ ...reminderForm, message: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={reminderForm.type}
                  onChange={e => setReminderForm({ ...reminderForm, type: e.target.value })}
                >
                  <option value="reminder">Rappel</option>
                  <option value="meeting">Reunion</option>
                  <option value="deadline">Deadline</option>
                  <option value="call">Appel</option>
                  <option value="task">Tache</option>
                </select>
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={reminderForm.priority}
                  onChange={e => setReminderForm({ ...reminderForm, priority: e.target.value })}
                >
                  <option value="low">Priorite: Basse</option>
                  <option value="medium">Priorite: Moyenne</option>
                  <option value="high">Priorite: Haute</option>
                  <option value="urgent">Priorite: Urgente</option>
                </select>
              </div>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg"
                value={reminderForm.scheduledAt}
                onChange={e => setReminderForm({ ...reminderForm, scheduledAt: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSaveReminder} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">
                Sauvegarder
              </button>
              <button onClick={() => setShowReminderModal(false)} className="flex-1 py-2 border rounded-lg">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
}