# MoaTools

한국어와 영어를 지원하는 생활형 계산기, 변환기, 생성기, 미니 게임 포털입니다. 모든 핵심 도구는 브라우저에서 즉시 실행되며, 검색 엔진이 언어별 콘텐츠를 독립적으로 이해하도록 구성되어 있습니다.

## 포함된 기능

- 공통 도구 10개: 나이, 퍼센트·할인, 단위, 날짜, 이미지 최적화, 대출 상환, 복리, 글자 수, QR 코드, 비밀번호
- 한국 생활 도구 10개: 급여 환산, 퇴직금, 4대보험, 주휴수당, 부가세, 평수, 서울 주택 중개보수, 가전 전력비, 음력·양력, 로또 번호
- 글로벌 도구 10개: PDF 합치기·분리, BMI, 시간대, 포모도로, 랜덤 휠, JSON, Unix 타임스탬프, UUID, 여행 연료비, 영문 타자 속도
- 웹 게임 3개: 2048, 기억력 카드 맞추기, Coral Sky 슈팅 게임
- 티스토리 레거시 가이드 45개를 분류해 현재 제공하는 생활 가이드 31개: KEEP 2, UPDATE 26, 새 대표 글 3개, 이미지 518개 자체 호스팅

각 도구에는 사용법, 계산 원리, 활용 예시, 검증 방법, FAQ, 관련 도구가 포함됩니다. 출처가 필요한 계산기는 공공기관 또는 표준 문서 링크를 함께 표시합니다. About, Editorial Policy, Privacy, Terms, Contact 페이지도 한국어와 영어로 제공합니다.

광고는 일반 도구 페이지의 본문을 읽은 뒤 만나는 전용 영역에만 배치하며, 게임 페이지와 게임 조작 영역에는 렌더링하지 않습니다. 모바일에서도 광고 컨테이너가 콘텐츠를 밀어내지 않도록 최소 높이를 예약합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

검증 명령은 다음과 같습니다.

```bash
npm run lint
npm run typecheck
npm run build
```

## 배포 환경 변수

`.env.example`을 기준으로 배포 서비스에 아래 값을 등록합니다.

```text
NEXT_PUBLIC_SITE_URL=https://dreaming-free.com
NEXT_PUBLIC_OPERATOR_NAME=실제운영주체명
NEXT_PUBLIC_REVIEWER_NAME=실제콘텐츠검수자명
NEXT_PUBLIC_CONTACT_EMAIL=실제문의이메일
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-실제게시자번호
NEXT_PUBLIC_ADSENSE_SLOT=실제광고슬롯번호
NEXT_PUBLIC_GUIDE_ADS_ENABLED=false
NEXT_PUBLIC_GA_ID=G-실제측정ID
GOOGLE_SITE_VERIFICATION=실제인증값
NAVER_SITE_VERIFICATION=네이버소유확인값
INDEXNOW_KEY=8자이상16진수키
```

`NEXT_PUBLIC_ADSENSE_CLIENT`를 등록하면 사이트 연결용 `google-adsense-account` 메타 태그와 동일한 게시자 번호의 `ads.txt`가 자동 생성됩니다. `NEXT_PUBLIC_ADSENSE_SLOT`까지 유효하게 등록한 경우에만 일반 도구 페이지의 전용 광고 영역에서 광고 스크립트가 실행됩니다. 가짜 게시자 번호나 슬롯 번호는 넣지 마세요.

이전한 가이드 글에는 승인 신청 및 이전 안정화 기간 동안 광고를 표시하지 않는 것이 기본값입니다. 원본 티스토리 글의 이전 또는 비공개 처리, 수동 품질 검수, Search Console의 canonical 확인이 끝난 뒤에만 `NEXT_PUBLIC_GUIDE_ADS_ENABLED=true`를 검토하세요. 값이 `false`이면 가이드 글에는 광고 슬롯 자체가 렌더링되지 않습니다.

이 프로젝트의 운영 도메인은 `https://dreaming-free.com`을 전제로 합니다. 기존에 승인받은 실제 게시자 ID와 광고 슬롯 번호는 소스에 하드코딩하지 않고 배포 환경 변수로만 등록하세요.

## 도구별 Google·네이버 검색 노출

모든 도구는 홈 화면의 기능이 아니라 독립적인 검색 랜딩 페이지입니다. 30개 도구 각각에 한국어와 영어 검색용 `heading`, `title`, `description`, `queries`를 명시해 총 60개 언어별 검색 데이터 세트를 사용합니다. 한국어 값은 국내 검색 표현을 기준으로 작성하고, 영어 값은 한국어 제목을 직역하지 않고 영어권 이용자가 실제로 이해하고 검색할 수 있는 native English 표현으로 별도 작성합니다.

`4대보험 계산기`는 전체 적용 방식을 설명하기 위한 하나의 예시일 뿐이며, 특정 도구만 별도로 최적화한 것이 아닙니다. 같은 구조가 나이 계산기, 이미지 압축, PDF 합치기, BMI 계산기, 타임존 변환기 등 30개 도구 모두에 적용됩니다. 예시 도구의 한국어 대표 URL은 아래 주소입니다.

```text
https://dreaming-free.com/ko/tools/four-major-insurance
```

이 페이지는 `<title>4대보험 계산기 | 모아툴</title>`, 정확히 일치하는 H1, 고유 설명, self-canonical, 한·영 hreflang, WebApplication·Breadcrumb 구조화 데이터, 공식 출처와 관련 도구 링크를 제공합니다. 대응하는 영어 페이지는 `Korea Social Insurance Calculator`처럼 영어 검색 의도에 맞춘 별도 heading과 title을 사용합니다. 검색엔진에는 홈이 아닌 각 도구의 canonical URL을 제출합니다.

모든 도구의 검색 데이터는 다음 위치에 일관되게 반영됩니다.

- 언어가 고정된 개별 URL: `/ko/tools/<slug>`와 `/en/tools/<slug>`
- 페이지의 검색 제목과 meta description, 화면의 단일 H1
- 도구 허브, 관련 도구 카드, Breadcrumb 등 내부 링크의 언어별 링크 문구
- WebApplication·Breadcrumb 구조화 데이터의 이름, 설명, URL과 검색어 정보
- canonical, hreflang, sitemap의 해당 언어 URL

- `/ko/tools`와 `/en/tools`는 각각 모든 도구로 연결되는 검색엔진용 허브입니다.
- sitemap에는 60개 한·영 도구 URL과 두 개의 도구 허브가 포함됩니다.
- 헤더·푸터·모바일 메뉴와 Breadcrumb는 해시 주소가 아닌 도구 허브 및 개별 도구 URL을 직접 링크합니다.
- `NAVER_SITE_VERIFICATION`을 등록하면 서버 HTML의 `<head>`에 네이버 소유확인 메타 태그가 생성됩니다.
- `INDEXNOW_KEY`를 등록하면 `/indexnow-key.txt`에서 키를 검증할 수 있습니다.

프로덕션 서버를 실행한 뒤 아래 명령으로 60개 도구의 HTTP 200, title/H1, 설명, canonical, hreflang, 구조화 데이터와 출시 전 noindex 안전장치를 전수 검사합니다.

```powershell
$env:SEO_TEST_ORIGIN='http://127.0.0.1:3000'
npm run verify:tool-seo
```

배포 후 새로 만들거나 실제로 수정한 도구 URL은 IndexNow로 네이버에 알릴 수 있습니다. 초기 출시 전체 제출에만 `--sitemap`을 사용하고, 이후에는 변경된 canonical URL만 전달하세요. IndexNow는 수집 신호이며 색인이나 순위를 보장하지 않습니다.

```powershell
$env:INDEXNOW_ORIGIN='https://dreaming-free.com'
$env:INDEXNOW_KEY='실제키'
npm run submit:indexnow -- /ko/tools/four-major-insurance
```

## 티스토리 글 이전

- 최초 이전한 공개 글 45개는 `src/data/legacyGuides.json` 한 곳에서 KEEP 2, UPDATE 26, REDIRECT 4, GONE 13으로 관리합니다.
- KEEP/UPDATE 28개는 기존 canonical에서 `200`, REDIRECT 4개의 새 대표 글 3개는 새 canonical에서 `200`입니다. 살아 있는 가이드는 총 31개입니다.
- 제목 별칭과 `/m/entry/...`, `/comments` 주소는 `src/proxy.ts`에서 최종 canonical 주소로 정확한 `308`을 반환합니다.
- 기존 모바일 홈 `/m`은 한국어 홈 `/ko`로, 모바일 글 목록 `/m/entry`는 `/entry`로 한 번에 `308` 이동합니다. `/m/*` 전체를 홈으로 보내는 wildcard는 사용하지 않습니다.
- GONE 13개의 본문·모바일·댓글 변형은 redirect 없이 실제 `410 Gone`을 반환합니다.
- `src/app/sitemap.ts`는 도구·게임·정책 페이지와 살아 있는 31개 글만 `/sitemap.xml`에 포함합니다. 별칭, 모바일·댓글, redirect source, 410 URL은 제외합니다.
- 가져온 이미지 518개는 `public/guides`에 WebP로 보관하므로 서명 만료가 있는 외부 이미지 주소에 의존하지 않습니다.
- `scripts/apply_legacy_cleanup.mjs`가 원본 이전 데이터에 최신 본문과 분류를 재현 가능하게 적용합니다. 최초 원문 가져오기 스크립트를 다시 실행하면 정리 데이터가 덮일 수 있으므로 이어서 cleanup script를 실행하고 diff를 검토해야 합니다.

### 308/410 우선순위와 응답 규칙

| 요청 | 응답 | 이유 |
| --- | --- | --- |
| KEEP/UPDATE `dreaming-free.com/entry/<기존-슬러그>` | `200` | 기존 URL과 SEO 신호 보존 |
| KEEP/UPDATE의 모바일·댓글·별칭 | `308` | 한 번에 최종 canonical로 통합 |
| REDIRECT source의 모든 변형 | `308` | 한 번에 새 대표 글로 통합 |
| GONE source의 모든 변형 | `410` | 종료 콘텐츠를 별도 HTML이나 무관한 redirect 없이 제거 |
| `www`와 연결된 구 서브도메인 | `308` | 경로·쿼리를 보존하며 운영 도메인 최종 상태로 정규화 |
| 등록되지 않은 `/entry/*` | `404` | 관련 없는 글로 보내는 soft 404 방지 |

프로덕션 빌드를 실행한 서버에 대해 아래 명령으로 전체 매핑을 확인할 수 있습니다.

```powershell
$env:REDIRECT_TEST_ORIGIN='http://127.0.0.1:3000'
npm run verify:routes
```

검증 기준은 legacy 분류 45개, 살아 있는 글 31개 `200`, 모든 모바일·댓글·별칭의 직접 `308`, GONE 변형의 직접 `410`, 미등록 URL의 `404`입니다. `Location`은 쿼리 문자열을 보존하고 redirect target은 추가 hop 없이 `200`이어야 합니다.

도메인 연결과 실제 운영 환경 변수 등록이 끝나면 아래 명령으로 `robots.txt`, sitemap, 도구 60개, canonical, hreflang, Google·네이버 소유확인, IndexNow 키, 308/410, AdSense 메타 태그, `ads.txt`, 정책 페이지를 한 번에 검사합니다. 이 명령은 준비 누락을 찾는 기술 점검이며 검색 노출이나 Google의 심사 승인을 보장하는 명령은 아닙니다.

```powershell
$env:LAUNCH_TEST_ORIGIN='https://dreaming-free.com'
npm run verify:launch
```

원문을 다시 동기화해야 할 때만 아래 명령을 실행하세요. 원격 글을 기준으로 생성 데이터가 다시 작성되므로, 먼저 변경 사항을 확인하는 것이 좋습니다.

```bash
python scripts/import_tistory.py
```

주의: 새 Next.js 서버는 `1step-by-step.tistory.com`으로 들어온 요청을 받을 수 없습니다. 따라서 티스토리 호스트에서 `dreaming-free.com`으로 보내는 진짜 HTTP redirect는 티스토리 측 서버 설정 또는 티스토리 앞단의 제어 가능한 프록시가 있어야 합니다. `docs/tistory-migration-head.html`은 서버 redirect가 불가능할 때 사용하는 브라우저 이동 보조안이며 HTTP redirect가 아닙니다. 새 사이트 코드가 보장하는 범위는 새 도메인 또는 실제로 연결된 alias host로 들어오는 요청입니다.

## 언어와 국가 처리

- `/ko`와 `/en`은 각각 고정된 언어 URL입니다.
- `/`에서만 국가 헤더를 확인해 한국은 `/ko`, 그 외 국가는 `/en`으로 이동합니다.
- Vercel의 `x-vercel-ip-country`, Cloudflare의 `cf-ipcountry`, 일반 `x-country-code`를 지원합니다.
- 국가 헤더가 없으면 브라우저의 `Accept-Language`를 사용합니다.
- 각 언어 페이지에는 자기 참조 canonical, 한국어와 영어 hreflang, x-default가 있습니다.
- 헤더와 모바일 메뉴에서 언제든 언어를 직접 바꿀 수 있습니다.

## 출시 전 체크리스트

1. 실제 도메인, 운영 주체명, 문의 이메일을 환경 변수에 등록합니다. 셋 중 하나라도 없거나 예시 값이면 잘못된 canonical 및 불완전한 운영자 정보가 색인되지 않도록 자동으로 `noindex`와 전체 robots 차단이 적용됩니다. 검수자가 별도라면 `NEXT_PUBLIC_REVIEWER_NAME`에도 실제 개인 또는 기관명을 등록합니다.
2. 개인정보처리방침과 이용약관을 운영 주체 및 관할 법률에 맞게 검토합니다.
3. Google Search Console에서 도메인을 확인하고 `/sitemap.xml`을 제출한 뒤 주요 도구 URL을 URL 검사합니다.
4. 네이버 서치어드바이저에서 `dreaming-free.com` 소유확인을 완료하고 같은 `/sitemap.xml`을 제출한 뒤 `4대보험 계산기` 등 핵심 도구 URL을 개별 수집 요청합니다.
5. AdSense 검토를 요청하기 전에 실제 AdSense client 또는 publisher ID로 사이트를 연결하고, `NEXT_PUBLIC_GUIDE_ADS_ENABLED=false`를 유지합니다.
6. 승인 후 광고 단위를 만든 다음 실제 광고 슬롯 번호를 등록합니다.
7. EEA, 영국, 스위스 이용자에게 광고를 제공하기 전에 AdSense의 Privacy & messaging에서 Google 인증 CMP를 활성화합니다.
8. Auto Ads를 사용할 경우 `/ko/games/*`와 `/en/games/*`를 페이지 제외 목록에 추가해 게임 조작부 주변 자동 광고를 차단합니다.
9. Google Analytics는 유효한 측정 ID가 있어도 내장된 한·영 분석 동의 UI에서 허용하기 전에는 로드되지 않습니다. 배포할 때 Consent Mode와 보존기간을 실제 운영 정책에 맞게 설정합니다.
10. 실제 기기에서 이미지 처리, PDF 처리, QR 다운로드, 게임의 터치 조작을 확인합니다.
11. 배포된 사이트에서 `/robots.txt`, `/sitemap.xml`, `/ads.txt` 응답을 다시 확인합니다.
12. 새 호스팅에서 `dreaming-free.com`과 `www`의 TLS 발급을 끝낸 뒤 DNS를 전환하고, 기존 인기 글은 `200`, 모바일·댓글·별칭과 `www`는 한 번의 `308`로 정규 URL에 도달하며 GONE은 직접 `410`인지 확인합니다.
13. Search Console의 기존 `dreaming-free.com` 속성에서 sitemap을 다시 제출하고 404, canonical, 색인 상태를 모니터링합니다. 도메인이 유지되는 호스팅 이전이므로 주소 변경 도구는 사용하지 않습니다.
14. `npm run verify:launch`가 도구 60개를 포함해 모두 통과하는지 확인합니다.
15. AdSense의 사이트 상태와 `ads.txt` 승인 상태를 전환 후 다시 확인합니다.

AdSense 승인과 검색 순위는 콘텐츠 품질, 운영 이력, 정책 준수, 경쟁 상황 등을 Google이 종합적으로 판단하므로 보장할 수 없습니다. 이 프로젝트는 신청과 색인에 필요한 기술 구조를 준비하고, 광고를 콘텐츠 및 게임 조작부와 분리하도록 설계했습니다.
