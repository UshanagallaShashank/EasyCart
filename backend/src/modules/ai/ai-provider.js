// Asks an AI model for a short piece of text. This file never reads the environment, so it can be tested with a fake network.
// Gemini (Google AI Studio) is used because its free tier needs no card; anything else means "AI is off".
function create_gemini_writer({ api_key, model, http }) {
  return {
    name: 'gemini',
    async write(system, prompt) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const response = await http(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': api_key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
        })
      });
      if (!response.ok) throw new Error(`The AI service answered ${response.status}`);
      const data = await response.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? []).map((part) => part?.text ?? '').join('').trim();
      if (!text) throw new Error('The AI service sent back no text');
      return text;
    }
  };
}

export function create_ai_writer({ enabled, provider, api_key, model, http = fetch }) {
  if (enabled && provider === 'gemini' && api_key) return create_gemini_writer({ api_key, model, http });
  return { name: 'none', write: async () => null };
}
