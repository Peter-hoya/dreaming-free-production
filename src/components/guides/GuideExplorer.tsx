"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatGuideDate,
  guidePath,
  type GuideIndexItem,
} from "@/lib/guideShared";

const ALL_CATEGORIES = "전체";

const explorerCopy = {
  ko: {
    title: "생활 가이드 전체 보기",
    body: "제목과 내용으로 검색하거나 관심 있는 분야만 골라보세요.",
    searchLabel: "가이드 검색",
    searchAria: "생활 가이드 검색",
    placeholder: "예: 갤럭시 수리, 난방비, 교통안전교육",
    clear: "검색어 지우기",
    categories: "카테고리",
    result: (count: number) => `총 ${count.toLocaleString("ko-KR")}개의 글`,
    action: "내용 보기",
    emptyTitle: "검색 결과가 없습니다.",
    emptyBody: "검색어를 줄이거나 다른 카테고리를 선택해보세요.",
    reset: "전체 글 다시 보기",
  },
  en: {
    title: "Browse all Korean guides",
    body: "Search the Korean article titles and summaries, or narrow the archive by category.",
    searchLabel: "Search Korean guides",
    searchAria: "Search Korean guides",
    placeholder: "Try a Korean topic or title",
    clear: "Clear search",
    categories: "Categories",
    result: (count: number) => `${count.toLocaleString("en-US")} Korean articles`,
    action: "Read in Korean",
    emptyTitle: "No guides matched your search.",
    emptyBody: "Try a shorter search or choose another category.",
    reset: "Show every guide",
  },
} as const;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/\s+/g, " ")
    .trim();
}

export function GuideExplorer({ articles, locale = "ko" }: { articles: readonly GuideIndexItem[]; locale?: "ko" | "en" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const copy = explorerCopy[locale];
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(articles.map((article) => article.category)))],
    [articles],
  );
  const normalizedQuery = normalizeSearchText(query);
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const categoryMatches = category === ALL_CATEGORIES || article.category === category;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;

      const searchable = normalizeSearchText(
        `${article.title} ${article.description} ${article.category}`,
      );
      return normalizedQuery.split(" ").every((term) => searchable.includes(term));
    });
  }, [articles, category, normalizedQuery]);

  const resetFilters = () => {
    setQuery("");
    setCategory(ALL_CATEGORIES);
  };

  return (
    <section className="guide-library" id="guide-library" aria-labelledby="guide-library-title">
      <div className="guide-library__heading">
        <h2 id="guide-library-title">{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      <div className="guide-search-panel" role="search" aria-label={copy.searchAria}>
        <label className="guide-search-label" htmlFor="guide-search-input">
          {copy.searchLabel}
        </label>
        <div className="guide-search-control">
          <MagnifyingGlass size={21} weight="bold" aria-hidden="true" />
          <input
            id="guide-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            autoComplete="off"
          />
          {query ? (
            <button type="button" className="guide-search-clear" onClick={() => setQuery("")}>
              <X size={18} weight="bold" aria-hidden="true" />
              <span className="sr-only">{copy.clear}</span>
            </button>
          ) : null}
        </div>

        <fieldset className="guide-category-filter">
          <legend>{copy.categories}</legend>
          <div className="guide-category-filter__controls">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="guide-result-count" aria-live="polite">
        {copy.result(filteredArticles.length)}
      </p>

      {filteredArticles.length > 0 ? (
        <div className="guide-card-grid">
          {filteredArticles.map((article, index) => (
            <article className="guide-card" key={article.slug}>
              <Link href={guidePath(article.slug)} className="guide-card__link">
                <div className="guide-card__media">
                  {article.heroImage ? (
                    <Image
                      src={article.heroImage.src}
                      alt={article.heroImage.alt}
                      fill
                      sizes={index === 0 ? "(max-width: 760px) 100vw, 62vw" : "(max-width: 760px) 100vw, 36vw"}
                      priority={index === 0}
                    />
                  ) : (
                    <span className="guide-card__media-fallback" aria-hidden="true">MoaTools</span>
                  )}
                </div>
                <div className="guide-card__copy">
                  <div className="guide-card__meta">
                    <span lang="ko">{article.category}</span>
                    <time dateTime={article.modifiedAt}>{formatGuideDate(article.modifiedAt)}</time>
                  </div>
                  <h3 lang="ko">{article.title}</h3>
                  <p lang="ko">{article.description}</p>
                  <span className="guide-card__action" aria-hidden="true">{copy.action}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="guide-empty-state" role="status">
          <strong>{copy.emptyTitle}</strong>
          <p>{copy.emptyBody}</p>
          <button type="button" onClick={resetFilters}>{copy.reset}</button>
        </div>
      )}
    </section>
  );
}
