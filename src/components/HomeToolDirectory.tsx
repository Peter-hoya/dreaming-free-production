"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useDeferredValue, useMemo, useState } from "react";
import { ToolCardGrid } from "@/components/ToolCardGrid";
import { categoryLabels, type Locale, type ToolDefinition } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";

type CategoryFilter = "all" | ToolDefinition["category"];

const categoryOrder: ToolDefinition["category"][] = ["daily", "finance", "digital", "writing", "health"];

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function HomeToolDirectory({ items, locale }: { items: ToolDefinition[]; locale: Locale }) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const needle = normalize(deferredQuery);
  const filteredItems = useMemo(() => items.filter((tool) => {
    if (category !== "all" && tool.category !== category) return false;
    if (!needle) return true;
    const searchMetadata = getToolSearchMetadata(tool.slug, locale);
    const haystack = normalize([
      searchMetadata.heading,
      searchMetadata.title,
      searchMetadata.description,
      ...searchMetadata.queries,
      tool.short[locale],
      ...tool.keywords[locale],
    ].join(" "));
    return needle.split(" ").every((term) => haystack.includes(term));
  }), [category, items, locale, needle]);
  const allLabel = locale === "ko" ? "전체" : "All";

  const reset = () => {
    setCategory("all");
    setQuery("");
  };

  return (
    <div className="home-tool-directory">
      <div className="tool-directory-controls">
        <label className="tool-directory-search">
          <span className="sr-only">{locale === "ko" ? "전체 도구 검색" : "Search all tools"}</span>
          <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "ko" ? "도구 이름이나 할 일을 검색하세요" : "Search by tool name or task"}
            autoComplete="off"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label={locale === "ko" ? "검색어 지우기" : "Clear search"}>
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <fieldset className="tool-category-filter">
          <legend>{locale === "ko" ? "도구 분야" : "Tool category"}</legend>
          <div>
            <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>{allLabel}</button>
            {categoryOrder.map((item) => (
              <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                {categoryLabels[item][locale]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="tool-directory-count" aria-live="polite">
        {locale === "ko" ? `${filteredItems.length}개 도구` : `${filteredItems.length} tools`}
      </p>

      {filteredItems.length ? (
        <ToolCardGrid items={filteredItems} locale={locale} />
      ) : (
        <div className="tool-directory-empty" role="status">
          <strong>{locale === "ko" ? "일치하는 도구가 없습니다." : "No tools matched your search."}</strong>
          <p>{locale === "ko" ? "검색어를 줄이거나 다른 분야를 선택해보세요." : "Try a shorter search or choose another category."}</p>
          <button type="button" onClick={reset}>{locale === "ko" ? "전체 도구 다시 보기" : "Show all tools"}</button>
        </div>
      )}
    </div>
  );
}
