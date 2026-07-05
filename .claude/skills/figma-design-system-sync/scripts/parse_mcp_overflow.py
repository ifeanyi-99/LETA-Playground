#!/usr/bin/env python3
"""
Parse a figma-console MCP `figma_execute` overflow file and either print the
inner `.result` value or save it to disk.

The MCP saves large responses to a tool-results file when they exceed the inline
response cap. The file is a single-line JSON object shaped like:

    {"_mcp":"figma-console-mcp","success":true,"result":<your-payload>,"timestamp":...}

This script gives you the inner payload as plain JSON, optionally merging multiple
overflow files together (useful when paginating a large component set across two
calls).

Usage:
    parse_mcp_overflow.py <overflow.txt> [<overflow2.txt> ...] [--out <path>] [--key <key>]

Examples:
    # Single file → stdout
    parse_mcp_overflow.py /path/to/mcp-figma-console-figma_execute-12345.txt

    # Single file → disk
    parse_mcp_overflow.py /path/to/mcp-figma-console-figma_execute-12345.txt --out /tmp/scratch.json

    # Two halves of one large COMPONENT_SET, merged under their setId key
    parse_mcp_overflow.py half1.txt half2.txt --key data --out /tmp/desktop-button.json
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path


def load(path: Path) -> dict:
    with path.open() as f:
        return json.load(f)


def extract_payload(raw: dict) -> object:
    """Return the inner `.result` field, or raise if the MCP reports a failure."""
    if not raw.get("success", True):
        raise RuntimeError(f"MCP call failed: {raw.get('error') or raw}")
    return raw.get("result")


def merge(payloads: list, key: str | None) -> object:
    """
    Merge multiple payloads. If `key` is given, the values under each payload[key]
    are concatenated (lists) or shallow-merged (dicts). Otherwise we shallow-merge
    the top-level dicts.
    """
    if len(payloads) == 1:
        return payloads[0]

    if key:
        values = [p[key] for p in payloads]
        if all(isinstance(v, list) for v in values):
            merged: list = []
            for v in values:
                merged.extend(v)
            return {**payloads[0], key: merged}
        if all(isinstance(v, dict) for v in values):
            merged_d: dict = {}
            for v in values:
                merged_d.update(v)
            return {**payloads[0], key: merged_d}
        raise ValueError(f"can't merge {key}: values are not all the same shape")

    # Top-level dict merge
    if all(isinstance(p, dict) for p in payloads):
        out: dict = {}
        for p in payloads:
            out.update(p)
        return out
    raise ValueError("multiple payloads but no --key; payloads are not all dicts")


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("inputs", nargs="+", help="One or more figma_execute overflow .txt files")
    p.add_argument("--out", help="Write merged JSON here. If omitted, prints to stdout.")
    p.add_argument(
        "--key",
        help="When merging >1 files, merge the values under this key in each payload. "
             "Use for paginated chunks where each chunk has the same shape but different data.",
    )
    args = p.parse_args(argv)

    payloads = [extract_payload(load(Path(x))) for x in args.inputs]
    merged = merge(payloads, args.key)

    serialised = json.dumps(merged, indent=2)
    if args.out:
        Path(args.out).write_text(serialised)
        print(f"wrote {args.out} ({len(serialised):,} bytes)", file=sys.stderr)
    else:
        print(serialised)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
