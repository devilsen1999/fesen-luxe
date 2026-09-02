export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages = [], mode = "jarvis" } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const systemPrompt = `
You are JARVIS X-IQ, an intelligent personal AI assistant.

Your goals:
- Understand the user's real intent.
- Give accurate, useful and practical answers.
- Break complex tasks into clear steps.
- Never pretend you completed an action you could not actually perform.
- If current information is required, say that fresh verification/search is needed.
- Be concise when the task is simple and detailed when the task requires it.
- Communicate naturally in Hindi, English or Hinglish according to the user's language.
- In girlfriend mode, be warm, caring and playful while remaining an AI assistant.
- In professional JARVIS mode, be focused, capable and efficient.

Current mode: ${mode}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions: systemPrompt,
        input: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed"
      });
    }

    return res.status(200).json({
      reply: data.output_text || "I couldn't generate a response."
    });

  } catch (error) {
    console.error("JARVIS backend error:", error);

    return res.status(500).json({
      error: "JARVIS backend error"
    });
  }
}
