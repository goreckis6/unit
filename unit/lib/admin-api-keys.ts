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

/**
 * DeepL API key: DB override if set, else env DEEPL_API_KEY.
 * Free-plan keys end with ":fx" and use api-free.deepl.com.
 */
export async function getDeeplApiKey(): Promise<string | null> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { deeplApiKey: true },
    });
    const fromDb = row?.deeplApiKey?.trim();
    if (fromDb) return fromDb;
  } catch {
    /* table missing during migrate, etc. */
  }
  return process.env.DEEPL_API_KEY?.trim() || null;
}

/** Returns the correct DeepL base URL based on whether the key is a free-plan key (:fx suffix). */
export function deeplBaseUrl(apiKey: string): string {
  return apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
}

/**
 * ModernMT API key: DB override if set, else env MODERNMT_API_KEY.
 */
export async function getModernMtApiKey(): Promise<string | null> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { modernmtApiKey: true },
    });
    const fromDb = row?.modernmtApiKey?.trim();
    if (fromDb) return fromDb;
  } catch {
    /* table missing during migrate, etc. */
  }
  return process.env.MODERNMT_API_KEY?.trim() || null;
}
