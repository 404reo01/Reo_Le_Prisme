import { readFile } from 'fs/promises';
import path from 'path';

import type { EmploymentData } from '@/lib/types/discrimination';

interface McpToolCallResponse {
  result?: {
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { message: string };
}

async function getEmploymentDataFromFile(): Promise<EmploymentData> {
  const filePath = path.join(
    process.cwd(),
    '..',
    'mcp-server',
    'data',
    'employment.json',
  );

  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as EmploymentData;
}

/**
 * Returns the full EmploymentData parsed from the JSON file.
 * File path is resolved server-side only — never exposed to the client.
 *
 * When MCP_SERVER_URL is set, data is fetched via the MCP server's
 * load_dataset tool over HTTP. Falls back to direct file access on failure.
 */
export async function getEmploymentData(): Promise<EmploymentData> {
  const mcpServerUrl = process.env.MCP_SERVER_URL;

  if (mcpServerUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${mcpServerUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'load_dataset',
            arguments: { dataset_name: 'employment.json' },
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`MCP server responded with status ${response.status}`);
      }

      const json = (await response.json()) as McpToolCallResponse;

      if (json.error) {
        throw new Error(json.error.message);
      }

      const textItem = json.result?.content?.find(
        (item) => item.type === 'text' && typeof item.text === 'string',
      );

      if (!textItem?.text) {
        throw new Error('MCP response contained no text content');
      }

      return JSON.parse(textItem.text) as EmploymentData;
    } catch {
      // MCP unreachable or timed out — fall through to filesystem fallback
    }
  }

  return getEmploymentDataFromFile();
}
