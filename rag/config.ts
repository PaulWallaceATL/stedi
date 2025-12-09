// Configuration for RAG model and API key.
// Set these via env vars; do not hardcode secrets.
export const RAG_PROVIDER = process.env.RAG_PROVIDER || "openai"; // openai | anthropic | custom
export const RAG_MODEL = process.env.RAG_MODEL || "gpt-5.1"; // e.g., gpt-4.1 or claude-3-opus
export const RAG_API_KEY =
  process.env.RAG_API_KEY || process.env.OPENAI_API_KEY || ""; // set in environment




