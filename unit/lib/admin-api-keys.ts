import { prisma } from '@/lib/prisma';

const SETTINGS_ID = 'default';

/**
 * Ollama Cloud API key: DB override if set, else env OLLAMA_API_KEY.
 */
export async function getOllamaApiKey(): Promise<string | null> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { ollamaApiKey: true },
    });
    const fromDb = row?.ollamaApiKey?.trim();
    if (fromDb) return fromDb;
  } catch {
    /* table missing during migrate, etc. */
  }
  return process.env.OLLAMA_API_KEY?.trim() || null;
}

/**
 * Anthropic API key: DB override if set, else env ANTHROPIC_API_KEY.
 */
export async function getAnthropicApiKey(): Promise<string | null> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { anthropicApiKey: true },
    });
    const fromDb = row?.anthropicApiKey?.trim();
    if (fromDb) return fromDb;
  } catch {
    /* table missing during migrate, etc. */
  }
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}
