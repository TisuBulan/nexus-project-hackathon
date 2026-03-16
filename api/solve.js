// ─────────────────────────────────────────────────────────────
//  api/solve.js  —  Vercel Serverless Function (Proxy)
//
//  Fungsi ini berjalan di SERVER milik Vercel, bukan di browser.
//  API key Anthropic disimpan sebagai environment variable Vercel,
//  sehingga tidak pernah terekspos ke pengguna.
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  // Hanya izinkan method POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Ambil API key dari environment variable Vercel (BUKAN dari kode)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key belum dikonfigurasi di server." });
  }

  try {
    // Teruskan request dari browser ke Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,                    // Key hanya ada di sini, di server
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),           // Teruskan body dari browser
    });

    const data = await response.json();

    // Kirimkan respons Anthropic kembali ke browser
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
