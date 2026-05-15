import { Decimal } from 'decimal.js';

export interface LlmCompletionResult {
  body: string;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  cachedTokens: number;
  costUsd: Decimal;
}

export interface LlmCompletionRequest {
  systemPrompt: string;
  userMessage: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  /** If true, mark the system prompt as cacheable (ephemeral, 5min TTL). */
  cacheSystemPrompt?: boolean;
}

/**
 * Domain-side abstraction for the LLM provider. Implemented in `data/` by
 * `AnthropicLlmClient` — keeps `@anthropic-ai/sdk` out of the domain.
 */
export abstract class LlmClient {
  abstract complete(req: LlmCompletionRequest): Promise<LlmCompletionResult>;
}
