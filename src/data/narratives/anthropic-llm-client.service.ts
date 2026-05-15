import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { Decimal } from 'decimal.js';
import {
  LlmClient,
  LlmCompletionRequest,
  LlmCompletionResult,
} from '../../domain/narratives/llm-client';

/** USD per 1M tokens. Keep in sync with Anthropic's pricing page. */
const PRICING: Record<
  string,
  { input: number; output: number; cacheWrite: number; cacheRead: number }
> = {
  'claude-sonnet-4-6': { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-haiku-4-5-20251001': { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  'claude-opus-4-7': { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
};

@Injectable()
export class AnthropicLlmClient extends LlmClient {
  private readonly logger = new Logger(AnthropicLlmClient.name);
  private readonly client: Anthropic;

  constructor() {
    super();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not set — LLM calls will fail. Narratives feature disabled.',
      );
    }
    this.client = new Anthropic({ apiKey: apiKey ?? 'missing' });
  }

  async complete(req: LlmCompletionRequest): Promise<LlmCompletionResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ServiceUnavailableException('ANTHROPIC_API_KEY not configured');
    }

    const system = req.cacheSystemPrompt
      ? [
          {
            type: 'text' as const,
            text: req.systemPrompt,
            cache_control: { type: 'ephemeral' as const },
          },
        ]
      : req.systemPrompt;

    const response = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.3,
      system,
      messages: [{ role: 'user', content: req.userMessage }],
    });

    const body = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    const usage = response.usage;
    const tokensIn = usage.input_tokens ?? 0;
    const tokensOut = usage.output_tokens ?? 0;
    const cacheCreation = usage.cache_creation_input_tokens ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? 0;

    const costUsd = this.computeCost(req.model, {
      tokensIn,
      tokensOut,
      cacheCreation,
      cacheRead,
    });

    return {
      body,
      modelUsed: response.model,
      tokensIn,
      tokensOut,
      cachedTokens: cacheRead,
      costUsd,
    };
  }

  private computeCost(
    model: string,
    tokens: {
      tokensIn: number;
      tokensOut: number;
      cacheCreation: number;
      cacheRead: number;
    },
  ): Decimal {
    const pricing = PRICING[model];
    if (!pricing) {
      this.logger.warn(`No pricing entry for model ${model} — cost reported as 0`);
      return new Decimal(0);
    }
    // Anthropic's tokensIn excludes both cache_creation and cache_read.
    const inputCost = (tokens.tokensIn * pricing.input) / 1_000_000;
    const cacheWriteCost = (tokens.cacheCreation * pricing.cacheWrite) / 1_000_000;
    const cacheReadCost = (tokens.cacheRead * pricing.cacheRead) / 1_000_000;
    const outputCost = (tokens.tokensOut * pricing.output) / 1_000_000;
    return new Decimal(inputCost + cacheWriteCost + cacheReadCost + outputCost);
  }
}
