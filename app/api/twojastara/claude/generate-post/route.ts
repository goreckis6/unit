import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-6';
const MAX_TOKENS = 4096;
const ANTHROPIC_TIMEOUT_MS = 120_000; // 2 min (Claude is typically faster than Ollama)

async function claudeChat(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude returned no text content');
    }
    return textBlock.text;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Claude API timeout (${ANTHROPIC_TIMEOUT_MS / 1000}s) — spróbuj ponownie`);
    }
    throw e;
  }
}

/** POST /api/twojastara/claude/generate-post — generate blog content via Claude API (same contract as Ollama) */
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

    const prompt = `You are an expert SEO content writer. Your task is to create a comprehensive, high-quality article that outranks the competition. Provide more in-depth information, using a more logical and user-friendly structure.

Act as a Senior UX Copywriter and SEO Specialist. Create a comprehensive landing page description for an online tool on Calculinohub called: **${topic}**.

Infer the **Tool Core Function** (what it does in one sentence) and **Target Audience** (who benefits) from the calculator name.

STRUCTURE OF THE RESPONSE (follow exactly):

1. **Catchy H1 Header**: Focus on the primary benefit (speed, accuracy, or ease of use). Example: "[Topic] – [Benefit] Instantly"

2. **Intro (The "Hook")**: 2–3 engaging sentences explaining the problem it solves. E.g. "Are you struggling with [X]? The Calculinohub [topic] is designed to take the guesswork out of [Y]. Whether you are dealing with [scenarios], our tool [core value] in milliseconds."

3. **"How to Use the Calculator"** (H2): A simple, numbered list of steps. Describe inputs, separator/format options, and the main action (e.g. "Click Generate"). Be concrete.

4. **"Why Use This Tool?"** (H2): Bullet points highlighting why Calculinohub's calculator is better than doing it manually. Include: Error Prevention, Speed/Instant results, Study Aid or practical use case.

5. **Technical/Educational Context** (H2): Brief section explaining the math or logic behind the tool. Include formulas if applicable. Use **bold** for key terms.

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

Example: {"content":"# H1 Title\\n\\nIntro paragraph...\\n\\n## How to Use the Calculator\\n\\n1. Step one...","faqItems":[{"question":"What is X?","answer":"X is..."}]}`;

    const raw = await claudeChat(prompt);
    if (!raw) {
      throw new Error('Empty response from Claude');
    }

    // Parse JSON - handle potential markdown code block wrapper
    let parsed: { content?: string; faqItems?: { question: string; answer: string }[] };
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    try {
      parsed = JSON.parse(jsonStr) as { content?: string; faqItems?: { question: string; answer: string }[] };
    } catch {
      throw new Error('Claude did not return valid JSON. Try again.');
    }

    const content = (parsed.content ?? '').trim();
    const faqItems = Array.isArray(parsed.faqItems)
      ? parsed.faqItems
          .filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string')
          .map((f) => ({ question: String(f.question).trim(), answer: String(f.answer).trim() }))
          .filter((f) => f.question && f.answer)
      : [];

    if (!content) {
      throw new Error('Claude did not return content');
    }

    return NextResponse.json({ content, faqItems });
  } catch (error) {
    console.error('Claude generate-post error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate content';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
