import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ollamaFetch } from '@/lib/ollama-fetch';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';

async function ollamaChat(messages: { role: string; content: string }[]) {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    throw new Error('OLLAMA_API_KEY environment variable is not set');
  }
  try {
    const res = await ollamaFetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: MODEL, messages, stream: false }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Ollama API error: ${res.status}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data?.message?.content ?? '';
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Ollama API timeout (limit ~90 min) — spróbuj ponownie`);
    }
    throw e;
  }
}

/** POST /api/twojastara/ollama/generate-post — generate blog content (no FAQ) + faqItems separately */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic } = body;
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic/title is required (e.g. display title of the calculator page)' },
        { status: 400 }
      );
    }

    const prompt = `Act as a Senior UX Copywriter and SEO Specialist. Create a comprehensive landing page description for an online tool on Calculinohub called: **${topic}**.

Infer the **Tool Core Function** (what it does in one sentence) and **Target Audience** (who benefits) from the calculator name.

STRUCTURE OF THE RESPONSE (follow exactly):

1. **H1 Header** (MANDATORY – first line, nothing before it): Must be exactly "How to convert [X]?" (question mark at the end) where X describes the conversion/method from the topic. Examples: "How to convert kg to lbs?", "How to convert meters to feet?". Nothing else at the beginning.

2. **Intro (The "Hook")**: 2–3 engaging sentences explaining the problem it solves. E.g. "Are you struggling with [X]? The Calculinohub [topic] is designed to take the guesswork out of [Y]. Whether you are dealing with [scenarios], our tool [core value] in milliseconds."

3. **"How to Use the Calculator"** (H2): A simple, numbered list of steps. Describe inputs, separator/format options, and the main action (e.g. "Click Generate"). Be concrete.

4. **Technical/Educational Context** (H2): Brief section explaining the math or logic behind the tool. Include formulas if applicable. Use **bold** for key terms.

**Math formulas – use one of these formats (preferred order):**
- Unicode symbols: 2ⁿ, ∅, ⊆, ×, ÷, ∑, √, π (subscript: ₙ, superscript: ⁿ)
- Plain text with ^ for power: 2^n, n!
- Code block for multi-line: \`\`\` ... \`\`\`
- LaTeX inline \`$...$\` or block \`$$...$$\` if needed

End after the Technical/Educational Context. Do NOT add a Call to Action or closing CTA sentence.

STYLE GUIDELINES:
- Helpful, authoritative, yet accessible tone
- Use **bold** for key terms
- Optimize for SEO: naturally include "Calculinohub", "online tool", "free", and "formula" where fitting
- Make the page scannable: use bolding and bullet points so users in a hurry can skim
- Refer to the tool as "Calculinohub's [topic] calculator" or "the Calculinohub calculator"
- Do NOT include any FAQ section in the content (FAQ is generated separately)
- Text length: 800–1200 words
- Do NOT use markdown tables

OUTPUT FORMAT - Respond with a valid JSON object only, no other text. Two keys:
- "content": the full markdown article (no FAQ)
- "faqItems": array of 5–7 {"question":"...","answer":"..."} objects about the topic

Example: {"content":"# How to convert [X]?\\n\\nIntro paragraph...\\n\\n## How to Use the Calculator\\n\\n1. Step one...","faqItems":[{"question":"What is X?","answer":"X is..."}]}`;

    const raw = await ollamaChat([{ role: 'user', content: prompt }]);
    if (!raw) {
      throw new Error('Empty response from Ollama Cloud');
    }

    // Parse JSON - handle potential markdown code block wrapper
    let parsed: { content?: string; faqItems?: { question: string; answer: string }[] };
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    try {
      parsed = JSON.parse(jsonStr) as { content?: string; faqItems?: { question: string; answer: string }[] };
    } catch {
      throw new Error('Model did not return valid JSON. Try again.');
    }

    const content = (parsed.content ?? '').trim();
    const faqItems = Array.isArray(parsed.faqItems)
      ? parsed.faqItems
          .filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string')
          .map((f) => ({ question: String(f.question).trim(), answer: String(f.answer).trim() }))
          .filter((f) => f.question && f.answer)
      : [];

    if (!content) {
      throw new Error('Model did not return content');
    }

    return NextResponse.json({ content, faqItems });
  } catch (error) {
    console.error('Ollama generate-post error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate content';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
