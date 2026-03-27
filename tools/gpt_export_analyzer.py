#!/usr/bin/env python3
"""Analyze ChatGPT export conversations.json and generate a summary report."""

from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "to",
    "of",
    "for",
    "in",
    "on",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "this",
    "that",
    "it",
    "as",
    "at",
    "by",
    "from",
    "i",
    "you",
    "we",
    "they",
    "he",
    "she",
    "my",
    "your",
    "our",
    "their",
    "的",
    "了",
    "和",
    "是",
    "在",
    "我",
    "你",
    "他",
    "她",
    "它",
    "我们",
    "你们",
    "他们",
    "这",
    "那",
    "一个",
    "可以",
    "请",
    "帮我",
    "一下",
}


@dataclass
class Message:
    role: str
    text: str
    create_time: float | None
    model: str | None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="分析 ChatGPT 导出的 conversations.json，输出可读统计报告。"
    )
    parser.add_argument("input", type=Path, help="conversations.json 文件路径")
    parser.add_argument(
        "--top-n", type=int, default=15, help="关键词、模型等排行榜长度（默认: 15）"
    )
    parser.add_argument(
        "--output-json", type=Path, default=None, help="将完整统计结果写入 JSON 文件"
    )
    parser.add_argument(
        "--output-md", type=Path, default=None, help="将摘要写入 Markdown 文件"
    )
    return parser.parse_args()


def load_conversations(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"输入文件不存在: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("conversations.json 格式错误：顶层应为列表")
    return data


def extract_text(content: Any) -> str:
    if not isinstance(content, dict):
        return ""
    parts = content.get("parts")
    if isinstance(parts, list):
        normalized = [p for p in parts if isinstance(p, str)]
        return "\n".join(normalized).strip()

    text = content.get("text")
    if isinstance(text, str):
        return text.strip()
    return ""


def parse_messages(conversation: dict[str, Any]) -> list[Message]:
    mapping = conversation.get("mapping")
    if not isinstance(mapping, dict):
        return []

    messages: list[Message] = []
    for node in mapping.values():
        if not isinstance(node, dict):
            continue
        message = node.get("message")
        if not isinstance(message, dict):
            continue

        author = message.get("author")
        role = "unknown"
        if isinstance(author, dict) and isinstance(author.get("role"), str):
            role = author["role"]

        content = extract_text(message.get("content"))
        if not content:
            continue

        create_time = message.get("create_time")
        create_time_val = float(create_time) if isinstance(create_time, (int, float)) else None

        metadata = message.get("metadata")
        model = None
        if isinstance(metadata, dict):
            candidate = metadata.get("model_slug") or metadata.get("default_model_slug")
            if isinstance(candidate, str) and candidate:
                model = candidate

        messages.append(
            Message(role=role, text=content, create_time=create_time_val, model=model)
        )

    messages.sort(key=lambda m: (math.inf if m.create_time is None else m.create_time))
    return messages


def unix_to_date(ts: float | None) -> str | None:
    if ts is None:
        return None
    try:
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    except (OSError, OverflowError, ValueError):
        return None
    return dt.date().isoformat()


def tokenize(text: str) -> list[str]:
    # 英文按单词切分，中文按连续汉字切分
    tokens = re.findall(r"[A-Za-z][A-Za-z0-9_\-]{1,}|[\u4e00-\u9fff]{2,}", text.lower())
    return [token for token in tokens if token not in STOPWORDS]


def analyze(conversations: list[dict[str, Any]], top_n: int = 15) -> dict[str, Any]:
    role_counter: Counter[str] = Counter()
    model_counter: Counter[str] = Counter()
    keyword_counter: Counter[str] = Counter()
    daily_counter: Counter[str] = Counter()

    per_conversation_stats: list[dict[str, Any]] = []

    all_timestamps: list[float] = []
    total_chars = 0
    total_messages = 0

    for conv in conversations:
        title = conv.get("title") if isinstance(conv.get("title"), str) else "(无标题)"
        messages = parse_messages(conv)
        if not messages:
            continue

        total_messages += len(messages)
        conv_chars = 0

        conv_first = None
        conv_last = None
        for msg in messages:
            role_counter[msg.role] += 1
            conv_chars += len(msg.text)
            total_chars += len(msg.text)

            if msg.model:
                model_counter[msg.model] += 1

            if msg.role == "user":
                keyword_counter.update(tokenize(msg.text))

            date = unix_to_date(msg.create_time)
            if date:
                daily_counter[date] += 1

            if msg.create_time is not None:
                all_timestamps.append(msg.create_time)
                if conv_first is None or msg.create_time < conv_first:
                    conv_first = msg.create_time
                if conv_last is None or msg.create_time > conv_last:
                    conv_last = msg.create_time

        per_conversation_stats.append(
            {
                "title": title,
                "messages": len(messages),
                "characters": conv_chars,
                "first_date": unix_to_date(conv_first),
                "last_date": unix_to_date(conv_last),
            }
        )

    per_conversation_stats.sort(key=lambda x: x["messages"], reverse=True)

    start_date = unix_to_date(min(all_timestamps)) if all_timestamps else None
    end_date = unix_to_date(max(all_timestamps)) if all_timestamps else None

    report = {
        "overview": {
            "total_conversations": len(per_conversation_stats),
            "total_messages": total_messages,
            "total_characters": total_chars,
            "avg_messages_per_conversation": round(
                total_messages / len(per_conversation_stats), 2
            )
            if per_conversation_stats
            else 0,
            "date_range": {"start": start_date, "end": end_date},
        },
        "by_role": role_counter.most_common(),
        "by_model": model_counter.most_common(top_n),
        "top_keywords": keyword_counter.most_common(top_n),
        "daily_activity": sorted(daily_counter.items(), key=lambda x: x[0]),
        "top_conversations_by_messages": per_conversation_stats[:top_n],
    }
    return report


def report_to_markdown(report: dict[str, Any]) -> str:
    overview = report["overview"]

    lines: list[str] = []
    lines.append("# ChatGPT 导出分析报告")
    lines.append("")
    lines.append("## 概览")
    lines.append(
        f"- 会话数: **{overview['total_conversations']}**；消息数: **{overview['total_messages']}**；字符数: **{overview['total_characters']}**"
    )
    lines.append(
        f"- 平均每个会话消息数: **{overview['avg_messages_per_conversation']}**"
    )
    lines.append(
        f"- 时间范围: **{overview['date_range']['start'] or 'N/A'} ~ {overview['date_range']['end'] or 'N/A'}**"
    )
    lines.append("")

    def append_table(title: str, headers: list[str], rows: list[list[Any]]) -> None:
        lines.append(f"## {title}")
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        for row in rows:
            lines.append("| " + " | ".join(str(c) for c in row) + " |")
        if not rows:
            lines.append("| N/A |")
        lines.append("")

    append_table("角色分布", ["角色", "消息数"], report["by_role"])
    append_table("模型分布（Top）", ["模型", "消息数"], report["by_model"])
    append_table("用户关键词（Top）", ["关键词", "频次"], report["top_keywords"])
    append_table("每日活跃度", ["日期", "消息数"], report["daily_activity"])

    conv_rows = [
        [
            c["title"],
            c["messages"],
            c["characters"],
            c["first_date"] or "N/A",
            c["last_date"] or "N/A",
        ]
        for c in report["top_conversations_by_messages"]
    ]
    append_table(
        "消息数最多会话（Top）",
        ["标题", "消息数", "字符数", "开始日期", "结束日期"],
        conv_rows,
    )

    return "\n".join(lines)


def main() -> None:
    args = parse_args()
    conversations = load_conversations(args.input)
    report = analyze(conversations, top_n=args.top_n)

    md = report_to_markdown(report)
    print(md)

    if args.output_json:
        args.output_json.write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    if args.output_md:
        args.output_md.write_text(md, encoding="utf-8")


if __name__ == "__main__":
    main()
