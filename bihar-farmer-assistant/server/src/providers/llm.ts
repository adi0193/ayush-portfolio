/**
 * Provider-independent LLM interface.
 *
 * The LLM is used ONLY to phrase an answer from facts we already retrieved (knowledge
 * base entries). Prices, weather numbers and scheme amounts are never routed through it.
 * If no provider is configured, or it fails/refuses, the template engine answers instead.
 */
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../lib/config.js';
import type { Lang } from '../lib/types.js';

export interface GroundedPrompt {
  lang: Lang;
  question: string;
  facts: Array<{ id: string; title: string; text: string; source: string }>;
  context: string; // district, crop, stage, season, answers to follow-up questions
}

export interface LlmProvider {
  readonly name: string;
  answer(p: GroundedPrompt): Promise<string | null>;
}

export const SYSTEM_PROMPT = `You are "बिहार किसान सहायक", a voice assistant for small and marginal farmers in Bihar, India.

Hard rules:
- Answer ONLY from the FACTS provided. If the facts do not cover the question, say you are not sure and suggest the nearest Krishi Vigyan Kendra (KVK), the block agriculture coordinator, or Kisan Call Centre 1800-180-1551.
- Never state a pesticide, fungicide, herbicide or fertiliser dose or quantity. Say the dose must come from the product label, the soil-test report and the KVK.
- Never claim a diagnosis is certain. Use words like "हो सकता है / हो सकेला". Recommend an expert for serious crop problems.
- Never promise yields, profits, prices or government benefits.
- Never ask for Aadhaar numbers, OTP, PIN, passwords or bank details.
- Reply in the requested language: "bho" = simple spoken Bhojpuri (Devanagari), "hi" = simple spoken Hindi. Short sentences a farmer can follow when read aloud. At most 90 words. No markdown, no bullet symbols, no English unless it is a common word (KVK, DBT).`;

export class ClaudeProvider implements LlmProvider {
  readonly name = 'anthropic';
  private client: Anthropic;
  constructor(apiKey: string, private model: string) {
    this.client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 1 });
  }

  async answer(p: GroundedPrompt): Promise<string | null> {
    const facts = p.facts.map((f, i) => `[${i + 1}] ${f.title} (स्रोत: ${f.source})\n${f.text}`).join('\n\n');
    const user = `LANGUAGE: ${p.lang}\nCONTEXT: ${p.context || 'unknown'}\n\nFACTS:\n${facts || '(none)'}\n\nFARMER SAID: ${p.question}`;
    try {
      const res = await this.client.beta.messages.create({
        model: this.model,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [{ role: 'user', content: user }],
      } as Anthropic.Beta.MessageCreateParamsNonStreaming);
      if (res.stop_reason === 'refusal') return null;
      const text = res.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return text || null;
    } catch (err) {
      if (err instanceof Anthropic.APIError) console.warn(`[llm] API error ${err.status}: ${err.message}`);
      else console.warn('[llm] request failed', err);
      return null;
    }
  }
}

export function createLlmProvider(): LlmProvider | null {
  if (!config.anthropicKey) return null;
  return new ClaudeProvider(config.anthropicKey, config.llmModel);
}
