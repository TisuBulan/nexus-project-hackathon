// ─────────────────────────────────────────────────────────────
//  api/solve.js  —  Vercel Serverless Function (Proxy)
//  Menggunakan Groq API (GRATIS) dengan model Llama 3.3 70B
// ─────────────────────────────────────────────────────────────
 
export default async function handler(req, res) {
 
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
 
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key belum dikonfigurasi di server." });
  }
 
  try {
    const { messages, system } = req.body;
 
    const groqMessages = [];
    if (system) {
      groqMessages.push({ role: "system", content: system });
    }
    if (messages && messages.length > 0) {
      groqMessages.push(...messages);
    }
 
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }
 
    // Konversi format Groq ke format Anthropic agar index.html tidak perlu diubah
    const converted = {
      content: [
        {
          type: "text",
          text: data.choices?.[0]?.message?.content || ""
        }
      ]
    };
 
    return res.status(200).json(converted);
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
