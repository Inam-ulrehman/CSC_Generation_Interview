// Checks the interview API key, then starts Claude Code with it.
// Key source: ANTHROPIC_API_KEY in .env, otherwise you're asked to paste it.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import Anthropic from "@anthropic-ai/sdk";

const TEST_MODEL = "claude-opus-5-5";

if (existsSync(".env")) process.loadEnvFile(".env");

// Strip whitespace, line breaks and quotes picked up while copying.
const cleanKey = (raw: string) => raw.trim().replace(/^["']+|["']+$/g, "").replace(/\s+/g, "");
const maskKey = (key: string) => (key.length > 16 ? `${key.slice(0, 12)}...${key.slice(-4)}` : "****");

function explain(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError)
    return "Invalid API key (401): wrong, expired, revoked or deleted. Copy it again or ask for a new one.";
  if (error instanceof Anthropic.PermissionDeniedError)
    return "Key not allowed (403): the workspace or organization may be disabled or restricted.";
  if (error instanceof Anthropic.NotFoundError)
    return `Model not available (404): this key's account cannot use ${TEST_MODEL}.`;
  if (error instanceof Anthropic.RateLimitError)
    return "Rate limited (429): the key works but has hit its limit. Wait a minute and retry.";
  if (error instanceof Anthropic.BadRequestError)
    return "Account problem (400): usually the credit balance is too low or used up.";
  if (error instanceof Anthropic.InternalServerError)
    return "Anthropic service problem (5xx): not your key. Try again shortly.";
  if (error instanceof Anthropic.APIConnectionError)
    return "Could not reach the API: check internet, VPN, proxy or ANTHROPIC_BASE_URL.";
  if (error instanceof Anthropic.APIError && error.status === 402)
    return "Billing problem (402): the account has a payment issue.";
  if (error instanceof Anthropic.APIError) return `Unexpected API error (${error.status}).`;
  return `Unexpected error: ${String(error)}`;
}

async function checkKey(apiKey: string): Promise<boolean> {
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: 20_000 });
  try {
    await client.models.list({ limit: 1 }); // free: is the key accepted?
    await client.messages.create({
      // tiny request: does the account have credit?
      model: TEST_MODEL,
      max_tokens: 16,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: "Reply with OK." }],
    });
    console.log("[OK] Key is valid and the account is working.");
    return true;
  } catch (error) {
    console.log(`[X] ${explain(error)}`);
    if (error instanceof Anthropic.APIError) {
      const body = error.error as { error?: { message?: string } } | undefined;
      console.log(`    Server said: ${body?.error?.message ?? error.message}`);
      if (error.requestID) console.log(`    Request ID: ${error.requestID}`);
    }
    return false;
  }
}

interface ClaudeConfig {
  hasCompletedOnboarding?: boolean;
  customApiKeyResponses?: { approved?: string[]; rejected?: string[] };
  [other: string]: unknown;
}

// FIX (2026-11-25): Pre-approve the key in Claude Code's global config
// Problem: interactive `claude` showed "Select login method" even with a valid ANTHROPIC_API_KEY
// Why: first-run onboarding ignores the env key, and afterwards Claude Code only uses an
// env key the user approved (stored as its last 20 chars in customApiKeyResponses.approved)
// Now: we mark onboarding done and approve the key, so Claude Code starts with it directly
function approveKeyForClaudeCode(key: string) {
  const file = join(process.env.CLAUDE_CONFIG_DIR ?? homedir(), ".claude.json");
  let config: ClaudeConfig = {};
  if (existsSync(file)) {
    try {
      config = JSON.parse(readFileSync(file, "utf8")) as ClaudeConfig;
    } catch {
      console.log(`[!] Could not parse ${file}; Claude Code may ask you to approve the key.`);
      return;
    }
  }
  const keyId = key.slice(-20);
  const responses = config.customApiKeyResponses ?? {};
  config.customApiKeyResponses = {
    approved: [...new Set([...(responses.approved ?? []), keyId])],
    rejected: (responses.rejected ?? []).filter((id) => id !== keyId),
  };
  config.hasCompletedOnboarding = true;
  writeFileSync(file, JSON.stringify(config, null, 2));
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let key = cleanKey(process.env.ANTHROPIC_API_KEY ?? "");
  if (key) console.log("Using key from .env / environment.");

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (!key) key = cleanKey(await rl.question("Paste interview API key: "));
    if (key) {
      console.log(`Checking ${maskKey(key)}...`);
      if (await checkKey(key)) break;
    }
    key = "";
  }
  rl.close();

  if (!key) {
    console.log("No working key. Exiting.");
    process.exitCode = 1;
    return;
  }

  approveKeyForClaudeCode(key);
  console.log("Starting Claude Code...\n");
  spawn("claude", [], {
    stdio: "inherit",
    env: { ...process.env, ANTHROPIC_API_KEY: key },
    shell: process.platform === "win32",
  }).on("error", (error) => {
    console.log(`[X] Could not start Claude Code: ${error.message}`);
    console.log("    Install it: npm install -g @anthropic-ai/claude-code");
  });
}

main().catch((error) => {
  if (error?.code !== "ERR_USE_AFTER_CLOSE") console.error(error);
  process.exitCode = 1;
});
