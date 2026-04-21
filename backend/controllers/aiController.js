const { callOllama } = require('../services/ollamaService');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Client = require('../models/Client');

const assistantPrompt = (message) => `You are the AI assistant for a SaaS audit management application. Answer user questions clearly and help with audits, clients, employees, and projects.

User: ${message}

Assistant:`;

const automationPrompt = (message) => `You are an automation assistant for a SaaS audit app that manages employees, projects and clients.
Respond ONLY with valid JSON and no markdown.
Use the following schema:
{
  "type": "query|create|update|delete|none",
  "entity": "employee|project|client|none",
  "id": "optional id for update/delete",
  "data": { ... },
  "query": { ... },
  "responseText": "optional human-friendly response"
}

Use type "query" for search and filter requests, type "create" to add a new record, type "update" to modify an existing record, and type "delete" to remove a record.
If the user only wants information and no changes, use type "query".
If the request cannot be mapped to an app operation, return type "none" and provide responseText.

User request: ${message}
`; 

const parseJson = (text) => {
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return null;
    }
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch (error) {
    return null;
  }
};

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const result = await callOllama(assistantPrompt(message), { temperature: 0.3, maxTokens: 512 });
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.automate = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const result = await callOllama(automationPrompt(message), { temperature: 0.2, maxTokens: 512 });
    const action = parseJson(result);
    if (!action) {
      return res.json({ message: 'AI did not produce valid automation JSON.', raw: result });
    }

    const { type, entity, id, data, query, responseText } = action;
    const entityMap = { employee: Employee, project: Project, client: Client };
    const Model = entityMap[entity];

    if (!Model) {
      return res.json({ message: responseText || 'Entity not supported for automation.' });
    }

    if (type === 'query') {
      const items = await Model.find(query || {}).limit(200);
      return res.json({ items, responseText: responseText || 'Query performed successfully.' });
    }

    if (type === 'create') {
      const created = await Model.create(data || {});
      return res.json({ item: created, responseText: responseText || `${entity} created successfully.` });
    }

    if (type === 'update') {
      const updated = await Model.findByIdAndUpdate(id, data || {}, { new: true });
      if (!updated) return res.status(404).json({ message: `${entity} not found.` });
      return res.json({ item: updated, responseText: responseText || `${entity} updated successfully.` });
    }

    if (type === 'delete') {
      const deleted = await Model.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: `${entity} not found.` });
      return res.json({ item: deleted, responseText: responseText || `${entity} deleted successfully.` });
    }

    return res.json({ message: responseText || 'No automation action executed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
