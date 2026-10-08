#!/usr/bin/env python3
"""Refresh public Substack article metadata without scraping bodies or images.

Uses Substack's public archive and RSS feed over verified HTTPS. Existing Korean
translations are preserved. No files change if collection or metadata validation
fails. Run from the checkout: python scripts/import-substack.py
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

PUBLICATION = "https://thebusinessbehindit.substack.com"
REQUESTED_SLUGS = (
    "why-im-writing-the-business-behind",
    "amazon-prime-day-doesnt-sell-deals",
    "duolingo-didnt-win-just-by-teaching",
    "the-world-cup-is-no-longer-a-90-minute",
    "costco-makes-billions-before-you",
    "the-world-cup-doesnt-sell-ad-space",
    "fifa-doesnt-sell-football-it-sells",
    "ryanair-doesnt-sell-cheap-flights",
    "netflix-didnt-win-by-making-great",
    "people-hate-fifa-they-still-love",
)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/content/substack.ts"


class PlainText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def plain_text(value: str) -> str:
    parser = PlainText()
    parser.feed(value)
    return re.sub(r"\s+", " ", unescape(" ".join(parser.parts))).strip()


def fetch(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "The-Living-Archive/1.0 (public article metadata import)"})
    with urlopen(request, timeout=35) as response:
        return response.read()


def collect() -> dict:
    """Paginate the public archive; the RSS feed supplies verified excerpts."""
    feed_url = f"{PUBLICATION}/feed"
    feed = ET.fromstring(fetch(feed_url))
    rss_posts = {}
    for item in feed.findall("./channel/item"):
        url = item.findtext("link", "")
        slug = urlparse(url).path.removeprefix("/p/").strip("/")
        if not slug or not url.startswith(f"{PUBLICATION}/p/"):
            continue
        date = item.findtext("pubDate", "")
        rss_posts[slug] = {
            "title": item.findtext("title", ""),
            "date": parsedate_to_datetime(date).astimezone(timezone.utc).isoformat(),
            "excerpt": plain_text(item.findtext("description", "")),
        }

    posts: dict[str, dict] = {}
    sources = [feed_url]
    offset = 0
    while True:
        url = f"{PUBLICATION}/api/v1/archive?sort=new&offset={offset}&limit=20"
        page = json.loads(fetch(url))
        if not isinstance(page, list):
            raise ValueError("Public archive returned an unexpected format")
        sources.append(url)
        if not page:
            break
        new_count = 0
        for post in page:
            slug = post.get("slug")
            if not slug or post.get("type") not in (None, "newsletter"):
                continue
            if slug in posts:
                continue
            rss = rss_posts.get(slug, {})
            title = post.get("title") or rss.get("title")
            date = post.get("post_date") or rss.get("date")
            excerpt = post.get("subtitle") or post.get("description") or rss.get("excerpt")
            if not title or not date:
                raise ValueError(f"Missing verified title or date for {slug}")
            posts[slug] = {
                "slug": slug,
                "title": plain_text(title),
                "date": datetime.fromisoformat(date.replace("Z", "+00:00")).date().isoformat(),
                "excerpt": plain_text(excerpt or ""),
                "url": f"{PUBLICATION}/p/{slug}",
            }
            new_count += 1
        if not new_count:
            raise ValueError("Archive pagination repeated a page; collection is incomplete")
        offset += len(page)
        if offset > 10000:
            raise ValueError("Unexpectedly large archive; review pagination before writing")
    missing = sorted(set(REQUESTED_SLUGS) - posts.keys())
    if missing:
        raise ValueError("Requested posts absent from public archive: " + ", ".join(missing))
    return {
        "publication": PUBLICATION,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "posts": sorted(posts.values(), key=lambda post: (post["date"], post["slug"])),
    }


def existing_translations() -> dict:
    if not OUTPUT.exists():
        return {}
    text = OUTPUT.read_text(encoding="utf-8")
    match = re.search(r"export const substackArticles: Article\[\] = (\[.*\])\s*;?\s*$", text, re.S)
    if not match:
        raise ValueError("Cannot preserve translations: existing content is not generated JSON")
    return {post["sourceId"]: post.get("translations", {}) for post in json.loads(match.group(1))}


def write(snapshot: dict) -> None:
    posts = snapshot.get("posts", [])
    if not posts:
        raise ValueError("Empty inventory; refusing to replace existing article content")
    slugs = [post["slug"] for post in posts]
    if len(slugs) != len(set(slugs)) or set(REQUESTED_SLUGS) - set(slugs):
        raise ValueError("Source inventory is incomplete or contains duplicate slugs")
    translations = existing_translations()
    articles = []
    for index, post in enumerate(sorted(posts, key=lambda item: (item["date"], item["slug"])), 1):
        slug = post["slug"]
        if not post.get("title") or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", post.get("date", "")):
            raise ValueError(f"Missing verified title or date for {slug}")
        article = {
            "id": f"substack-{slug}",
            "number": f"S—{index:03}",
            "sourceId": slug,
            "title": post["title"],
            "date": post["date"],
            "category": "Essays" if slug == REQUESTED_SLUGS[0] else "Business & Brands",
            "excerpt": post.get("excerpt", ""),
            "platform": "Substack · The Business Behind It",
            "externalUrl": f"{PUBLICATION}/p/{slug}",
            "language": "en",
            "originalLanguage": "en",
        }
        if translations.get(slug):
            article["translations"] = translations[slug]
        articles.append(article)
    analyses = [article for article in articles if article["category"] == "Business & Brands"]
    if analyses:
        analyses[-1]["featured"] = True
    articles.reverse()
    output = (
        "/** Public article metadata from The Business Behind It.\n"
        f" * Verified against the public RSS feed and archive on {snapshot['fetchedAt']}.\n"
        " * Article bodies and imagery remain at their original canonical URLs.\n"
        " * Refresh with scripts/import-substack.py; authored translations are preserved.\n"
        " */\nimport type { Article } from './archive'\n\n"
        "export const substackArticles: Article[] = "
        + json.dumps(articles, ensure_ascii=False, indent=2)
        + "\n"
    )
    OUTPUT.write_text(output, encoding="utf-8")
    extras = sorted(set(slugs) - set(REQUESTED_SLUGS))
    print(f"Imported {len(articles)} verified articles; {len(extras)} beyond the ten supplied links.")
    if extras:
        print("Additional published articles: " + ", ".join(extras))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", type=Path, help="Use a previously verified JSON inventory")
    parser.add_argument("--save-snapshot", type=Path, help="Save public metadata provenance for offline refresh")
    parser.add_argument("--collect-only", action="store_true", help="Fetch inventory without replacing article content")
    args = parser.parse_args()
    try:
        snapshot = json.loads(args.snapshot.read_text(encoding="utf-8")) if args.snapshot else collect()
        if args.save_snapshot:
            args.save_snapshot.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if not args.collect_only:
            write(snapshot)
        else:
            print(f"Collected {len(snapshot['posts'])} public articles.")
    except (HTTPError, URLError, ValueError, ET.ParseError, OSError) as error:
        print(f"Substack import stopped without changing article content: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
