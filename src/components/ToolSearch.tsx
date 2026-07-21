"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { ToolIcon } from "@/components/ToolIcon";
import { siteCopy, tools, type Locale } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function ToolSearch({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const copy = siteCopy[locale];
  const results = useMemo(() => {
    const needle = normalize(deferredQuery);
    if (!needle) return tools.slice(0, 5);
    return tools
      .filter((tool) => {
        const searchMetadata = getToolSearchMetadata(tool.slug, locale);
        return normalize([
          searchMetadata.heading,
          searchMetadata.title,
          ...searchMetadata.queries,
          tool.title[locale],
          tool.short[locale],
          ...tool.keywords[locale],
        ].join(" ")).includes(needle);
      })
      .slice(0, 6);
  }, [deferredQuery, locale]);

  return (
    <div className="tool-search" role="search">
      <label className="search-input-wrap">
        <MagnifyingGlass size={21} weight="bold" aria-hidden="true" />
        <span className="sr-only">{copy.searchPlaceholder}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
          autoComplete="off"
        />
      </label>
      <div className="search-results" aria-live="polite">
        {results.length ? results.map((tool) => (
          <Link key={tool.slug} href={`/${locale}/tools/${tool.slug}`} className="search-result">
            <ToolIcon name={tool.icon} />
            <span>
              <strong>{getToolSearchMetadata(tool.slug, locale).heading}</strong>
              <small>{tool.short[locale]}</small>
            </span>
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        )) : <p className="result-detail">{copy.noResults}</p>}
      </div>
    </div>
  );
}
