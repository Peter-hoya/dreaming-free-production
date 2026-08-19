from __future__ import annotations

import hashlib
import json
import re
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from email.utils import parsedate_to_datetime
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen

from lxml import etree, html
from PIL import Image, ImageOps


SOURCE_ORIGIN = "https://1step-by-step.tistory.com"
SOURCE_HOST = "1step-by-step.tistory.com"
IMAGE_HOSTS = {"blog.kakaocdn.net"}
MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BYTES = 25 * 1024 * 1024
RSS_URL = f"{SOURCE_ORIGIN}/rss"
SITEMAP_URL = f"{SOURCE_ORIGIN}/sitemap.xml"
USER_AGENT = "Mozilla/5.0 (compatible; MoaToolsMigration/1.0; +https://dreaming-free.com)"
WORKSPACE = Path(__file__).resolve().parents[1]
PUBLIC_GUIDES = WORKSPACE / "public" / "guides"
DATA_DIR = WORKSPACE / "src" / "data"
MIGRATED_AT = "2026-07-21"

PRIORITY_TITLES = [
    "갤럭시 휴대폰 화면 안보일때 데이터 백업 옮기는 방법",
    "결혼 답례품 추천 Top 5 (5천원대)",
    "갤럭시 S23 울트라 액정 교체비용 (S20, S21, S22, 플립, 폴드)",
    "다이소 제품 검색하는 방법",
    "교통안전교육 예약 방법 (운전면허 필수과정)",
    "난방비 절약 방법 및 캐시백 받는 방법",
    "갤럭시 수리 비용 조회",
    "국외발신 카드신청 완료 문자 대처 방법 (신한 국민 삼성 등)",
    "삼성화재 자녀사랑 할인 특약 서비스 신청 방법",
    "삼성화재 자녀사랑 할인 특약 신청 방법",
]

BROKEN_SUBDOMAIN_OVERRIDES = {
    "/entry/갤럭시-수리-비용-알아보기": "/entry/갤럭시-수리-예상-비용-조회",
    "/entry/갤럭시-Dex-연결시-화면보호기-잠금-해제-방법": "https://www.samsungsvc.co.kr/solution/928051",
    "/entry/갤럭시-휴대폰-사진-동영상-데이터-백업-컴퓨터로-옮기는-방법": "https://www.samsungsvc.co.kr/solution/38683",
    "/entry/월세-환급-소득공제-경정청구-방법": "/entry/연말정산-월세-소득공제-조건-및-신청방법",
    "/entry/2024년-임신-출산-혜택-신청-바로가기": "/entry/맘편한-임신-서비스-신청",
    "/entry/2024-나훈아-콘서트-예매-바로가기-인천-청주-울산-창원-천안-원주-전주": "",
}

EXACT_URL_OVERRIDES = {
    "https://www.safedriving.or.kr/mainM.do": "https://www.safedriving.or.kr/main.do",
    "https://www.samsungcard.com/personal/customer-service/UHPPCC0299M0.jsp": "https://www.samsungcard.com/",
    "https://www.bccard.com/app/card/evntPgrsDetailActn.do?evntNo=2023060017": "https://www.bccard.com/",
    "https://pc.wooricard.com/dcpc/yh1/bnf/bnf02/prgevnt/movePrgEvntDtl.do?evntSrno=30001974": "https://direct.samsungfire.com/mydirect/PP020301_001.html",
    "https://apps.apple.com/kr/app/id1601946145": "https://apps.apple.com/kr/app/id6479675842",
    "https://play.google.com/store/apps/details?id=com.shinhancard.localpayplatform&pli=1": "https://play.google.com/store/apps/details?id=com.bizplay.seoul.pay",
    "https://play.google.com/store/apps/details?id=com.tmoney.tmpay": "https://play.google.com/store/apps/details?id=com.lgt.tmoney",
    "https://redcross.campaignus.me/morocco": "",
    "https://whistle0.page.link/vo9wcygbcUc9y6y2A": "https://www.010car.kr/",
    "https://www.hanwhafireworks.com/kor/main.html": "https://www.hanwhafireworks.com/",
    "https://www.seniorro.or.kr:4431/seniorro/main/main.do": "https://www.seniorro.or.kr/",
    "https://www.skylife.co.kr/my/charge/pay/change": "https://www.skylife.co.kr/center/consult/FAQ/detail?id=85",
}

ALLOWED_TAGS = {
    "a",
    "aside",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "figcaption",
    "figure",
    "h2",
    "h3",
    "h4",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
}

DROP_WITH_CONTENT = {"button", "center", "font"}
DROP_COMPLETELY = {"embed", "form", "iframe", "input", "ins", "noscript", "object", "script", "style", "textarea"}
AFFILIATE_HOSTS = {"link.coupang.com", "coupa.ng"}


@dataclass(frozen=True)
class SourceArticle:
    title: str
    source_url: str
    legacy_slug: str
    body_html: str
    author: str
    published_at: str


def validate_fetch_url(url: str, allowed_hosts: set[str]) -> None:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or hostname not in allowed_hosts or parsed.username or parsed.password:
        raise RuntimeError(f"Blocked migration URL: {url}")


def fetch_bytes(url: str, *, allowed_hosts: set[str], max_bytes: int, attempts: int = 3) -> bytes:
    validate_fetch_url(url, allowed_hosts)
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urlopen(request, timeout=45) as response:
                validate_fetch_url(response.geturl(), allowed_hosts)
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > max_bytes:
                    raise RuntimeError(f"Migration response exceeds {max_bytes} bytes: {url}")
                payload = response.read(max_bytes + 1)
                if len(payload) > max_bytes:
                    raise RuntimeError(f"Migration response exceeds {max_bytes} bytes: {url}")
                return payload
        except Exception as error:
            last_error = error
            if attempt + 1 < attempts:
                time.sleep(0.7 * (attempt + 1))
    raise RuntimeError(f"Unable to fetch {url}: {last_error}")


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFC", re.sub(r"\s+", " ", value or "").strip())


def title_slug(title: str) -> str:
    return re.sub(r"\s+", "-", unicodedata.normalize("NFC", title.strip()))


def decoded_path(url: str) -> str:
    return unicodedata.normalize("NFC", unquote(urlparse(url).path))


def legacy_slug_from_url(url: str) -> str:
    path = decoded_path(url)
    marker = "/entry/"
    if marker not in path:
        raise ValueError(f"Not an entry URL: {url}")
    return path.split(marker, 1)[1].strip("/")


def iso_from_rfc2822(value: str) -> str:
    return parsedate_to_datetime(value).isoformat()


def load_source_articles() -> tuple[list[SourceArticle], set[str]]:
    rss_root = etree.fromstring(fetch_bytes(RSS_URL, allowed_hosts={SOURCE_HOST}, max_bytes=MAX_DOCUMENT_BYTES))
    articles: list[SourceArticle] = []
    for item in rss_root.xpath("//item"):
        title = normalize_text(item.findtext("title") or "")
        source_url = normalize_text(item.findtext("link") or "")
        body_html = item.findtext("description") or ""
        author = normalize_text(item.findtext("author") or "자꿈남")
        published_at = iso_from_rfc2822(item.findtext("pubDate") or "")
        if not title or not source_url or not body_html:
            raise RuntimeError(f"Incomplete RSS item: {title or source_url}")
        validate_fetch_url(source_url, {SOURCE_HOST})
        articles.append(
            SourceArticle(
                title=title,
                source_url=source_url,
                legacy_slug=legacy_slug_from_url(source_url),
                body_html=body_html,
                author=author,
                published_at=published_at,
            )
        )

    sitemap_root = etree.fromstring(fetch_bytes(SITEMAP_URL, allowed_hosts={SOURCE_HOST}, max_bytes=MAX_DOCUMENT_BYTES))
    sitemap_paths = {
        decoded_path(node.text)
        for node in sitemap_root.xpath('//*[local-name()="loc"]')
        if node.text and "/entry/" in node.text and "/m/entry/" not in node.text
    }
    rss_paths = {decoded_path(article.source_url) for article in articles}
    if sitemap_paths != rss_paths:
        missing_from_rss = sorted(sitemap_paths - rss_paths)
        missing_from_sitemap = sorted(rss_paths - sitemap_paths)
        raise RuntimeError(
            "RSS and sitemap entry sets differ. "
            f"Missing from RSS: {missing_from_rss}. Missing from sitemap: {missing_from_sitemap}."
        )
    if len(articles) != len({article.legacy_slug for article in articles}):
        raise RuntimeError("Duplicate legacy slugs found in RSS")
    return articles, sitemap_paths


def page_metadata(article: SourceArticle) -> dict[str, str]:
    document = html.fromstring(
        fetch_bytes(article.source_url, allowed_hosts={SOURCE_HOST}, max_bytes=MAX_DOCUMENT_BYTES).decode("utf-8", "replace")
    )
    meta = {
        "title": normalize_text(document.xpath('string(//meta[@property="og:title"]/@content)')) or article.title,
        "description": normalize_text(document.xpath('string(//meta[@property="og:description"]/@content)')),
        "publishedAt": normalize_text(document.xpath('string(//meta[@property="article:published_time"]/@content)')) or article.published_at,
        "modifiedAt": normalize_text(document.xpath('string(//meta[@property="article:modified_time"]/@content)')) or article.published_at,
        "author": normalize_text(document.xpath('string(//meta[@property="og.article.author"]/@content)')) or article.author,
    }
    return meta


def infer_category(title: str) -> str:
    categories = [
        ("문화·스포츠", ("축구", "중계", "콘서트", "아시안컵", "나훈아", "예매")),
        ("자동차", ("운전", "교통안전", "자동차", "삼성화재", "보험", "면허")),
        ("디지털", ("갤럭시", "휴대폰", "카카오", "인스타", "쿠팡플레이", "액정", "수리")),
        ("가족·건강", ("임산부", "신생아", "자녀", "출산", "육아", "건강")),
        ("생활 금융", ("대출", "카드", "장려금", "난방비", "캐시백", "청년", "특례", "금리")),
    ]
    for category, keywords in categories:
        if any(keyword in title for keyword in keywords):
            return category
    return "생활 정보"


def clean_excerpt(fragment: html.HtmlElement, fallback: str) -> str:
    candidates = [normalize_text(node.text_content()) for node in fragment.xpath(".//p")]
    excerpt = next((candidate for candidate in candidates if len(candidate) >= 35), normalize_text(fallback))
    excerpt = re.sub(r"\.{2,}$", "", excerpt)
    if len(excerpt) > 180:
        excerpt = excerpt[:177].rstrip() + "…"
    return excerpt


def image_source_nodes(fragment: html.HtmlElement) -> list[html.HtmlElement]:
    return [node for node in fragment.xpath(".//img[@src]") if (node.get("src") or "").startswith(("http://", "https://"))]


def article_asset_id(article: SourceArticle) -> str:
    digest = hashlib.sha1(article.legacy_slug.encode("utf-8")).hexdigest()[:10]
    return f"article-{digest}"


def download_and_optimize_image(source_url: str, target: Path) -> tuple[int, int]:
    if target.exists():
        with Image.open(target) as existing:
            return existing.width, existing.height

    raw = fetch_bytes(source_url, allowed_hosts=IMAGE_HOSTS, max_bytes=MAX_IMAGE_BYTES)
    with Image.open(BytesIO(raw)) as opened:
        image = ImageOps.exif_transpose(opened)
        has_alpha = "A" in image.getbands() or "transparency" in image.info
        converted = image.convert("RGBA" if has_alpha else "RGB")
        converted.thumbnail((1800, 2400), Image.Resampling.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(".tmp")
        converted.save(
            temporary,
            format="WEBP",
            quality=92,
            method=6,
            lossless=has_alpha,
            exact=has_alpha,
        )
        temporary.replace(target)
        return converted.width, converted.height


def build_image_manifest(articles: list[SourceArticle]) -> dict[str, dict[str, Any]]:
    jobs: list[tuple[str, Path, str]] = []
    for article in articles:
        fragment = html.fragment_fromstring(article.body_html, create_parent="div")
        asset_id = article_asset_id(article)
        for index, node in enumerate(image_source_nodes(fragment), start=1):
            source_url = node.get("src") or ""
            target = PUBLIC_GUIDES / asset_id / f"image-{index:03d}.webp"
            public_path = f"/guides/{asset_id}/{target.name}"
            jobs.append((source_url, target, public_path))

    if len(jobs) != len({source for source, _, _ in jobs}):
        raise RuntimeError("The source feed unexpectedly reuses an image URL across multiple positions")

    manifest: dict[str, dict[str, Any]] = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_map = {
            executor.submit(download_and_optimize_image, source, target): (source, public_path)
            for source, target, public_path in jobs
        }
        for future in as_completed(future_map):
            source, public_path = future_map[future]
            width, height = future.result()
            manifest[source] = {"src": public_path, "width": width, "height": height}

    if len(manifest) != len(jobs):
        raise RuntimeError(f"Expected {len(jobs)} optimized images, generated {len(manifest)}")
    return manifest


def rewrite_internal_url(url: str, canonical_by_legacy_path: dict[str, str]) -> str:
    if url in EXACT_URL_OVERRIDES:
        return EXACT_URL_OVERRIDES[url]
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = unicodedata.normalize("NFC", unquote(parsed.path))
    if host in {"1step-by-step.tistory.com", "www.1step-by-step.tistory.com", "dreaming-free.com", "www.dreaming-free.com"}:
        normalized = path.replace("/m/entry/", "/entry/", 1)
        return canonical_by_legacy_path.get(normalized, normalized)
    if host.endswith(".dreaming-free.com"):
        return BROKEN_SUBDOMAIN_OVERRIDES.get(path, "")
    return url


def sanitize_article(
    source: SourceArticle,
    metadata: dict[str, str],
    image_manifest: dict[str, dict[str, Any]],
    canonical_by_legacy_path: dict[str, str],
) -> tuple[str, str, list[dict[str, str]], list[dict[str, Any]]]:
    fragment = html.fragment_fromstring(source.body_html, create_parent="div")

    for script in list(fragment.xpath(".//script")):
        parent = script.getparent()
        if parent is not None and parent.tag == "center":
            wrapper = parent.getparent()
            if wrapper is not None and normalize_text(parent.text_content()) == "":
                wrapper.remove(parent)
                continue
        script.drop_tree()
    for node in list(fragment.iterdescendants()):
        if not isinstance(node.tag, str):
            continue
        tag = node.tag.lower()
        if tag in DROP_COMPLETELY:
            node.drop_tree()
        elif tag in DROP_WITH_CONTENT:
            if tag == "button" and node.getparent() is not None and node.getparent().tag == "a":
                node.getparent().set("class", "guide-cta")
            node.drop_tag()
        elif tag not in ALLOWED_TAGS:
            node.drop_tag()

    for figure in list(fragment.xpath('.//figure[@data-ke-type="opengraph"]')):
        link = figure.xpath(".//a[@href][1]")
        if not link:
            figure.drop_tree()
            continue
        href = rewrite_internal_url(link[0].get("href") or "", canonical_by_legacy_path)
        if not href:
            figure.drop_tree()
            continue
        title = normalize_text(figure.get("data-og-title") or "") or normalize_text(link[0].text_content())
        description = normalize_text(figure.get("data-og-description") or "")
        card = etree.Element("aside", {"class": "guide-reference-card"})
        anchor = etree.SubElement(card, "a", {"href": href})
        strong = etree.SubElement(anchor, "strong")
        strong.text = title or href
        if description:
            summary = etree.SubElement(anchor, "span")
            summary.text = description
        figure.getparent().replace(figure, card)

    images: list[dict[str, Any]] = []
    for index, image in enumerate(fragment.xpath(".//img[@src]"), start=1):
        original = image.get("src") or ""
        local = image_manifest.get(original)
        if not local:
            image.drop_tree()
            continue
        preceding_headings = image.xpath("preceding::h2[1] | preceding::h3[1]")
        context = normalize_text(preceding_headings[-1].text_content()) if preceding_headings else source.title
        alt = normalize_text(image.get("alt") or image.get("data-filename") or "")
        if not alt:
            alt = f"{context} 참고 이미지 {index}"
        image.attrib.clear()
        image.set("src", local["src"])
        image.set("alt", alt)
        image.set("width", str(local["width"]))
        image.set("height", str(local["height"]))
        image.set("loading", "lazy")
        image.set("decoding", "async")
        images.append({**local, "alt": alt})

    for figure in fragment.xpath(".//figure"):
        figure.attrib.clear()
        figure.set("class", "guide-figure")
    for table in fragment.xpath(".//table"):
        table.attrib.clear()
        table.set("class", "guide-table")
    for quote in fragment.xpath(".//blockquote"):
        quote.attrib.clear()
        quote.set("class", "guide-quote")

    for anchor in fragment.xpath(".//a"):
        href = anchor.get("href") or ""
        href = rewrite_internal_url(href, canonical_by_legacy_path)
        keep_class = anchor.get("class") if anchor.get("class") in {"guide-cta"} else None
        anchor.attrib.clear()
        href = href.strip()
        if not href or any(ord(character) < 32 for character in href):
            anchor.drop_tag()
            continue
        parsed = urlparse(href)
        is_allowed_relative = href.startswith(("/", "#"))
        if parsed.scheme.lower() not in {"http", "https", "mailto", "tel"} and not is_allowed_relative:
            anchor.drop_tag()
            continue
        anchor.set("href", href)
        if keep_class:
            anchor.set("class", keep_class)
        if parsed.scheme in {"http", "https"} or parsed.netloc:
            anchor.set("target", "_blank")
            rel = ["noopener", "noreferrer"]
            if parsed.netloc.lower() in AFFILIATE_HOSTS:
                rel.extend(["nofollow", "sponsored"])
            anchor.set("rel", " ".join(rel))

    allowed_attributes = {
        "a": {"class", "href", "rel", "target"},
        "aside": {"class"},
        "figure": {"class"},
        "img": {"alt", "decoding", "fetchpriority", "height", "loading", "src", "width"},
        "table": {"class"},
        "blockquote": {"class"},
        "td": {"colspan", "rowspan"},
        "th": {"colspan", "rowspan", "scope"},
        "h2": {"id"},
        "h3": {"id"},
        "h4": {"id"},
    }
    for node in fragment.iterdescendants():
        if not isinstance(node.tag, str):
            continue
        keep = allowed_attributes.get(node.tag.lower(), set())
        for attribute in list(node.attrib):
            if attribute not in keep:
                del node.attrib[attribute]

    headings: list[dict[str, str]] = []
    for index, heading in enumerate(fragment.xpath(".//h2 | .//h3"), start=1):
        label = normalize_text(heading.text_content())
        if not label:
            heading.drop_tree()
            continue
        heading_id = f"section-{index}"
        heading.set("id", heading_id)
        headings.append({"id": heading_id, "label": label, "level": heading.tag.lower()})

    for paragraph in list(fragment.xpath(".//p")):
        has_direct_block = bool(paragraph.xpath("./figure | ./aside | ./table | ./div"))
        has_text_around_blocks = bool(normalize_text(paragraph.text or "")) or any(
            normalize_text(child.tail or "") for child in paragraph
        )
        if has_direct_block and not has_text_around_blocks:
            paragraph.drop_tag()
            continue
        has_media = bool(paragraph.xpath(".//img | .//figure | .//a | .//br"))
        if not has_media and not normalize_text(paragraph.text_content().replace("\xa0", " ")):
            paragraph.drop_tree()
    for container in list(fragment.xpath(".//div | .//span")):
        container_text = normalize_text("".join(container.itertext()))
        if not container.attrib and not container_text and len(container) == 0:
            container.drop_tree()

    excerpt = clean_excerpt(fragment, metadata.get("description", ""))
    inner_html = (fragment.text or "") + "".join(
        html.tostring(child, encoding="unicode", method="html") for child in fragment
    )
    return inner_html.strip(), excerpt, headings, images


def path_from_slug(slug: str) -> str:
    return f"/entry/{slug.strip('/')}"


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    articles, _ = load_source_articles()
    metadata_by_url: dict[str, dict[str, str]] = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(page_metadata, article): article.source_url for article in articles}
        for future in as_completed(futures):
            metadata_by_url[futures[future]] = future.result()

    image_manifest = build_image_manifest(articles)
    canonical_by_legacy_path = {
        path_from_slug(article.legacy_slug): path_from_slug(article.legacy_slug)
        for article in articles
    }

    user_aliases = {title_slug(title) for title in PRIORITY_TITLES}
    migrated: list[dict[str, Any]] = []
    index_rows: list[dict[str, Any]] = []
    redirect_map: dict[str, str] = {}
    source_alias_owners: dict[str, str] = {}

    for source in articles:
        metadata = metadata_by_url[source.source_url]
        canonical_slug = source.legacy_slug
        canonical_path = path_from_slug(canonical_slug)
        aliases = {title_slug(source.title)}
        for alias in user_aliases:
            normalized_alias = re.sub(r"[(),]", "", alias)
            normalized_title = re.sub(r"[(),]", "", title_slug(source.title))
            if normalized_alias.replace("-서비스-", "-") == normalized_title.replace("-서비스-", "-"):
                aliases.add(alias)
        aliases.discard(canonical_slug)

        for alias in sorted(aliases):
            alias_path = path_from_slug(alias)
            existing_owner = source_alias_owners.get(alias_path)
            if existing_owner and existing_owner != canonical_path:
                raise RuntimeError(f"Alias collision for {alias_path}: {existing_owner} and {canonical_path}")
            source_alias_owners[alias_path] = canonical_path
            redirect_map[alias_path] = canonical_path
        redirect_map[f"/m/entry/{canonical_slug}"] = canonical_path

        content_html, excerpt, headings, images = sanitize_article(
            source,
            metadata,
            image_manifest,
            canonical_by_legacy_path,
        )
        category = infer_category(source.title)
        article = {
            "slug": canonical_slug,
            "aliases": sorted(aliases),
            "title": source.title,
            "description": excerpt,
            "category": category,
            "author": metadata["author"],
            "publishedAt": metadata["publishedAt"],
            "modifiedAt": metadata["modifiedAt"],
            "migratedAt": MIGRATED_AT,
            "originalUrl": source.source_url,
            "heroImage": images[0] if images else None,
            "images": images,
            "headings": headings,
            "contentHtml": content_html,
            "characterCount": len(normalize_text(html.fragment_fromstring(content_html, create_parent="div").text_content())),
        }
        migrated.append(article)
        index_rows.append({key: article[key] for key in (
            "slug",
            "aliases",
            "title",
            "description",
            "category",
            "author",
            "publishedAt",
            "modifiedAt",
            "migratedAt",
            "originalUrl",
            "heroImage",
            "characterCount",
        )})

    migrated.sort(key=lambda item: item["publishedAt"], reverse=True)
    index_rows.sort(key=lambda item: item["publishedAt"], reverse=True)
    if len(migrated) != 45:
        raise RuntimeError(f"Expected the verified 45 public posts, generated {len(migrated)}")
    required_titles = set(PRIORITY_TITLES[:8] + [PRIORITY_TITLES[8]])
    existing_titles = {article["title"] for article in migrated}
    missing_priority = sorted(required_titles - existing_titles)
    if missing_priority:
        raise RuntimeError(f"Priority posts missing after import: {missing_priority}")

    write_json(DATA_DIR / "guideArticles.json", migrated)
    write_json(DATA_DIR / "guideIndex.json", index_rows)
    write_json(
        PUBLIC_GUIDES / "migration-manifest.json",
        {
            "source": SOURCE_ORIGIN,
            "importedAt": MIGRATED_AT,
            "articleCount": len(migrated),
            "imageCount": len(image_manifest),
            "redirectCount": len(redirect_map),
        },
    )
    print(
        json.dumps(
            {
                "articles": len(migrated),
                "images": len(image_manifest),
                "redirects": len(redirect_map),
                "characters": sum(article["characterCount"] for article in migrated),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
