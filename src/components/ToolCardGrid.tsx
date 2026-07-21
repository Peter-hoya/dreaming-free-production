import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ToolIcon } from "@/components/ToolIcon";
import { categoryLabels, siteCopy, type Locale, type ToolDefinition } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";

export function ToolCardGrid({ items, locale }: { items: ToolDefinition[]; locale: Locale }) {
  const copy = siteCopy[locale];
  return (
    <div className="tool-grid">
      {items.map((tool) => (
        <Link href={`/${locale}/tools/${tool.slug}`} className="tool-card" key={tool.slug}>
          <div className="tool-card-top">
            <ToolIcon name={tool.icon} />
            <ArrowUpRight size={20} weight="bold" aria-hidden="true" />
          </div>
          <div className="tool-card-copy">
            <h3>{getToolSearchMetadata(tool.slug, locale).heading}</h3>
            <p>{tool.short[locale]}</p>
          </div>
          <div className="tool-card-meta">
            <span>{categoryLabels[tool.category][locale]}</span>
            <span>{copy.openTool}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
