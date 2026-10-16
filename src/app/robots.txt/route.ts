import { absoluteUrl, isSiteReadyForIndexing } from "@/lib/seo";

export const dynamic = "force-static";

// Operator policy (2026-10): allow search engines and AI search/answer crawlers,
// opt out of AI model training. RFC 9309: a crawler obeys only the most specific
// group naming it, so shared directives are repeated inside every named group.
// Content-Signal is a stated preference (Cloudflare policy / expired IETF draft);
// it has no confirmed effect on Google Search.
const contentSignal = "Content-Signal: search=yes, ai-input=yes, ai-train=no";

const aiSearchAgents = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const aiTrainingAgents = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
];

function group(agents: string[], rules: string[]) {
  return [...agents.map((agent) => `User-agent: ${agent}`), ...rules].join("\n");
}

function buildRobots() {
  if (!isSiteReadyForIndexing) {
    return `${group(["*"], ["Disallow: /"])}\n`;
  }

  const sections = [
    group(["*"], [contentSignal, "Allow: /", "Disallow: /api/"]),
    group(aiSearchAgents, [contentSignal, "Allow: /", "Disallow: /api/"]),
    group(aiTrainingAgents, [contentSignal, "Disallow: /"]),
    `Host: ${absoluteUrl()}`,
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
  ];
  return `${sections.join("\n\n")}\n`;
}

export function GET() {
  return new Response(buildRobots(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
