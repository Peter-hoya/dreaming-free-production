# claude-seo v2.4.2 기준 SEO 점검 기록 (2026-10-17)

기준: [`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) v2.4.2. 스킬 파일은 `.agents/skills/seo*`에 설치했다(Python 런타임·외부 API 확장은 설치하지 않음). 실측 도구(PSI, Lighthouse, 크롤러)는 사용하지 않았고 소스 코드와 기존 검증 스크립트 기준으로 점검했다.

## 점검 결과 요약

| 영역 | 상태 | 근거 |
| --- | --- | --- |
| Crawlability | 통과 | robots.txt, sitemap.xml(lastmod, hreflang, 이미지), 308/410 처리 |
| Indexability | 통과 | self-canonical, ko/en hreflang + x-default, 출시 전 noindex 안전장치 |
| Security | 개선 | HSTS 누락 → 추가. CSP는 AdSense/GA/CMP 출처 확정 전까지 보류 |
| Structured Data | 개선 | 도구 페이지 FAQPage 재유입 → 제거. WebSite/Organization/WebPage/WebApplication/Breadcrumb/BlogPosting 유지 |
| JS Rendering | 통과 | Next.js SSR/SSG, 핵심 메타·JSON-LD는 초기 HTML에 포함 |
| IndexNow | 통과 | `/indexnow-key.txt`, `submit:indexnow` |
| AI 크롤러 정책 | 개선 | 목적별 그룹(검색 허용 / 학습 차단) + Content-Signal |
| llms.txt | 추가 | Lighthouse `llms-txt` 규칙(H1, 링크, 50자+) 충족 |

## 반영 항목

1. `src/app/(localized)/[locale]/tools/[slug]/page.tsx`: FAQPage JSON-LD 제거. FAQ 리치 결과는 2026-05-07부로 모든 사이트에서 종료됐고, `verify:seo-framework`가 부재를 검사한다.
2. `next.config.ts`: `Strict-Transport-Security: max-age=31536000`.
3. `src/app/robots.txt/route.ts`(기존 `robots.ts` 대체): RFC 9309상 이름이 지정된 그룹은 `*` 그룹을 무시하므로 `Allow`/`Disallow`/`Content-Signal`을 그룹마다 반복했다.
4. `src/app/llms.txt/route.ts`: 사이트 데이터로 자동 생성.
5. `scripts/verify_seo_framework.mjs`, `scripts/verify_launch_readiness.mjs`: robots 검사를 `User-agent: *` 그룹으로 한정하고 llms.txt 검사를 추가했다.

## 반영하지 않은 항목

- **CSP**: 광고·분석·동의 관리 스크립트 출처를 검증하지 않고 넣으면 서비스가 깨질 수 있다.
- **Markdown 전송(`.md`, `Accept: text/markdown`)과 WebMCP**: 우선순위가 낮고(P1~P3) 이 사이트에는 거래성 폼이 없다.
- **Organization `sameAs`**: 실제 공식 소셜 계정 정보가 없어 임의로 넣지 않았다.
- **`/` 리다이렉트**: `next.config.ts`의 `/ → /ko` 영구 리다이렉트 때문에 README에 적힌 국가별 `/en` 분기가 실행되지 않는다. SEO 문제는 아니지만 의도한 동작인지 확인이 필요하다.

## 정직한 보고 원칙

robots, Content-Signal, llms.txt 변경은 검색 순위, AI 인용, 트래픽 증가를 보장하지 않는다. Google-Extended, Content-Signal, llms.txt는 Google 검색에 영향을 주지 않는다.
