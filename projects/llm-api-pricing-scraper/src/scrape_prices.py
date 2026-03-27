#!/usr/bin/env python3
"""Scrape LLM API pricing information from major providers.

The script fetches official pricing pages and extracts token pricing lines
using regex-based heuristics. Results are exported to JSON for downstream use.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import requests
from bs4 import BeautifulSoup


@dataclass(frozen=True)
class Provider:
    name: str
    pricing_url: str
    model_pattern: re.Pattern[str]


PROVIDERS: list[Provider] = [
    Provider(
        name="openai",
        pricing_url="https://openai.com/api/pricing/",
        model_pattern=re.compile(
            r"(?P<model>gpt[\w\-\. ]+?)\s+"
            r"\$?(?P<input>\d+(?:\.\d+)?)\s*/\s*1M\s*input\s*tokens?.*?"
            r"\$?(?P<output>\d+(?:\.\d+)?)\s*/\s*1M\s*output\s*tokens?",
            re.IGNORECASE,
        ),
    ),
    Provider(
        name="anthropic",
        pricing_url="https://www.anthropic.com/pricing#api",
        model_pattern=re.compile(
            r"(?P<model>Claude\s*[\w\-\. ]+?)\s+"
            r"\$?(?P<input>\d+(?:\.\d+)?)\s*/\s*MTok\s*Input.*?"
            r"\$?(?P<output>\d+(?:\.\d+)?)\s*/\s*MTok\s*Output",
            re.IGNORECASE,
        ),
    ),
    Provider(
        name="google",
        pricing_url="https://ai.google.dev/gemini-api/docs/pricing",
        model_pattern=re.compile(
            r"(?P<model>Gemini\s*[\w\-\. ]+?)\s+"
            r"\$?(?P<input>\d+(?:\.\d+)?)\s*/\s*1M\s*input\s*tokens?.*?"
            r"\$?(?P<output>\d+(?:\.\d+)?)\s*/\s*1M\s*output\s*tokens?",
            re.IGNORECASE,
        ),
    ),
]


def fetch_page_text(url: str, timeout: int = 30) -> str:
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text(" ", strip=True)


def extract_prices(provider: Provider, text: str) -> list[dict[str, str | float]]:
    records: list[dict[str, str | float]] = []
    for match in provider.model_pattern.finditer(text):
        model = re.sub(r"\s+", " ", match.group("model")).strip(" :-")
        records.append(
            {
                "provider": provider.name,
                "model": model,
                "input_usd_per_1m_tokens": float(match.group("input")),
                "output_usd_per_1m_tokens": float(match.group("output")),
                "source": provider.pricing_url,
            }
        )

    # de-duplicate model rows while keeping stable order
    seen: set[tuple[str, float, float]] = set()
    deduped: list[dict[str, str | float]] = []
    for record in records:
        key = (
            str(record["model"]),
            float(record["input_usd_per_1m_tokens"]),
            float(record["output_usd_per_1m_tokens"]),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(record)

    return deduped


def scrape(providers: Iterable[Provider]) -> dict[str, object]:
    all_records: list[dict[str, str | float]] = []
    errors: list[dict[str, str]] = []

    for provider in providers:
        try:
            text = fetch_page_text(provider.pricing_url)
            rows = extract_prices(provider, text)
            if not rows:
                errors.append(
                    {
                        "provider": provider.name,
                        "url": provider.pricing_url,
                        "error": "No pricing rows matched current parser pattern.",
                    }
                )
            all_records.extend(rows)
        except Exception as exc:  # noqa: BLE001
            errors.append(
                {
                    "provider": provider.name,
                    "url": provider.pricing_url,
                    "error": str(exc),
                }
            )

    return {
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "record_count": len(all_records),
        "records": all_records,
        "errors": errors,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape major LLM API pricing pages.")
    parser.add_argument(
        "--output",
        default="projects/llm-api-pricing-scraper/data/prices.json",
        help="Output JSON path.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = scrape(PROVIDERS)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {payload['record_count']} records to {output_path}")
    if payload["errors"]:
        print(f"Encountered {len(payload['errors'])} provider-level issues. See JSON for details.")


if __name__ == "__main__":
    main()
