const { callOllama } = require('../services/ollamaService');
const Employee = require('../models/Employee');
const { Project, Task } = require('../models/Project');
const Client = require('../models/Client');
const User = require('../models/User');
const Reminder = require('../models/Reminder');

const conversationHistory = {};

const getDatabaseContext = async () => {
  try {
    const [employees, clients, projects, tasks, users] = await Promise.all([
      Employee.find({}).limit(100).lean(),
      Client.find({}).limit(100).lean(),
      Project.find({}).limit(50).lean(),
      Task.find({}).limit(50).lean(),
      User.find({}).limit(50).lean()
    ]);

    return {
      employees: employees.map(e => ({
        id: e._id,
        nom: `${e.firstName} ${e.lastName}`,
        email: e.email,
        poste: e.position,
        departement: e.department,
        statut: e.status,
        salaire: e.salary,
        dateEmbauche: e.hireDate
      })),
      clients: clients.map(c => ({
        id: c._id,
        nom: c.name,
        email: c.email,
        entreprise: c.company,
        secteur: c.industry,
        telephone: c.phone,
        statut: c.status,
        adresse: c.address
      })),
      projects: projects.map(p => ({
        id: p._id,
        nom: p.name,
        description: p.description,
        statut: p.status,
        priorite: p.priority,
        progression: p.progress,
        budget: p.budget,
        debut: p.startDate,
        fin: p.endDate,
        clientId: p.clientId
      })),
      tasks: tasks.map(t => ({
        id: t._id,
        titre: t.title,
        statut: t.status,
        priorite: t.priority,
        projetId: t.projectId,
        employeId: t.assignedTo,
        echeance: t.dueDate
      })),
      users: users.map(u => ({
        id: u._id,
        nom: u.name,
        email: u.email,
        role: u.role,
        statut: u.status
      })),
      stats: {
        totalEmployes: employees.length,
        employesActifs: employees.filter(e => e.status === 'active').length,
        totalClients: clients.length,
        clientsActifs: clients.filter(c => c.status === 'active').length,
        totalProjets: projects.length,
        projetsActifs: projects.filter(p => p.status === 'active').length,
        projetsTermines: projects.filter(p => p.status === 'completed').length,
        totalTaches: tasks.length,
        tachesTerminees: tasks.filter(t => t.status === 'completed').length,
        totalUsers: users.length
      }
    };
  } catch (error) {
    console.error('Error fetching database context:', error.message);
    return null;
  }
};

const assistantSystemPrompt = (dbContext) => `Tu es l'assistant IA expert pour une application SaaS de gestion d'audit d'entreprise au Maroc.

CONTEXTE DE L'APPLICATION:
- Application SaaS de gestion d'entreprise
- Utilisée au Maroc (données en français)
- Entités gérées: Employés, Clients, Projets, Tâches, Utilisateurs

DONNÉES ACTUELLES DE LA BASE DE DONNÉES:
${JSON.stringify(dbContext, null, 2)}

CAPACITÉS DE L'ASSISTANT:
1. **Questions sur les données**: LISTER, COMPTER, RECHERCHER les enregistrements
2. **Statistiques**: Calculer des métriques depuis les données réelles
3. **Actions CRUD**: Créer, modifier, supprimer des enregistrements
4. **Recommandations**: Analyser et suggérer des actions

RÈGLES CRITIQUES - SUIS CES RÈGLES IMPÉRATIVEMENT:
1. Utilise TOUJOURS les données réelles ci-dessus pour répondre
2. Pour "combien", "liste", "affiche" - compte/liste depuis les données JSON
3. Pour les statistiques - calcule depuis les données réelles
4. Ne JAMAIS inventer des données qui ne sont pas dans le JSON
5. Si tu ne trouves pas la réponse dans les données, dis "Je n'ai pas cette information dans la base de données"
6. Réponds en français de manière professionnelle
7. Sois précis avec les noms, dates, chiffres des données

QUESTION DE L'UTILISATEUR:`;



const parseQueryIntent = (message) => {
  const lower = message.toLowerCase();
  
  const patterns = {
    employee: ['employé', 'employee', 'staff', 'personnel', 'collaborateur', 'employe'],
    client: ['client', 'clientèle', 'customer'],
    project: ['projet', 'project'],
    task: ['tâche', 'task', 'tache'],
    user: ['utilisateur', 'user', 'compte'],
    stats: ['statistique', 'stat', 'dashboard', 'tableau de bord', 'combien', 'total', 'nombre', 'nombreux']
  };
  
  for (const [entity, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => lower.includes(k))) {
      return entity;
    }
  }
  return 'general';
};

const answerFromDatabase = async (intent, message, dbContext) => {
  const lower = message.toLowerCase();
  const stats = dbContext.stats || {};
  
  switch (intent) {
    case 'employee': {
      let employees = dbContext.employees || [];
      
      if (lower.includes('actif') || lower.includes('active')) {
        employees = employees.filter(e => e.statut === 'active');
      }
      
      if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
        if (employees.length === 0) return { text: 'Aucun employé trouvé dans la base de données.', data: [] };
        const list = employees.map(e => `• ${e.nom} | ${e.poste || 'N/A'} | ${e.departement || 'N/A'} | ${e.statut || 'N/A'}`).join('\n');
        return { text: `Voici la liste des employés (${employees.length}):\n\n${list}`, data: employees };
      }
      
      if (lower.includes('département') || lower.includes('departement')) {
        const dept = lower.match(/département\s+(\w+)/i)?.[1] || lower.match(/departement\s+(\w+)/i)?.[1];
        if (dept) {
          employees = employees.filter(e => e.departement?.toLowerCase().includes(dept));
        }
      }
      
      if (employees.length <= 5 && employees.length > 0) {
        const list = employees.map(e => `• ${e.nom} - ${e.poste} - ${e.email}`).join('\n');
        return { text: `Employés trouvés (${employees.length}):\n\n${list}`, data: employees };
      }
      
      return { 
        text: `J'ai ${employees.length} employés dans la base${employees.filter(e => e.statut === 'active').length > 0 ? ` (${employees.filter(e => e.statut === 'active').length} actifs)` : ''}.\n\n` +
          `Voulez-vous que je liste tous les employés? Ou rechercher par département?`, 
        data: employees 
      };
    }
    
    case 'client': {
      let clients = dbContext.clients || [];
      
      if (lower.includes('actif') || lower.includes('active')) {
        clients = clients.filter(c => c.statut === 'active');
      }
      
      if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
        if (clients.length === 0) return { text: 'Aucun client trouvé.', data: [] };
        const list = clients.map(c => `• ${c.nom} | ${c.entreprise || 'N/A'} | ${c.secteur || 'N/A'} | ${c.statut || 'N/A'}`).join('\n');
        return { text: `Voici la liste des clients (${clients.length}):\n\n${list}`, data: clients };
      }
      
      if (clients.length <= 5 && clients.length > 0) {
        const list = clients.map(c => `• ${c.nom} - ${c.entreprise} - ${c.email}`).join('\n');
        return { text: `Clients trouvés (${clients.length}):\n\n${list}`, data: clients };
      }
      
      return { text: `J'ai ${clients.length} clients${clients.filter(c => c.statut === 'active').length > 0 ? ` (${clients.filter(c => c.statut === 'active').length} actifs)` : ''}.`, data: clients };
    }
    
    case 'project': {
      let projects = dbContext.projects || [];
      
      if (lower.includes('actif') || lower.includes('active')) {
        projects = projects.filter(p => p.statut === 'active' || p.statut === 'in_progress');
      }
      
      if (lower.includes('termine') || lower.includes('completed') || lower.includes('fini')) {
        projects = projects.filter(p => p.statut === 'completed');
      }
      
      if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
        if (projects.length === 0) return { text: 'Aucun projet trouvé.', data: [] };
        const list = projects.map(p => `• ${p.nom} | ${p.statut || 'N/A'} | ${p.progression || 0}% | Priorité: ${p.priorite || 'N/A'}`).join('\n');
        return { text: `Voici la liste des projets (${projects.length}):\n\n${list}`, data: projects };
      }
      
      if (lower.includes('retard') || lower.includes('en retard')) {
        const delayed = projects.filter(p => p.statut === 'in_progress');
        if (delayed.length === 0) return { text: 'Aucun projet en retard.', data: [] };
        const list = delayed.map(p => `• ${p.nom} - ${p.progression}%`).join('\n');
        return { text: `Projets en cours (${delayed.length}):\n\n${list}`, data: delayed };
      }
      
      return { text: `J'ai ${projects.length} projets (${projects.filter(p => p.statut === 'active' || p.statut === 'in_progress').length} en cours).`, data: projects };
    }
    
    case 'task': {
      const tasks = dbContext.tasks || [];
      
      if (lower.includes('liste') || lower.includes('affic') || lower.includes('tout')) {
        if (tasks.length === 0) return { text: 'Aucune tâche trouvée.', data: [] };
        const list = tasks.slice(0, 20).map(t => `• ${t.titre} | ${t.statut || 'N/A'} | Priorité: ${t.priorite || 'N/A'}`).join('\n');
        return { text: `Voici les tâches (${tasks.length}):\n\n${list}`, data: tasks };
      }
      
      return { text: `J'ai ${tasks.length} tâches (${tasks.filter(t => t.statut === 'done' || t.statut === 'completed').length} terminées).`, data: tasks };
    }
    
    case 'stats':
    case 'general': {
      if (lower.includes('stat') || lower.includes('dashboard') || lower.includes('tableau de bord')) {
        return {
          text: `📊 TABLEAU DE BORD\n\n` +
            `👥 EMPLOYÉS: ${stats.totalEmployes || 0} total (${stats.employesActifs || 0} actifs)\n` +
            `🏢 CLIENTS: ${stats.totalClients || 0} total (${stats.clientsActifs || 0} actifs)\n` +
            `📁 PROJETS: ${stats.totalProjets || 0} total (${stats.projetsActifs || 0} actifs, ${stats.projetsTermines || 0} terminés)\n` +
            `✅ TÂCHES: ${stats.totalTaches || 0} total (${stats.tachesTerminees || 0} terminées)\n` +
            `👤 UTILISATEURS: ${stats.totalUsers || 0}`,
          data: stats
        };
      }
      
      if (lower.includes('employé') || lower.includes('employee')) {
        return { text: `Employés: ${stats.totalEmployes || 0} (${stats.employesActifs || 0} actifs)`, data: { count: stats.totalEmployes, active: stats.employesActifs } };
      }
      if (lower.includes('client')) {
        return { text: `Clients: ${stats.totalClients || 0} (${stats.clientsActifs || 0} actifs)`, data: { count: stats.totalClients, active: stats.clientsActifs } };
      }
      if (lower.includes('projet') || lower.includes('project')) {
        return { text: `Projets: ${stats.totalProjets || 0} (${stats.projetsActifs || 0} actifs, ${stats.projetsTermines || 0} terminés)`, data: { count: stats.totalProjets, active: stats.projetsActifs, completed: stats.projetsTermines } };
      }
      
      return {
        text: `📊 STATISTIQUES GLOBALES:\n\n` +
          `• ${stats.totalEmployes || 0} employés\n` +
          `• ${stats.totalClients || 0} clients\n` +
          `• ${stats.totalProjets || 0} projets\n` +
          `• ${stats.totalTaches || 0} tâches\n\n` +
          `Posez une question plus précise!`,
        data: stats
      };
    }
    
    default:
      return null;
  }
};

const enhanceWithAI = async (dbAnswer, userMessage, dbContext) => {
  if (!dbAnswer || !dbAnswer.data) return dbAnswer?.text || '';
  
  const dataPreview = JSON.stringify(dbAnswer.data.slice(0, 10), null, 2);
  
  const enhancementPrompt = `Tu es un assistant IA pour une application SaaS de gestion d'entreprise.

L'utilisateur a demandé: "${userMessage}"

Voici les données répondues depuis la base:
${dataPreview}

Analyse ces données et fournis une réponse utile et contexte supplémentaire en français. Sois concis (2-3 phrases max).`;

  try {
    const enhanced = await callOllama(enhancementPrompt, { temperature: 0.3, maxTokens: 256 });
    return `${dbAnswer.text}\n\n💡 ${enhanced}`;
  } catch (e) {
    return dbAnswer.text;
  }
};

exports.chat = async (req, res) => {
  const { message, conversationId } = req.body;
  if (!message) return res.status(400).json({ message: 'Message requis' });

  const user = req.user;
  const convId = conversationId || user?.id || 'default';
  const userRole = user?.role || 'employee';
  
  try {
    let dbContext = null;
    try {
      dbContext = await getDatabaseContext();
    } catch (dbError) {
      console.error('Error fetching database context:', dbError.message);
    }
    
    const intent = parseQueryIntent(message);
    const isDataQuery = intent !== 'general' || message.toLowerCase().includes('liste') || 
                        message.toLowerCase().includes('affic') || message.toLowerCase().includes('combien') ||
                        message.toLowerCase().includes('stat');
    
    let result;
    let source = 'db';
    
    if (isDataQuery && dbContext) {
      const dbAnswer = await answerFromDatabase(intent, message, dbContext);
      if (dbAnswer && dbAnswer.text) {
        try {
          result = await enhanceWithAI(dbAnswer, message, dbContext);
        } catch (aiError) {
          result = dbAnswer.text;
        }
      } else {
        source = 'ai';
        const prompt = `Tu es un assistant IA pour une application SaaS de gestion d'entreprise au Maroc.
L'utilisateur demande: "${message}"
Réponds en français de manière utile et concise.`;
        try {
          result = await callOllama(prompt, { temperature: 0.3, maxTokens: 512 });
        } catch (ollamaError) {
          result = 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
        }
      }
    } else {
      source = 'ai';
      const prompt = `Tu es un assistant IA pour une application SaaS de gestion d'entreprise au Maroc.
L'utilisateur demande: "${message}"
Contexte des données: ${JSON.stringify(dbContext?.stats || {})}
Réponds en français de manière utile.`;
      try {
        result = await callOllama(prompt, { temperature: 0.3, maxTokens: 512 });
      } catch (ollamaError) {
        console.log('Ollama not available, using fallback response');
        // Fallback responses based on message content
        const lower = message.toLowerCase();
        if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
          result = `Bonjour ! Je suis votre assistant IA pour la gestion d'entreprise. Comment puis-je vous aider aujourd'hui ?`;
        } else if (lower.includes('aide') || lower.includes('help')) {
          result = `Je peux vous aider avec :
• Les statistiques de votre entreprise
• Les informations sur les employés, clients et projets
• La gestion des rappels et tâches
• Les rapports et analyses

Posez-moi une question spécifique !`;
        } else if (dbContext) {
          result = `Je peux vous aider avec vos données :
• ${dbContext.stats?.totalEmployes || 0} employés
• ${dbContext.stats?.totalClients || 0} clients
• ${dbContext.stats?.totalProjets || 0} projets

Que souhaitez-vous savoir ?`;
        } else {
          result = 'Bonjour ! Je suis votre assistant IA. Posez-moi des questions sur vos employés, clients, projets ou demandez des statistiques.';
        }
      }
    }
    
    if (!conversationHistory[convId]) {
      conversationHistory[convId] = [];
    }
    conversationHistory[convId].push({ role: 'user', content: message });
    conversationHistory[convId].push({ role: 'assistant', content: result });
    
    res.json({ response: result, conversationId: convId, stats: dbContext?.stats, source });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
};



exports.scheduleReminder = async (req, res) => {
  const { title, message, type, scheduledAt, employeeId, projectId, priority, isRecurring, recurringInterval } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ message: 'Titre et message requis' });
  }

  if (!scheduledAt) {
    return res.status(400).json({ message: 'Date et heure requises' });
  }

  try {
    const reminder = await Reminder.create({
      title,
      message,
      type: type || 'reminder',
      createdBy: req.user?.id,
      employeeId,
      projectId,
      scheduledAt: new Date(scheduledAt),
      priority: priority || 'medium',
      status: 'pending',
      isRecurring: isRecurring || false,
      recurringInterval
    });

    res.json({ message: 'Rappel planifié avec succès', reminder });
  } catch (error) {
    console.error('Schedule reminder error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({})
      .populate('createdBy', 'name email')
      .populate('employeeId', 'name email')
      .populate('projectId', 'name')
      .sort({ scheduledAt: 1 })
      .limit(50)
      .lean();
    
    res.json({ 
      reminders: reminders.map(r => ({
        id: r._id,
        title: r.title,
        message: r.message,
        type: r.type,
        scheduledAt: r.scheduledAt,
        status: r.status,
        priority: r.priority,
        createdBy: r.createdBy?.name,
        employeeId: r.employeeId?._id,
        employeeName: r.employeeId?.name,
        projectId: r.projectId?._id,
        projectName: r.projectId?.name,
        isRecurring: r.isRecurring,
        recurringInterval: r.recurringInterval
      }))
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReminder = async (req, res) => {
  const { id } = req.params;
  
  try {
    await Reminder.findByIdAndDelete(id);
    res.json({ message: 'Rappel supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReminderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const reminder = await Reminder.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ message: 'Statut mis à jour', reminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearChat = async (req, res) => {
  const user = req.user;
  const convId = user?.id || 'default';
  delete conversationHistory[convId];
  res.json({ message: 'Historique effacé' });
};