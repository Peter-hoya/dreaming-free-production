# 레거시 URL 감사 기록

점검일: 2026-08-19
대상: `https://dreaming-free.com` / Next.js 16 App Router / Netlify

## 수정 전 확인 결과

- 정상 주요 라우트: `/`은 `/ko`로 영구 이동하고, `/ko`, `/en`, 언어별 도구 60개, 언어별 게임, `/entry`, 가이드 45개, `/rss`, `/sitemap.xml`, `/robots.txt`, `/ads.txt`가 제공되고 있었다.
- 레거시 글: `src/data/guideArticles.json`과 `src/data/guideIndex.json`이 45개 글을 모두 `200` 콘텐츠로 제공했다. 종료된 경기·공모·행사 13개도 이 상태에 포함되어 있었다.
- `/m`: `src/proxy.ts`, `src/data/siteRedirects.json`, `src/data/guideRedirects.json`, `public/_redirects`가 `/m`, `/m/entry/*`를 `301` 처리했다. 별도 모바일 HTML은 없었다.
- `/comments`: 본문과 모바일 댓글 변형을 본문 canonical로 `301` 처리했다.
- redirect/rewrite 위치: 애플리케이션 계층은 `src/proxy.ts`, Netlify 정적 규칙은 `scripts/generate_netlify_redirects.mjs`가 만든 `public/_redirects`였다. rewrite나 클라이언트 JavaScript 이동은 없었다.
- sitemap: `src/app/sitemap.ts`가 `guideIndex.json`의 모든 글과 도구·게임·정책 페이지를 합쳤다. 모바일·댓글·별칭은 제외했다.
- canonical/hreflang: 가이드는 `src/app/(guides)/entry/[...slug]/page.tsx`에서 self-canonical을 생성한다. 언어 페이지의 canonical/hreflang은 기존 App Router metadata 구조가 담당한다.
- AdSense: 사이트 검증 메타와 스크립트는 루트 레이아웃/공용 설정, 수동 슬롯은 `AdSlot`과 각 정상 레이아웃에 있었다. 가이드 광고는 `NEXT_PUBLIC_GUIDE_ADS_ENABLED`로 제어되었다.
- `ads.txt`: 루트 `/ads.txt` route가 기존 게시자 `ca-pub-2981823212977040`에 대응하는 레코드를 반환했다.
- 구 서브도메인: 저장소 배포 설정에는 `dt`, `honor`, `bc` 도메인 연결이 없었다. DNS 조회 결과 세 호스트 모두 2026-08-19에 `NXDOMAIN`이었다. 이전 갤럭시 백업 글에는 `honor`·`bc` 흔적과 오래된 안내가 있었다.

수정 전 운영 표본은 `/ko`와 정상 가이드가 `200`, 모바일·댓글 변형이 `301`, 오래된 근로장려금 글과 종료된 축구 글이 모두 `200`이었다. `/53`과 `/m/53`은 현재 삭제 대상으로 분류된 나훈아 부산콘서트 글로 이동했다.

## 발견된 문제

- redirect chain: 살아 있는 동일-slug 글은 한 번에 canonical로 이동했지만, 통합 대상 4개를 새로운 대표 URL로 바꿀 경우 기존 모바일 규칙을 그대로 두면 `모바일 → 기존 글 → 대표 글`의 2-hop chain이 생길 구조였다. `/53 → 종료 글 → 410`도 생길 수 있었다.
- 중복 `200`: `/m`이나 `/comments`의 별도 `200`은 발견되지 않았다. 다만 연도형·특정 모델형 글 4개가 대표 콘텐츠로 통합되지 않은 채 독립 `200`이었고, 종료 콘텐츠 13개도 검색 가능한 `200`이었다.
- 죽은 내부 링크: 갤럭시 백업 글의 `honor.dreaming-free.com`, `bc.dreaming-free.com` 및 오래된 상업/참고 링크가 확인됐다. 45개 본문을 재구성하면서 제거했다.
- 오래된 탐색 링크: 종료 글, redirect source, `/m`, `/comments`를 향하는 현재 내부 탐색 링크는 최종 데이터에서 제거했다. `originalUrl`은 마이그레이션 이력 필드일 뿐 화면의 SEO 탐색 링크로 사용하지 않는다.

## 적용 구조

- 단일 기준 데이터는 `src/data/legacyGuides.json`이다. 정확히 KEEP 2, UPDATE 26, REDIRECT 4, GONE 13을 관리한다.
- `src/lib/legacyGuides.ts`가 이 데이터에서 redirect와 gone path를 파생하고, `src/proxy.ts`가 모든 본문·모바일·댓글·별칭 변형에 적용한다.
- KEEP/UPDATE의 canonical은 `200`, 모바일·댓글은 최종 canonical로 직접 `308`이다.
- REDIRECT는 데스크톱·모바일·댓글 변형 모두 새 대표 글로 직접 `308`이며 목적지는 `200`이다.
- GONE은 모든 변형이 redirect 없이 직접 `410`이고 `X-Robots-Tag: noindex, nofollow`를 보낸다.
- sitemap/RSS는 현재 `200`인 31개 글만 사용한다. `/m`, `/comments`, redirect source, 410 source는 포함하지 않는다.
- `public/_redirects`도 같은 데이터에서 생성한다. 410은 Netlify의 정적 404 fallback으로 오인되지 않도록 애플리케이션 proxy가 실제 상태 코드를 반환한다.
- 알려지지 않은 `/entry/*`는 계속 `404`이며 관련 없는 페이지로 보내지 않는다.

## 보존 항목

운영 도메인, `/ → /ko` 308, `/ko`, 도구·게임 URL, canonical/hreflang, CMP, 기존 AdSense publisher/slot, 검증 메타·스크립트 및 `/ads.txt` 구조는 변경하지 않았다.
