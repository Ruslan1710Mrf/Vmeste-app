const { AI_SYSTEM_PROMPT } = require('../../lib/aiSystemPrompt') as {
  AI_SYSTEM_PROMPT: string;
};

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getAnthropicApiKey() {
  return (
    process.env.ANTHROPIC_API_KEY ??
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ??
    ''
  );
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(request: Request) {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return Response.json(
      { error: 'Не задан API-ключ Anthropic на сервере.' },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректный JSON в запросе.' }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!messages.length) {
    return Response.json({ error: 'Пустая история сообщений.' }, { status: 400 });
  }

  const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: AI_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!anthropicResponse.ok) {
    const errorBody = await anthropicResponse.text().catch(() => '');
    return Response.json(
      { error: errorBody || `Claude API error: ${anthropicResponse.status}` },
      { status: anthropicResponse.status },
    );
  }

  const data = await anthropicResponse.json();
  const text = data.content?.find((block: { type?: string }) => block.type === 'text')?.text?.trim();

  if (!text) {
    return Response.json({ error: 'Пустой ответ от Claude API.' }, { status: 500 });
  }

  return Response.json({ text });
}
