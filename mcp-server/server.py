"""
Reo Le Prisme - MCP Statistics Engine
FastMCP server providing discrimination simulation data tools.
"""

import os
import json
from pathlib import Path

from fastmcp import FastMCP
from fastmcp.server import Context

# ---------------------------------------------------------------------------
# Server init
# ---------------------------------------------------------------------------

mcp = FastMCP(
    name="reo-le-prisme-stats",
    version="0.1.0",
    description="Discrimination simulation data engine for Reo Le Prisme.",
)

# ---------------------------------------------------------------------------
# Security: path allowlist
# ---------------------------------------------------------------------------

_DATA_ROOT = Path(__file__).parent / "data"


def is_path_allowed(path: str | Path) -> bool:
    """Restrict all file access to /mcp-server/data."""
    try:
        resolved = Path(path).resolve()
        return resolved.is_relative_to(_DATA_ROOT.resolve())
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Tool: ping (health check with ctx logging + progress)
# ---------------------------------------------------------------------------


@mcp.tool()
async def ping(ctx: Context) -> str:
    """Health-check tool demonstrating ctx logging and progress reporting."""
    await ctx.info("ping received")
    await ctx.report_progress(0, 1)
    await ctx.info("ping complete")
    await ctx.report_progress(1, 1)
    return "pong"


# ---------------------------------------------------------------------------
# Tool: load_dataset (secure file access)
# ---------------------------------------------------------------------------


@mcp.tool()
async def load_dataset(dataset_name: str, ctx: Context) -> dict:
    """
    Load a JSON dataset from /mcp-server/data.

    Args:
        dataset_name: Filename relative to the data directory (e.g. 'employment.json').
    """
    target = _DATA_ROOT / dataset_name

    if not is_path_allowed(target):
        raise ValueError(f"Access denied: '{dataset_name}' is outside the data directory.")

    if not target.exists():
        raise FileNotFoundError(f"Dataset '{dataset_name}' not found.")

    await ctx.info(f"Loading dataset: {dataset_name}")
    await ctx.report_progress(0, 2)

    with open(target, encoding="utf-8") as f:
        data = json.load(f)

    await ctx.report_progress(2, 2)
    await ctx.info(f"Loaded {len(data)} records from '{dataset_name}'.")
    return data


# ---------------------------------------------------------------------------
# Tool: analyze_discrimination (Sampling skeleton)
# ---------------------------------------------------------------------------


@mcp.tool()
async def analyze_discrimination(
    dataset_name: str,
    query: str,
    ctx: Context,
) -> str:
    """
    Delegate complex discrimination pattern analysis to the LLM via Sampling.

    Args:
        dataset_name: Source dataset to analyse.
        query:        Natural-language analysis question.
    """
    raw_data = await load_dataset(dataset_name, ctx)
    await ctx.info(f"Delegating analysis to model: '{query}'")

    sample_prompt = (
        f"You are an expert in French discrimination statistics.\n"
        f"Dataset (JSON):\n{json.dumps(raw_data, ensure_ascii=False, indent=2)}\n\n"
        f"Question: {query}\n\n"
        "Provide a structured, data-grounded answer in English."
    )

    response = await ctx.session.create_message(
        messages=[{"role": "user", "content": sample_prompt}],
        max_tokens=1024,
    )

    return response.content.text


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--transport",
        choices=["stdio", "streamable-http"],
        default="stdio",
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    if args.transport == "streamable-http":
        mcp.run(transport="streamable-http", host=args.host, port=args.port)
    else:
        mcp.run()
