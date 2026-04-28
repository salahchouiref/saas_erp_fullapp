const { callOllama } = require('../services/ollamaService');
const Employee = require('../models/Employee');
const { Project, Task } = require('../models/Project');
const Client = require('../models/Client');
const User = require('../models/User');
const Reminder = require('../models/Reminder');

const conversationHistory = {};

const performRAGLookup = async (query) => {
  try {
    const searchTerm = query.toLowerCase().trim();

    // Quick keyword detection for entity types
    const hasEmployeeKeywords = /\b(employé|employee|staff|personnel|collaborateur|développeur|manager|directeur)\b/i.test(searchTerm);
    const hasClientKeywords = /\b(client|clientèle|customer|entreprise|compagnie|société)\b/i.test(searchTerm);
    const hasProjectKeywords = /\b(projet|project|mission|chantier|étude)\b/i.test(searchTerm);
    const hasTaskKeywords = /\b(tâche|task|todo|action|travail)\b/i.test(searchTerm);
    const hasUserKeywords = /\b(utilisateur|user|compte|admin|superadmin)\b/i.test(searchTerm);

    // Determine which entities to search (prioritize detected entities, fallback to all)
    const entitiesToSearch = [];
    if (hasEmployeeKeywords) entitiesToSearch.push('employee');
    if (hasClientKeywords) entitiesToSearch.push('client');
    if (hasProjectKeywords) entitiesToSearch.push('project');
    if (hasTaskKeywords) entitiesToSearch.push('task');
    if (hasUserKeywords) entitiesToSearch.push('user');

    // If no keywords detected or general search, search priority entities
    if (entitiesToSearch.length === 0) {
      entitiesToSearch.push('employee', 'client', 'project');
    }

    const searchPromises = [];

    // Optimized: Only search name and email fields for speed
    if (entitiesToSearch.includes('employee')) {
      searchPromises.push(
        Employee.find({
          $or: [
            { firstName: { $regex: searchTerm, $options: 'i' } },
            { lastName: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        }).select('firstName lastName email position department status').limit(3).lean()
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (entitiesToSearch.includes('client')) {
      searchPromises.push(
        Client.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { company: { $regex: searchTerm, $options: 'i' } }
          ]
        }).select('name email company industry status').limit(3).lean()
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (entitiesToSearch.includes('project')) {
      searchPromises.push(
        Project.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } }
          ]
        }).select('name description status priority progress').limit(3).lean()
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (entitiesToSearch.includes('task')) {
      searchPromises.push(
        Task.find({
          title: { $regex: searchTerm, $options: 'i' }
        }).select('title status priority').limit(3).lean()
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (entitiesToSearch.includes('user')) {
      searchPromises.push(
        User.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        }).select('name email role status').limit(3).lean()
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    const [employees, clients, projects, tasks, users] = await Promise.all(searchPromises);

    const results = [];

    // Simplified data formatting for speed
    employees.forEach(emp => {
      results.push({
        type: 'EMPLOYÉ',
        data: {
          nom: `${emp.firstName} ${emp.lastName}`,
          poste: emp.position,
          statut: emp.status
        }
      });
    });

    clients.forEach(client => {
      results.push({
        type: 'CLIENT',
        data: {
          nom: client.name,
          entreprise: client.company,
          statut: client.status
        }
      });
    });

    projects.forEach(project => {
      results.push({
        type: 'PROJET',
        data: {
          nom: project.name,
          statut: project.status,
          progression: `${project.progress || 0}%`
        }
      });
    });

    tasks.forEach(task => {
      results.push({
        type: 'TÂCHE',
        data: {
          titre: task.title,
          statut: task.status
        }
      });
    });

    users.forEach(user => {
      results.push({
        type: 'UTILISATEUR',
        data: {
          nom: user.name,
          rôle: user.role
        }
      });
    });

    return results.slice(0, 5); // Limit to 5 most relevant results
  } catch (error) {
    console.error('RAG lookup error:', error.message);
    return [];
  }
};

// Cache for database stats (refresh every 5 minutes)
let cachedStats = null;
let statsLastUpdated = 0;
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getDatabaseStats = async () => {
  const now = Date.now();
  if (cachedStats && (now - statsLastUpdated) < STATS_CACHE_TTL) {
    return cachedStats;
  }

  try {
    const [employeeStats, clientStats, projectStats, taskStats, userStats] = await Promise.all([
      Employee.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }
          }
        }
      ]),
      Client.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }
          }
        }
      ]),
      Project.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $in: ["$status", ["active", "in_progress"]] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
          }
        }
      ]),
      Task.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $in: ["$status", ["done", "completed"]] }, 1, 0] } }
          }
        }
      ]),
      User.countDocuments()
    ]);

    cachedStats = {
      totalEmployes: employeeStats[0]?.total || 0,
      employesActifs: employeeStats[0]?.active || 0,
      totalClients: clientStats[0]?.total || 0,
      clientsActifs: clientStats[0]?.active || 0,
      totalProjets: projectStats[0]?.total || 0,
      projetsActifs: projectStats[0]?.active || 0,
      projetsTermines: projectStats[0]?.completed || 0,
      totalTaches: taskStats[0]?.total || 0,
      tachesTerminees: taskStats[0]?.completed || 0,
      totalUsers: userStats || 0
    };

    statsLastUpdated = now;
    return cachedStats;
  } catch (error) {
    console.error('Error fetching database stats:', error.message);
    return {
      totalEmployes: 0,
      employesActifs: 0,
      totalClients: 0,
      clientsActifs: 0,
      totalProjets: 0,
      projetsActifs: 0,
      projetsTermines: 0,
      totalTaches: 0,
      tachesTerminees: 0,
      totalUsers: 0
    };
  }
};

const assistantSystemPrompt = (dbContext) => `Assistant IA SaaS Marocain.

CONTEXTE: ${JSON.stringify(dbContext)}

CAPACITÉS:
- Consultation données (lister, compter, rechercher)
- Statistiques et métriques
- Actions CRUD
- Recommandations

RÈGLES:
- Données vérifiées uniquement
- Français professionnel
- Précision maximale
- "Non disponible" si absent

QUESTION:`;



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

  switch (intent) {
    case 'employee': {
      try {
        // Optimized: Only fetch when needed
        let query = {};
        if (lower.includes('actif') || lower.includes('active')) {
          query.status = 'active';
        }

        if (lower.includes('département') || lower.includes('departement')) {
          const dept = lower.match(/département\s+(\w+)/i)?.[1] || lower.match(/departement\s+(\w+)/i)?.[1];
          if (dept) {
            query.department = { $regex: dept, $options: 'i' };
          }
        }

        const employees = await Employee.find(query).select('firstName lastName email position department status').limit(20).lean();
        const formattedEmployees = employees.map(e => ({
          nom: `${e.firstName} ${e.lastName}`,
          email: e.email,
          poste: e.position,
          departement: e.department,
          statut: e.status
        }));

        if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
          if (formattedEmployees.length === 0) return { text: 'Aucun employé trouvé.', data: [] };
          const list = formattedEmployees.map(e => `• ${e.nom} | ${e.poste || 'N/A'} | ${e.departement || 'N/A'} | ${e.statut || 'N/A'}`).join('\n');
          return { text: `Employés (${formattedEmployees.length}):\n\n${list}`, data: formattedEmployees };
        }

        if (formattedEmployees.length <= 5 && formattedEmployees.length > 0) {
          const list = formattedEmployees.map(e => `• ${e.nom} - ${e.poste} - ${e.email}`).join('\n');
          return { text: `Employés trouvés (${formattedEmployees.length}):\n\n${list}`, data: formattedEmployees };
        }

        const stats = dbContext?.stats || {};
        return {
          text: `J'ai ${stats.totalEmployes || 0} employés${stats.employesActifs ? ` (${stats.employesActifs} actifs)` : ''}.`,
          data: formattedEmployees
        };
      } catch (error) {
        console.error('Employee query error:', error);
        return { text: 'Erreur lors de la recherche d\'employés.', data: [] };
      }
    }

    case 'client': {
      try {
        let query = {};
        if (lower.includes('actif') || lower.includes('active')) {
          query.status = 'active';
        }

        const clients = await Client.find(query).select('name email company industry status').limit(20).lean();
        const formattedClients = clients.map(c => ({
          nom: c.name,
          email: c.email,
          entreprise: c.company,
          secteur: c.industry,
          statut: c.status
        }));

        if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
          if (formattedClients.length === 0) return { text: 'Aucun client trouvé.', data: [] };
          const list = formattedClients.map(c => `• ${c.nom} | ${c.entreprise || 'N/A'} | ${c.secteur || 'N/A'} | ${c.statut || 'N/A'}`).join('\n');
          return { text: `Clients (${formattedClients.length}):\n\n${list}`, data: formattedClients };
        }

        if (formattedClients.length <= 5 && formattedClients.length > 0) {
          const list = formattedClients.map(c => `• ${c.nom} - ${c.entreprise} - ${c.email}`).join('\n');
          return { text: `Clients trouvés (${formattedClients.length}):\n\n${list}`, data: formattedClients };
        }

        const stats = dbContext?.stats || {};
        return {
          text: `J'ai ${stats.totalClients || 0} clients${stats.clientsActifs ? ` (${stats.clientsActifs} actifs)` : ''}.`,
          data: formattedClients
        };
      } catch (error) {
        console.error('Client query error:', error);
        return { text: 'Erreur lors de la recherche de clients.', data: [] };
      }
    }

    case 'project': {
      try {
        let query = {};
        if (lower.includes('actif') || lower.includes('active')) {
          query.status = { $in: ['active', 'in_progress'] };
        }
        if (lower.includes('termine') || lower.includes('completed') || lower.includes('fini')) {
          query.status = 'completed';
        }

        const projects = await Project.find(query).select('name description status priority progress').limit(20).lean();
        const formattedProjects = projects.map(p => ({
          nom: p.name,
          description: p.description,
          statut: p.status,
          priorite: p.priority,
          progression: p.progress
        }));

        if (lower.includes('liste') || lower.includes('affic') || lower.includes('list') || lower.includes('tout')) {
          if (formattedProjects.length === 0) return { text: 'Aucun projet trouvé.', data: [] };
          const list = formattedProjects.map(p => `• ${p.nom} | ${p.statut || 'N/A'} | ${p.progression || 0}% | Priorité: ${p.priorite || 'N/A'}`).join('\n');
          return { text: `Projets (${formattedProjects.length}):\n\n${list}`, data: formattedProjects };
        }

        const stats = dbContext?.stats || {};
        return {
          text: `J'ai ${stats.totalProjets || 0} projets (${stats.projetsActifs || 0} actifs, ${stats.projetsTermines || 0} terminés).`,
          data: formattedProjects
        };
      } catch (error) {
        console.error('Project query error:', error);
        return { text: 'Erreur lors de la recherche de projets.', data: [] };
      }
    }

    case 'task': {
      try {
        const tasks = await Task.find({}).select('title status priority').limit(20).lean();
        const formattedTasks = tasks.map(t => ({
          titre: t.title,
          statut: t.status,
          priorite: t.priority
        }));

        if (lower.includes('liste') || lower.includes('affic') || lower.includes('tout')) {
          if (formattedTasks.length === 0) return { text: 'Aucune tâche trouvée.', data: [] };
          const list = formattedTasks.slice(0, 20).map(t => `• ${t.titre} | ${t.statut || 'N/A'} | Priorité: ${t.priorite || 'N/A'}`).join('\n');
          return { text: `Tâches (${formattedTasks.length}):\n\n${list}`, data: formattedTasks };
        }

        const stats = dbContext?.stats || {};
        return {
          text: `J'ai ${stats.totalTaches || 0} tâches (${stats.tachesTerminees || 0} terminées).`,
          data: formattedTasks
        };
      } catch (error) {
        console.error('Task query error:', error);
        return { text: 'Erreur lors de la recherche de tâches.', data: [] };
      }
    }
    
    case 'stats':
    case 'general': {
      const stats = dbContext?.stats || {};

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
        text: `📊 STATISTIQUES:\n\n` +
          `• ${stats.totalEmployes || 0} employés\n` +
          `• ${stats.totalClients || 0} clients\n` +
          `• ${stats.totalProjets || 0} projets\n` +
          `• ${stats.totalTaches || 0} tâches\n\n` +
          `Posez une question précise!`,
        data: stats
      };
    }
    
    default:
      return null;
  }
};

const enhanceWithAI = async (dbAnswer, userMessage, dbContext) => {
  if (!dbAnswer || !dbAnswer.data) return dbAnswer?.text || '';

  // Perform RAG lookup first
  const ragResults = await performRAGLookup(userMessage);
  const ragContext = ragResults.length > 0 ?
    `\n\nDONNÉES RAG PERTINENTES:\n${JSON.stringify(ragResults, null, 2)}` : '';

  const dataPreview = Array.isArray(dbAnswer.data)
    ? JSON.stringify(dbAnswer.data.slice(0, 10), null, 2)
    : JSON.stringify(dbAnswer.data, null, 2);

  const enhancementPrompt = `Assistant IA SaaS Marocain.

CONTEXTE: ${JSON.stringify(dbContext)}

RAG: ${ragContext || 'Aucune'}

QUESTION: "${userMessage}"

DONNÉES: ${dataPreview}

INSTRUCTIONS:
- Utilise UNIQUEMENT les données ci-dessus
- Réponds en français professionnel
- Précis et concis
- Si donnée absente: "Non disponible"

RÉPONSE:`;

  try {
    const enhanced = await callOllama(enhancementPrompt, { temperature: 0.2, maxTokens: 512 });
    return enhanced;
  } catch (e) {
    console.error('Ollama enhancement error:', e);
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
    let dbStats = null;
    try {
      dbStats = await getDatabaseStats();
    } catch (dbError) {
      console.error('Error fetching database stats:', dbError.message);
      dbStats = { totalEmployes: 0, employesActifs: 0, totalClients: 0, clientsActifs: 0, totalProjets: 0, projetsActifs: 0, projetsTermines: 0, totalTaches: 0, tachesTerminees: 0, totalUsers: 0 };
    }
    
    const intent = parseQueryIntent(message);
    const isDataQuery = intent !== 'general' || message.toLowerCase().includes('liste') || 
                        message.toLowerCase().includes('affic') || message.toLowerCase().includes('combien') ||
                        message.toLowerCase().includes('stat');
    
    let result;
    let source = 'db';
    
      if (isDataQuery && dbStats) {
      const dbAnswer = await answerFromDatabase(intent, message, { stats: dbStats });
      if (dbAnswer && dbAnswer.text) {
        try {
          result = await enhanceWithAI(dbAnswer, message, { stats: dbStats });
        } catch (aiError) {
          console.error('AI enhancement error:', aiError);
          result = dbAnswer.text;
        }
      } else {
        source = 'ai';
        const ragResults = await performRAGLookup(message);
        const ragContext = ragResults.length > 0 ?
          `\n\nDONNÉES RAG PERTINENTES:\n${JSON.stringify(ragResults, null, 2)}` : '';

        const prompt = `Assistant IA SaaS Marocain.

RAG: ${ragContext || 'Aucune'}

QUESTION: "${message}"

INSTRUCTIONS:
- Utilise données RAG si disponibles
- Français professionnel
- Concis et précis

RÉPONSE:`;
        try {
          result = await callOllama(prompt, { temperature: 0.2, maxTokens: 512 });
        } catch (ollamaError) {
          console.error('Ollama error:', ollamaError);
          result = 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
        }
      }
    } else {
      source = 'ai';
      const ragResults = await performRAGLookup(message);
      const ragContext = ragResults.length > 0 ?
        `\n\nDONNÉES RAG PERTINENTES:\n${JSON.stringify(ragResults, null, 2)}` : '';

      const prompt = `Assistant IA SaaS Marocain.

STATS: ${JSON.stringify(dbStats || {})}

RAG: ${ragContext || 'Aucune'}

QUESTION: "${message}"

INSTRUCTIONS:
- Utilise statistiques et RAG
- Français professionnel
- Propose options si général

RÉPONSE:`;
      try {
        result = await callOllama(prompt, { temperature: 0.2, maxTokens: 1024 });
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
        } else if (dbStats) {
          result = `Je peux vous aider avec vos données :
• ${dbStats.totalEmployes || 0} employés
• ${dbStats.totalClients || 0} clients
• ${dbStats.totalProjets || 0} projets

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
    
    res.json({ response: result, conversationId: convId, stats: dbStats, source });
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