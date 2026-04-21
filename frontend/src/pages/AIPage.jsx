import { useState } from 'react';
import { sendChatMessage, sendAutomation } from '../api/ai';

export default function AIPage() {
  const [chatInput, setChatInput] = useState('');
  const [automationInput, setAutomationInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    setMessage('');
    const userMessage = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    
    try {
      const response = await sendChatMessage(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', text: response.response || response.message || 'Réponse reçue' }]);
    } catch (e) {
      setMessage(e.data?.message || 'Erreur lors de la communication avec l\'IA');
    } finally {
      setLoading(false);
    }
  };

  const handleAutomation = async () => {
    if (!automationInput.trim()) return;
    setLoading(true);
    setMessage('');
    
    try {
      const response = await sendAutomation(automationInput);
      setMessage(response.message || 'Commande exécutée');
      setAutomationInput('');
    } catch (e) {
      setMessage(e.data?.message || 'Erreur lors de l\'exécution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2">Chatbot IA</h2>
        <p className="text-sm text-slate-500 mb-4">Posez des questions en langage naturel.</p>
        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Tapez votre message..."
          className="w-full h-32 p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
        <button
          onClick={handleChat}
          disabled={loading || !chatInput.trim()}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2">Automatisation</h2>
        <p className="text-sm text-slate-500 mb-4">Exécutez des commandes métier.</p>
        <textarea
          value={automationInput}
          onChange={(e) => setAutomationInput(e.target.value)}
          placeholder="Ex: Crée un client nommé Entreprise X avec email contact@x.com"
          className="w-full h-32 p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
        <button
          onClick={handleAutomation}
          disabled={loading || !automationInput.trim()}
          className="mt-4 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {loading ? 'Exécution...' : 'Exécuter'}
        </button>
      </div>

      {message && (
        <div className="lg:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          {message}
        </div>
      )}

      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Historique de conversation</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucun message pour le moment.</p>
          ) : (
            chatHistory.map((entry, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  entry.role === 'user'
                    ? 'bg-indigo-50 text-slate-900 ml-8'
                    : 'bg-slate-100 text-slate-900 mr-8'
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                  {entry.role === 'user' ? 'Vous' : 'Assistant IA'}
                </p>
                <p className="text-sm leading-relaxed">{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}