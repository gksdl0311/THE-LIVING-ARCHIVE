#!/usr/bin/env python3
"""Refresh public Naver metadata and representative source thumbnails.

Usage: python scripts/import-naver.py
       python scripts/import-naver.py --use-cache --cache-dir /tmp/living-archive-naver
       python scripts/import-naver.py --thumbnails-only --use-cache

Only unauthenticated, public listing pages and public post metadata are used.
RSS is intentionally not the enumeration source: Naver limits it to 50 items.
Requests use curl's existing HTTPS proxy and normal TLS certificate validation.
Thumbnails retain the exact cover URL and sizing supplied by Naver. Post bodies are
never copied into the archive. No credentials or changes to posts are required.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import html
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import subprocess
from urllib.parse import urlencode, unquote_plus, urlsplit


BLOG_ID = "gksdl0311"
PAGE_SIZE = 30
PROJECT = Path(__file__).resolve().parents[1]
THUMBNAIL_HOSTS = {"blogthumb.pstatic.net", "mblogthumb-phinf.pstatic.net", "postfiles.pstatic.net"}
THUMBNAIL_FIELDS = {"thumbnail", "thumbnailSourceUrl", "thumbnailAlt"}

# Broad reading filters come from the original, independently checked categories.
# The exact Korean category is also retained in each article's tags.
CATEGORY_FILTERS = {
    "1": "Personal Reflections",
    "7": "Travel & Culture",
    "9": "Travel & Culture",
    "11": "Personal Reflections",
    "12": "Personal Reflections",
    "13": "Travel & Culture",
    "14": "Travel & Culture",
    "15": "Travel & Culture",
    "17": "Travel & Culture",
    "19": "Travel & Culture",
    "21": "Travel & Culture",
    "23": "Language Learning",
    "24": "Language Learning",
    "25": "Language Learning",
    "26": "Marketing & Communications",
    "27": "Marketing & Communications",
    "31": "Travel & Culture",
    "34": "Personal Reflections",
    "38": "Marketing & Communications",
    "39": "Travel & Culture",
    "40": "Personal Reflections",
    "41": "Technology",
    "42": "Business Analysis",
}


def clean(text: str) -> str:
    return " ".join(html.unescape(text).split())


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.category: list[str] = []
        self.category_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "meta":
            key = attributes.get("property") or attributes.get("name")
            if key and attributes.get("content"):
                self.meta[key] = clean(attributes["content"] or "")
        if self.category_depth:
            self.category_depth += 1
        elif tag == "div" and "blog_category" in (attributes.get("class") or "").split():
            self.category_depth = 1

    def handle_endtag(self, tag: str) -> None:
        if self.category_depth:
            self.category_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.category_depth:
            self.category.append(data)


def fetch(url: str, destination: Path, use_cache: bool) -> str:
    if not use_cache or not destination.exists():
        temporary = destination.with_suffix(destination.suffix + ".download")
        completed = subprocess.run(
            ["curl", "--fail", "--silent", "--show-error", "--max-time", "45",
             "--retry", "1", "--retry-delay", "1", url, "--output", str(temporary)],
            capture_output=True, text=True, check=False,
        )
        if completed.returncode:
            temporary.unlink(missing_ok=True)
            raise RuntimeError(f"Public fetch failed: {url}: {completed.stderr.strip()}")
        temporary.replace(destination)
    return destination.read_text(encoding="utf-8")


def listing(page: int, cache: Path, use_cache: bool) -> dict:
    query = urlencode({
        "blogId": BLOG_ID, "viewdate": "", "currentPage": page,
        "categoryNo": 0, "parentCategoryNo": 0, "countPerPage": PAGE_SIZE,
    })
    text = fetch(f"https://blog.naver.com/PostTitleListAsync.naver?{query}",
                 cache / f"titles-{page}.json", use_cache)
    # Naver returns escaped apostrophes inside its pagingHtml string, which are
    # legal JavaScript string escapes but not JSON escapes. Change only those.
    result = json.loads(text.replace("\\'", "'"))
    if result.get("resultCode") != "S":
        raise RuntimeError(f"Naver listing page {page} did not report success")
    return result


def original_date(text: str) -> str:
    parts = re.fullmatch(r"\s*(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*", text)
    if not parts:
        raise ValueError(f"Unrecognized publication date: {text!r}")
    return date(*(int(part) for part in parts.groups())).isoformat()


def source_thumbnail(url: str) -> str:
    """Keep representative post images, never Naver branding/profile fallbacks."""
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in THUMBNAIL_HOSTS:
        return ""
    if not parsed.path or any(part in parsed.path.lower() for part in ("/static/", "/profile/", "/blogprofile/")):
        return ""
    return url


def image_extension(data: bytes) -> str:
    # Check binary signatures rather than trusting a 200 response or extension;
    # error/login HTML must never become a published thumbnail.
    if data.startswith(b"\xff\xd8\xff") and data.endswith(b"\xff\xd9"):
        return "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n") and b"IEND" in data[-12:]:
        return "png"
    if data.startswith((b"GIF87a", b"GIF89a")) and data.endswith(b";"):
        return "gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "webp"
    raise ValueError("Thumbnail response is not a complete supported image")


def download_thumbnail(source_id: str, url: str, directory: Path, use_cache: bool) -> str:
    if use_cache:
        for existing in directory.glob(f"{source_id}.*"):
            if existing.suffix in {".jpg", ".png", ".gif", ".webp"}:
                if image_extension(existing.read_bytes()) == existing.suffix[1:]:
                    return f"/naver/{existing.name}"
    temporary = directory / f"{source_id}.download"
    completed = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--max-time", "45",
         "--max-filesize", "10000000", "--retry", "1", "--retry-delay", "1",
         url, "--output", str(temporary)],
        capture_output=True, text=True, check=False,
    )
    if completed.returncode:
        temporary.unlink(missing_ok=True)
        raise RuntimeError(completed.stderr.strip())
    try:
        extension = image_extension(temporary.read_bytes())
        # Pillow is optional and used only to validate downloaded bytes.
        # The original publication's cover URL and sizing are preserved.
        try:
            from PIL import Image
        except ImportError:
            Image = None
        if Image:
            with Image.open(temporary) as image:
                image.verify()
        destination = directory / f"{source_id}.{extension}"
        temporary.replace(destination)
        # A changed cover can also change its image format. Keep one verified
        # derivative per post so later cache reads cannot pick an old format.
        for previous in directory.glob(f"{source_id}.*"):
            if previous != destination and previous.suffix in {".jpg", ".png", ".gif", ".webp"}:
                previous.unlink()
        return f"/naver/{destination.name}"
    except (ValueError, OSError):
        temporary.unlink(missing_ok=True)
        raise


def post_metadata(post: dict, cache: Path, use_cache: bool) -> tuple[str, str, str | None]:
    source_id = post["logNo"]
    try:
        text = fetch(f"https://m.blog.naver.com/{BLOG_ID}/{source_id}",
                     cache / f"post-{source_id}.html", use_cache)
        parser = MetadataParser()
        parser.feed(text)
        # Do not accidentally import the description of a sign-in/error page.
        if parser.meta.get("og:title") != clean(unquote_plus(post["title"])):
            return source_id, "", "Post metadata title does not match the public listing"
        excerpt = parser.meta.get("og:description", "")
        category = clean(" ".join(parser.category))
        return source_id, json.dumps({
            "excerpt": excerpt, "category": category,
            "thumbnailSourceUrl": source_thumbnail(parser.meta.get("og:image", "")),
        }, ensure_ascii=False), None
    except (RuntimeError, ValueError) as error:
        # An unavailable excerpt must remain empty; the verified public listing
        # still supplies the title, date and canonical link.
        return source_id, "", str(error)


def main() -> None:
    argument_parser = argparse.ArgumentParser(description=__doc__)
    argument_parser.add_argument("--cache-dir", type=Path, default=Path("/tmp/living-archive-naver"))
    argument_parser.add_argument("--use-cache", action="store_true", help="Reuse already downloaded public responses")
    argument_parser.add_argument("--workers", type=int, default=3)
    argument_parser.add_argument("--output", type=Path, default=PROJECT / "src/content/naver.ts")
    argument_parser.add_argument("--thumbnails-only", action="store_true",
                                 help="Preserve every existing record and refresh only its thumbnail fields")
    argument_parser.add_argument("--metadata-only", action="store_true",
                                 help="Collect verified source thumbnail URLs without downloading images")
    argument_parser.add_argument("--thumbnail-dir", type=Path, default=PROJECT / "public/naver")
    args = argument_parser.parse_args()
    if not 1 <= args.workers <= 6:
        argument_parser.error("--workers must be between 1 and 6")
    args.cache_dir.mkdir(parents=True, exist_ok=True)

    if args.thumbnails_only:
        prefix = "export const naverArticles: Article[] = "
        existing = json.loads(args.output.read_text(encoding="utf-8").split(prefix, 1)[1])
        public = [{"logNo": article["sourceId"], "title": article["title"]} for article in existing]
        # Source titles are already decoded; quote them for the shared listing
        # metadata matcher, which decodes Naver's encoded listing titles.
        from urllib.parse import quote_plus
        for post in public:
            post["title"] = quote_plus(post["title"])
        total = len(public)
        page_count = 0
        by_id = {post["logNo"]: post for post in public}
        listed = public
    else:
        existing = []

        first = listing(1, args.cache_dir, args.use_cache)
        total = int(first["totalCount"])
        page_count = math.ceil(total / PAGE_SIZE)
        pages = {1: first}
        with ThreadPoolExecutor(max_workers=args.workers) as executor:
            futures = {executor.submit(listing, page, args.cache_dir, args.use_cache): page
                       for page in range(2, page_count + 1)}
            for future in as_completed(futures):
                pages[futures[future]] = future.result()
        if any(int(page["totalCount"]) != total for page in pages.values()):
            raise RuntimeError("Naver post count changed during enumeration; refresh before importing")
        listed = [post for page in sorted(pages) for post in pages[page]["postList"]]
        by_id = {post["logNo"]: post for post in listed}
        if len(by_id) != total or len(listed) != total:
            raise RuntimeError(f"Incomplete or repeated pagination: expected {total}, found {len(by_id)} unique")
        public = [post for post in listed if str(post.get("openType")) == "2"
                  and str(post.get("isPostNotOpen", "0")) == "0"
                  and str(post.get("isPostBlocked", "0")) == "0"
                  and str(post.get("isBlockTmpForced", "0")) == "0"]
    previous_thumbnail_sources = {
        article["sourceId"]: article.get("thumbnailSourceUrl") for article in existing
    }
    if args.use_cache and not args.thumbnails_only and args.output.is_file():
        prefix = "export const naverArticles: Article[] = "
        previous_articles = json.loads(args.output.read_text(encoding="utf-8").split(prefix, 1)[1])
        previous_thumbnail_sources = {
            article["sourceId"]: article.get("thumbnailSourceUrl") for article in previous_articles
        }
    if args.thumbnails_only:
        print(f"Refreshing representative image metadata for {len(public)} existing public posts.", flush=True)
    else:
        print(f"Enumerated {len(public)} public posts across {page_count} pages; "
              f"{len(listed) - len(public)} nonpublic/blocked entries excluded.", flush=True)

    metadata = {}
    unavailable = {}
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(post_metadata, post, args.cache_dir, args.use_cache) for post in public]
        for completed_count, future in enumerate(as_completed(futures), start=1):
            source_id, value, error = future.result()
            metadata[source_id] = json.loads(value) if value else {}
            if error:
                unavailable[source_id] = error
            if completed_count % 50 == 0 or completed_count == len(public):
                print(f"Checked public metadata {completed_count}/{len(public)}", flush=True)

    # Ascending numbers make the current archive read chronologically; stable
    # source IDs are used for routing and deduplication throughout the website.
    articles = existing
    for index, post in enumerate(public if not args.thumbnails_only else []):
        source_id = post["logNo"]
        detail = metadata[source_id]
        article = {
            "id": f"naver-{source_id}", "number": f"N—{len(public) - index:03d}",
            "title": clean(unquote_plus(post["title"])),
            "date": original_date(post["addDate"]),
            "category": CATEGORY_FILTERS.get(post["categoryNo"], "Personal Reflections"),
            "excerpt": detail.get("excerpt", ""), "platform": "Naver Blog",
            "externalUrl": f"https://blog.naver.com/{BLOG_ID}/{source_id}",
            "language": "ko", "originalLanguage": "ko", "sourceId": source_id,
        }
        if detail.get("category"):
            article["tags"] = [detail["category"]]
        articles.append(article)
    args.thumbnail_dir.mkdir(parents=True, exist_ok=True)
    thumbnail_errors = {}
    thumbnail_results = {}
    if not args.metadata_only:
        with ThreadPoolExecutor(max_workers=args.workers) as executor:
            futures = {executor.submit(download_thumbnail, article["sourceId"],
                                       metadata[article["sourceId"]]["thumbnailSourceUrl"],
                                       args.thumbnail_dir,
                                       args.use_cache and previous_thumbnail_sources.get(article["sourceId"])
                                       == metadata[article["sourceId"]]["thumbnailSourceUrl"]): article["sourceId"]
                       for article in articles if metadata[article["sourceId"]].get("thumbnailSourceUrl")}
            for completed_count, future in enumerate(as_completed(futures), start=1):
                source_id = futures[future]
                try:
                    thumbnail_results[source_id] = future.result()
                except (RuntimeError, ValueError, OSError) as error:
                    thumbnail_errors[source_id] = str(error)
                if completed_count % 50 == 0 or completed_count == len(futures):
                    print(f"Checked source thumbnails {completed_count}/{len(futures)}", flush=True)
    for article in articles:
        source_id = article["sourceId"]
        url = metadata[source_id].get("thumbnailSourceUrl")
        if source_id in unavailable:
            # A temporary metadata failure does not erase a previously
            # verified image or alter any existing title/date/excerpt.
            continue
        previous = str(article.get("thumbnail", ""))
        keep_local = (args.metadata_only and article.get("thumbnailSourceUrl") == url
                      and previous.startswith("/naver/")
                      and (args.thumbnail_dir / Path(previous).name).is_file())
        for field in THUMBNAIL_FIELDS:
            article.pop(field, None)
        if url:
            article["thumbnailSourceUrl"] = url
            article["thumbnailAlt"] = article["title"]
            article["thumbnail"] = (previous if keep_local
                                    else thumbnail_results.get(source_id, url))
    serialized = json.dumps(articles, ensure_ascii=False, indent=2)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "/** Public Naver publication metadata. Refresh with scripts/import-naver.py.\n"
        " * Original Korean text is preserved; complete posts remain on Naver.\n"
        " * Thumbnails are verified representative images from each source post.\n"
        " * Enumeration uses every public listing page, not the 50-item RSS feed.\n */\n"
        "import type { Article } from './archive'\n\n"
        f"export const naverArticles: Article[] = {serialized}\n", encoding="utf-8",
    )
    report = {
        "sourceTotal": total, "pages": page_count, "importedPublicPosts": len(articles),
        "excludedNonpublicOrBlocked": len(listed) - len(public), "uniqueIds": len(by_id),
        "oldestDate": min(article["date"] for article in articles),
        "newestDate": max(article["date"] for article in articles),
        "availableExcerpts": sum(bool(article["excerpt"]) for article in articles),
        "unavailableMetadata": unavailable,
        "representativeThumbnails": sum(bool(article.get("thumbnailSourceUrl")) for article in articles),
        "localThumbnails": sum(str(article.get("thumbnail", "")).startswith("/naver/") for article in articles),
        "imageDownloadsAttempted": not args.metadata_only,
        "postsWithoutRepresentativeImage": [article["sourceId"] for article in articles
                                              if not article.get("thumbnailSourceUrl")],
        "unavailableImageDownloads": thumbnail_errors,
    }
    (args.cache_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()
