#!/usr/bin/env python3
"""Refresh the public Naver archive without copying post bodies or images.

Usage: python scripts/import-naver.py
       python scripts/import-naver.py --use-cache --cache-dir /tmp/living-archive-naver

Only unauthenticated, public listing pages and public post metadata are used.
RSS is intentionally not the enumeration source: Naver limits it to 50 items.
Requests use curl's existing HTTPS proxy and normal TLS certificate validation.
No dependencies, credentials, or changes to original posts are required.
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
from urllib.parse import urlencode, unquote_plus


BLOG_ID = "gksdl0311"
PAGE_SIZE = 30
PROJECT = Path(__file__).resolve().parents[1]

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
        return source_id, json.dumps({"excerpt": excerpt, "category": category}, ensure_ascii=False), None
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
    args = argument_parser.parse_args()
    if not 1 <= args.workers <= 6:
        argument_parser.error("--workers must be between 1 and 6")
    args.cache_dir.mkdir(parents=True, exist_ok=True)

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
    articles = []
    for index, post in enumerate(public):
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
    serialized = json.dumps(articles, ensure_ascii=False, indent=2)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "/** Public Naver publication metadata. Refresh with scripts/import-naver.py.\n"
        " * Original Korean text is preserved; full posts and photos remain on Naver.\n"
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
    }
    (args.cache_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()
