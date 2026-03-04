export default async (req) => {
  if (req.method !== "POST") return new Response("Not allowed", { status: 405 });
  try {
    const { messages } = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "Tu es un assistant de voyage expert en Thaïlande. Itinéraire Nov 2026: Bangkok 12-13, Koh Kood 13-17, Koh Chang 17-22, Bangkok 22-25. Réponds en français.", messages })
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  } catch { return new Response(JSON.stringify({ error: "erreur" }), { status: 500 }); }
};
export const config = { path: "/api/chat" };
