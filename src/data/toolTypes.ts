export type ToolLocale = "ko" | "en";

export type LocalizedText = Record<ToolLocale, string>;
export type LocalizedList = Record<ToolLocale, string[]>;

export interface ToolDefinition {
  slug: string;
  icon: string;
  category: "daily" | "finance" | "health" | "writing" | "digital";
  title: LocalizedText;
  short: LocalizedText;
  description: LocalizedText;
  guide: LocalizedList;
  useCases: LocalizedList;
  keywords: Record<ToolLocale, string[]>;
  faqs: Record<ToolLocale, Array<{ question: string; answer: string }>>;
  sources?: Record<ToolLocale, Array<{ label: string; url: string }>>;
}
