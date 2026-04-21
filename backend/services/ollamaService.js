const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/v1/completions';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama:latest';

const buildBody = (model, prompt, options) => ({
  model,
  prompt,
  temperature: options.temperature ?? 0.2,
  max_tokens: options.maxTokens ?? 512,
});

const callOllama = async (prompt, options = {}) => {
  const modelName = OLLAMA_MODEL;
  let response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(modelName, prompt, options)),
  });

  if (!response.ok && response.status === 404 && !modelName.includes(':')) {
    const fallbackModel = `${modelName}:latest`;
    response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(fallbackModel, prompt, options)),
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  if (typeof json === 'string') {
    return json;
  }

  if (json?.completion) {
    return json.completion;
  }

  if (json?.choices && json.choices.length > 0) {
    return json.choices[0]?.text || json.choices[0]?.message?.content || JSON.stringify(json);
  }

  return JSON.stringify(json);
};

module.exports = {
  callOllama,
};
