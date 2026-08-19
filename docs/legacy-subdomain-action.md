# 구 서브도메인 조치 기록

점검일: 2026-08-19

## 저장소에서 처리한 범위

`src/proxy.ts`는 아래 호스트의 요청이 현재 Netlify 애플리케이션까지 도달할 경우 호스트만 운영 도메인으로 정규화한다.

- 루트는 `https://dreaming-free.com/ko`로 직접 `308`
- 살아 있는 동일 글 경로는 운영 도메인의 self-canonical로 직접 `308`
- REDIRECT source와 모바일/comments 변형은 새 대표 글로 직접 `308`
- GONE 경로와 그 모바일/comments 변형은 호스트 이동 없이 직접 `410`
- 알 수 없는 경로는 관련 없는 홈으로 보내지 않고 운영 애플리케이션의 `404`
- 쿼리 문자열은 보존

이 처리는 DNS와 Netlify 도메인 연결을 대신하지 않는다.

## 호스트별 조사

| 호스트 | 코드에서 확인된 용도 | 2026-08-19 상태 | 필요한 외부 조치 |
| --- | --- | --- | --- |
| `dt.dreaming-free.com` | 현재 탐색 링크 없음. 과거 sitemap/RSS 제출 흔적만 인계 자료에서 확인 | DNS `NXDOMAIN` | 이 호스트의 과거 유입을 회수할 필요가 있을 때만 Netlify domain alias 추가 후 DNS CNAME/ALIAS 연결 |
| `honor.dreaming-free.com` | 이전 갤럭시 데이터 백업 본문의 오래된 링크 흔적. 새 본문은 삼성 공식 안내로 통합해 링크 제거 | DNS `NXDOMAIN` | 가치 있는 외부 링크가 확인될 때만 Netlify와 DNS에 연결. 매칭되는 현재 경로는 proxy가 처리하며 불명 경로는 개별 매핑 검토 |
| `bc.dreaming-free.com` | 이전 갤럭시 데이터 백업 본문의 오래된 링크 흔적. 새 본문에서 제거 | DNS `NXDOMAIN` | `honor`와 동일. 무조건 홈 redirect 대신 실제 과거 경로를 파악해 동등 페이지에만 매핑 |

## 사용자가 외부에서 해야 할 작업

1. DNS 제공자에서 세 호스트의 과거 레코드와 외부 링크/유입 가치가 실제로 있는지 확인한다.
2. 회수가 필요하면 먼저 Netlify `moatools` 사이트에 해당 custom domain/domain alias를 추가하고 TLS 발급을 확인한다.
3. DNS에서 Netlify가 안내하는 정확한 CNAME/ALIAS 값을 등록한다. 추측한 대상값을 사용하지 않는다.
4. 연결 후 각 호스트의 루트, 살아 있는 글, REDIRECT source, GONE source를 실제 HTTP로 검사한다.
5. Search Console에 남은 폐쇄 서브도메인 sitemap/RSS 제출 삭제는 계정 상태 변경이므로 별도 승인 후 수행한다.

현재 DNS가 `NXDOMAIN`인 상태에서는 저장소 코드만 배포해도 세 호스트의 요청이 애플리케이션에 도달하지 않는다.
