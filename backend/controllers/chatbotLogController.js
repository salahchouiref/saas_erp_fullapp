const ChatbotLog = require('../models/ChatbotLog');

exports.createChatbotLog = async (req, res) => {
  try {
    const log = await ChatbotLog.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatbotLogs = async (req, res) => {
  try {
    const logs = await ChatbotLog.find().populate('userId');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatbotLog = async (req, res) => {
  try {
    const log = await ChatbotLog.findById(req.params.id).populate('userId');
    if (!log) return res.status(404).json({ message: 'Chatbot log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateChatbotLog = async (req, res) => {
  try {
    const log = await ChatbotLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ message: 'Chatbot log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteChatbotLog = async (req, res) => {
  try {
    const log = await ChatbotLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Chatbot log not found' });
    res.json({ message: 'Chatbot log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
