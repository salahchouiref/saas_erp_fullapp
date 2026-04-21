const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama';

const buildBodyOpenAI = (model, prompt, options) => ({
  model,
  prompt,
  temperature: options.temperature ?? 0.3,
  max_tokens: options.maxTokens ?? 1024,
});

const buildBodyNative = (model, prompt, options) => ({
  model,
  prompt,
  stream: false,
  options: {
    temperature: options.temperature ?? 0.3,
    num_predict: options.maxTokens ?? 1024,
  }
});

const callOllama = async (prompt, options = {}) => {
  const modelName = OLLAMA_MODEL;
  
  let response = null;
  let lastError = null;
  
  // Try OpenAI-compatible endpoint first
  try {
    const openaiUrl = `${OLLAMA_API_URL}/v1/completions`;
    response = await fetch(openaiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBodyOpenAI(modelName, prompt, options)),
    });

    if (response.ok) {
      const json = await response.json();
      if (json?.choices && json.choices.length > 0) {
        return json.choices[0]?.text || json.choices[0]?.message?.content || '';
      }
      if (json?.completion) {
        return json.completion;
      }
    }
  } catch (e) {
    lastError = e;
    console.log('OpenAI endpoint failed, trying native API');
  }

  // Try native Ollama API
  try {
    const nativeUrl = `${OLLAMA_API_URL}/api/generate`;
    response = await fetch(nativeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBodyNative(modelName, prompt, options)),
    });

    if (response.ok) {
      const json = await response.json();
      return json?.response || json?.text || JSON.stringify(json);
    }
  } catch (e) {
    lastError = e;
    console.log('Native API also failed');
  }

  // If both fail, throw error
  if (!response || !response.ok) {
    const errorText = response ? await response.text() : lastError?.message || 'Unknown error';
    throw new Error(`Ollama request failed: ${response?.status || 'unavailable'} - ${errorText}`);
  }

  return 'Désolé, je n\'ai pas pu générer de réponse. Veuillez vérifier que Ollama est en cours d\'exécution.';
};

module.exports = {
  callOllama,
};