import { readFile, writeFile } from "node:fs/promises";
import { contentUpdates, replacementArticles } from "./legacy_content_2026.mjs";

const articlesPath = "src/data/guideArticles.json";
const indexPath = "src/data/guideIndex.json";
const legacyPath = "src/data/legacyGuides.json";
const modifiedAt = "2026-08-19T12:00:00+09:00";

const classifications = [
  ["2024-근로장려금-신청-방법신청-자격지급일", "REDIRECT", "근로장려금-신청-방법-자격-지급일", "연도 없는 2026 근로장려금 대표 글로 통합"],
  ["2024-상반기-나훈아-라스트-콘서트-예매일", "KEEP", null, "종료된 일정임을 명시한 무광고 보관 기록"],
  ["쿠팡플레이-중계-무료-보기", "UPDATE", null, "무료·와우·스포츠 패스 범위를 2026 기준으로 구분"],
  ["삼성화재-자녀사랑-할인-특약-서비스-신청-방법", "UPDATE", null, "삼성화재 공식 특약 기준으로 갱신"],
  ["갤럭시-휴대폰-화면-안보일때-데이터-백업-옮기는-방법", "UPDATE", null, "Smart Switch·DeX·서비스센터 공식 안내로 전면 개정"],
  ["임산부-KTX-SRT-할인-신청-방법30-할인", "UPDATE", null, "KTX 40%와 SRT 30% 조건을 2026 기준으로 분리"],
  ["신생아-특례-대출-신청방법-조건-금리-한도", "UPDATE", null, "주택도시기금 공식 심사 경로 중심으로 갱신"],
  ["다이소-제품-검색하는-방법", "UPDATE", null, "다이소몰 공식 재고 확인 경로로 갱신"],
  ["한국-사우디-축구-중계-방송-바로가기-아시안컵", "GONE", null, "종료된 특정 경기"],
  ["한국-말레이시아-축구-중계-방송-바로가기-아시안컵", "GONE", null, "종료된 특정 경기"],
  ["한국-요르단-축구-중계-방송-무료-보기", "GONE", null, "종료된 특정 경기"],
  ["한국-바레인-축구-중계-방송-바로가기-아시안컵", "GONE", null, "종료된 특정 경기"],
  ["맘편한-임신-서비스-신청", "UPDATE", null, "정부24 원스톱 서비스 기준으로 갱신"],
  ["난방비-절약-방법-및-캐시백-받는-방법", "UPDATE", null, "종료된 2025~2026 접수 상태와 다음 공지 확인 경로 반영"],
  ["연말정산-월세-소득공제-조건-및-신청방법", "UPDATE", null, "국세청 기준 세액공제·현금영수증 구분"],
  ["교통안전교육-예약-방법-운전면허-필수과정", "UPDATE", null, "안전운전 통합민원 절차로 갱신"],
  ["2024-노인-지원-혜택-최대-331만원-추가-지원", "REDIRECT", "노인-지원-혜택", "과장된 금액을 제거한 연도 없는 대표 글로 통합"],
  ["갤럭시-수리-예상-비용-조회", "UPDATE", null, "모델별 고정 가격 대신 삼성전자서비스 공식 조회 안내"],
  ["롯데월드-수험생-할인-받고-입장-잠실-부산", "UPDATE", null, "기간 한정 프로모션의 공식 확인 방법으로 갱신"],
  ["나훈아-부산콘서트-예매-방법-일정-주차장", "GONE", null, "종료된 특정 공연"],
  ["한국-베트남-축구-예매-및-중계-라인업-확인", "GONE", null, "종료된 특정 경기"],
  ["진주-유등축제-불꽃놀이-일정-기간-주차장-10월-가볼만한-곳", "UPDATE", null, "2026 공식 축제 기간과 공지 확인 경로 반영"],
  ["결혼-답례품-추천-Top-5-5천원대", "UPDATE", null, "가격 단정과 구매 유도 대신 선택 기준 중심으로 갱신"],
  ["타이젬-바둑-설치-방법-및-다운로드", "UPDATE", null, "공식 다운로드·웹 대국실 경로로 갱신"],
  ["2023-서울-불꽃축제-시간-명당-준비물-실시간", "REDIRECT", "서울-불꽃축제-일정-명당-준비물", "매년 갱신 가능한 연도 없는 대표 글로 통합"],
  ["국외발신-카드신청-완료-문자-대처-방법-신한-국민-삼성-등", "KEEP", null, "문자 속 번호로 연락하지 않는 핵심 안전 안내 유지·갱신"],
  ["두산로보틱스-공모주-청약-정보-경쟁률-환불일-상장일", "GONE", null, "종료된 공모주 청약 일정"],
  ["아이폰15-알뜰폰-사전예약-혜택-및-시리즈별-가격", "GONE", null, "종료된 출시·사전예약"],
  ["보일러-교체-지원금-신청-절차-및-자격-대상-최대-60만원-받아가세요", "UPDATE", null, "지자체별 2026 공고 확인 방식으로 갱신"],
  ["RGB-색상표-컬러-색상-팔레트-바로-확인", "UPDATE", null, "기술 설명을 교정하고 페이지 내 변환 도구 제공"],
  ["임영웅-대구콘서트-예매-티켓팅-꿀팁-서울-대구-부산-대전-광주", "GONE", null, "종료된 특정 공연"],
  ["가전제품-버리는-방법-소형가전-선풍기-포함", "UPDATE", null, "폐가전 무상방문수거 공식 안내로 갱신"],
  ["경복궁-야간개장-현장발권-예매-방법-및-주차장", "UPDATE", null, "2026 궁능유적본부 공식 일정 기준으로 갱신"],
  ["재산세-조회-납부일-카드혜택-무이자-할부", "UPDATE", null, "오래된 카드 이벤트를 제거하고 공식 조회 경로로 갱신"],
  ["청와대-야간관람신청-밤의-산책-예약방법", "GONE", null, "종료된 특정 야간관람 행사"],
  ["신한카드-결제일별-사용기간-및-결제일-변경-방법", "UPDATE", null, "신한카드 공식 이용기간·변경 경로로 갱신"],
  ["모로코-지진-기부", "GONE", null, "종료된 특정 재난 모금"],
  ["개인통관고유부호-발급방법-조회-재발급", "UPDATE", null, "관세청 공식 발급·도용예방 안내로 갱신"],
  ["주정차단속-문자알림-서비스-신청-방법-전국", "UPDATE", null, "지자체별 서비스이며 단속 면제가 아님을 명확화"],
  ["모로코-지진-강진-사망자-및-기부-방법", "GONE", null, "종료된 특정 재난·모금"],
  ["폴드5-톰브라운-에디션-출시일-및-사전예약-언박싱", "GONE", null, "종료된 출시·사전예약"],
  ["서울사랑상품권-발행일정-및-구매방법", "UPDATE", null, "2026 서울시 공지와 서울페이플러스 기준으로 갱신"],
  ["갤럭시-S23-울트라-액정-교체비용-S20-S21-S22-플립-폴드", "REDIRECT", "갤럭시-수리-예상-비용-조회", "갤럭시 수리 비용 대표 글로 통합"],
  ["KT-통신비-할인-카드-추천", "UPDATE", null, "2023 프로모션을 제거하고 비교 기준 중심으로 갱신"],
  ["네이버-밴드-PC버전-다운로드-방법", "UPDATE", null, "BAND 공식 웹·다운로드 경로로 갱신"],
];

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderContent(entry) {
  const headings = entry.sections.map((item, index) => ({
    id: `section-${index + 1}`,
    label: item.heading,
    level: "h2",
  }));
  const parts = [`<p>${escapeHtml(entry.description)}</p>`];
  for (const [index, item] of entry.sections.entries()) {
    parts.push(`<h2 id="section-${index + 1}">${escapeHtml(item.heading)}</h2>`);
    for (const paragraph of item.paragraphs) parts.push(`<p>${escapeHtml(paragraph)}</p>`);
  }
  parts.push(`<h2 id="official-sources">공식 출처</h2>`);
  parts.push(`<p>아래 공식 안내를 ${checkedLabel()}에 확인했습니다. 제도·가격·행사 일정은 바뀔 수 있으므로 신청이나 결제 직전에 다시 확인하세요.</p>`);
  parts.push("<ul>");
  for (const item of entry.sources) {
    parts.push(`<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a></li>`);
  }
  parts.push("</ul>");
  headings.push({ id: "official-sources", label: "공식 출처", level: "h2" });
  return { contentHtml: parts.join("\n"), headings };
}

function checkedLabel() {
  return "2026년 8월 19일";
}

function textLength(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

function updateArticle(article, entry) {
  const rendered = renderContent(entry);
  return {
    ...article,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    modifiedAt,
    headings: rendered.headings,
    contentHtml: rendered.contentHtml,
    characterCount: textLength(rendered.contentHtml),
  };
}

const originalArticles = JSON.parse(await readFile(articlesPath, "utf8"));
const originalIndex = JSON.parse(await readFile(indexPath, "utf8"));
const articleBySlug = new Map(originalArticles.map((article) => [article.slug, article]));
const indexBySlug = new Map(originalIndex.map((article) => [article.slug, article]));
const existingLegacy = await readFile(legacyPath, "utf8").then(JSON.parse).catch(() => null);

const legacyGuides = existingLegacy || classifications.map(([currentSlug, status, explicitTargetSlug, notes]) => {
  const indexItem = indexBySlug.get(currentSlug);
  if (!indexItem) throw new Error(`Missing legacy guide in guideIndex.json: ${currentSlug}`);
  const targetSlug = status === "GONE" ? null : explicitTargetSlug || currentSlug;
  return {
    title: indexItem.title,
    currentSlug,
    status,
    targetSlug,
    targetUrl: targetSlug ? `/entry/${targetSlug}` : null,
    aliases: indexItem.aliases || [],
    legacyPaths: currentSlug === "나훈아-부산콘서트-예매-방법-일정-주차장" ? ["/53", "/m/53"] : [],
    notes,
  };
});

const classificationBySlug = new Map(legacyGuides.map((entry) => [entry.currentSlug, entry]));
const nextArticles = [];

for (const article of originalArticles) {
  const legacy = classificationBySlug.get(article.slug);
  if (!legacy) {
    nextArticles.push(article);
    continue;
  }
  if (legacy.status === "GONE") continue;
  if (legacy.status === "REDIRECT") {
    const replacement = replacementArticles[legacy.targetSlug];
    if (!replacement) {
      if (articleBySlug.has(legacy.targetSlug)) continue;
      throw new Error(`Missing replacement content for ${legacy.targetSlug}`);
    }
    const currentTarget = articleBySlug.get(legacy.targetSlug);
    if (currentTarget) continue;
    const created = updateArticle({
      ...article,
      slug: legacy.targetSlug,
      aliases: [],
      title: replacement.title,
      description: replacement.description,
      category: replacement.category,
      heroImage: null,
      images: [],
    }, replacement);
    nextArticles.push(created);
    continue;
  }
  const update = contentUpdates[article.slug];
  nextArticles.push(update ? updateArticle(article, update) : article);
}

for (const [slug, replacement] of Object.entries(replacementArticles)) {
  if (nextArticles.some((article) => article.slug === slug)) continue;
  const legacy = legacyGuides.find((entry) => entry.targetSlug === slug);
  const source = articleBySlug.get(legacy?.currentSlug);
  if (!source) throw new Error(`Cannot create replacement article ${slug}`);
  nextArticles.push(updateArticle({ ...source, slug, aliases: [], heroImage: null, images: [] }, replacement));
}

const nextIndex = nextArticles.map((article) => Object.fromEntries(
  Object.entries(article).filter(([key]) => !["images", "headings", "contentHtml"].includes(key)),
));
const statusCounts = Object.fromEntries(["KEEP", "UPDATE", "REDIRECT", "GONE"].map((status) => [
  status,
  legacyGuides.filter((entry) => entry.status === status).length,
]));

if (legacyGuides.length !== 45 || statusCounts.KEEP !== 2 || statusCounts.UPDATE !== 26 || statusCounts.REDIRECT !== 4 || statusCounts.GONE !== 13) {
  throw new Error(`Invalid legacy classification counts: ${JSON.stringify(statusCounts)}`);
}
if (nextArticles.length !== 31) throw new Error(`Expected 31 live articles, received ${nextArticles.length}`);

await writeFile(legacyPath, `${JSON.stringify(legacyGuides, null, 2)}\n`, "utf8");
await writeFile(articlesPath, `${JSON.stringify(nextArticles, null, 2)}\n`, "utf8");
await writeFile(indexPath, `${JSON.stringify(nextIndex, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ legacy: legacyGuides.length, live: nextArticles.length, ...statusCounts }, null, 2));
