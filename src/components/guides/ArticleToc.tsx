import type { GuideHeading } from "@/lib/guideShared";

export function ArticleToc({ headings }: { headings: readonly GuideHeading[] }) {
  return (
    <nav className="guide-toc" aria-label="이 글의 목차">
      <strong>이 글의 목차</strong>
      <ol>
        <li>
          <a href="#article-title">글 처음으로</a>
        </li>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a href={`#${heading.id}`}>{heading.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
