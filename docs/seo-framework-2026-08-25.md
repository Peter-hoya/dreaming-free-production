# Codex SEO 프레임워크 반영 기록

검토 기준은 `AgriciDaniel/claude-seo`의 Codex 포트 `AgriciDaniel/codex-seo` v1.9.6-codex.5로 고정했다. 외부 감사 결과를 그대로 신뢰하지 않고 운영 URL, 초기 HTML, 응답 헤더와 프로젝트 데이터를 직접 대조했다.

## 반영한 항목

- 홈에 `WebPage` 구조화 데이터를 추가하고 기존 `WebSite`, `Organization`과 `@id`로 연결했다.
- 운영 문의 이메일이 설정된 경우 `Organization.contactPoint`에 표시하고 로고 URL을 연결했다.
- Google에서 일반 상업 사이트의 리치 결과 대상이 아닌 `FAQPage` JSON-LD를 홈, 도구, 게임에서 제거했다. 화면의 FAQ 콘텐츠와 접근 가능한 `<details>` UI는 유지한다.
- Google이 사용하지 않는 sitemap의 `priority`, `changefreq`를 제거하고 실제 수정일인 `lastmod`, canonical URL, hreflang, 가이드 이미지는 유지한다.
- 전 경로에 `X-Frame-Options: SAMEORIGIN`을 추가했다. 전체 CSP는 AdSense, Analytics와 CMP의 허용 출처를 운영 정책과 함께 확정해야 하므로 이번 변경에서 강제하지 않는다.
- `npm run verify:seo-framework`로 보안 헤더, robots, sitemap, canonical, indexability, 홈·도구·가이드 구조화 데이터와 화면의 작성자/수정일을 재검증할 수 있다.

## 외부 감사에서 제외한 항목

- 감사 도구가 제목에서 추정한 한글 URL의 404는 실제 canonical URL 오류가 아니므로 수정하지 않았다.
- PageSpeed API 호출은 공개 쿼터 제한으로 429가 반환되어, 감사 도구가 추정한 LCP/INP 수치를 실측값으로 취급하지 않았다.
- `llms.txt`는 검색 노출 개선 근거가 확인되지 않아 추가하지 않았다.
- Content-Security-Policy는 광고와 동의 관리 스크립트의 전체 출처를 검증하지 않은 상태에서 추가하면 서비스가 깨질 수 있어 보류했다.

## 실행 방법

프로덕션 빌드를 로컬에서 실행한 경우:

```powershell
$env:SEO_FRAMEWORK_ORIGIN='http://127.0.0.1:3000'
$env:EXPECT_INDEXABLE='false' # 운영자 환경변수가 없는 로컬 안전 빌드
npm run verify:seo-framework
```

배포 후 운영 사이트를 확인할 경우:

```powershell
$env:SEO_FRAMEWORK_ORIGIN='https://dreaming-free.com'
$env:EXPECT_INDEXABLE='true'
npm run verify:seo-framework
```
