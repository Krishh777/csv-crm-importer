import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const getClaudeClient = () => client;

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

export const TOKEN_PRICING = {
  input: 0.003 / 1000,
  output: 0.015 / 1000,
};

export const calculateTokenCost = (inputTokens: number, outputTokens: number): number => {
  return (inputTokens * TOKEN_PRICING.input) + (outputTokens * TOKEN_PRICING.output);
};
