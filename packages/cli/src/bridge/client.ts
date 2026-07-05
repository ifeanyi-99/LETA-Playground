/* eslint-disable no-console */
// Minimal client for the Figma Desktop Bridge plugin's WebSocket protocol.
//
// The bridge plugin is a *client* that connects to whatever WebSocket server
// is listening on localhost:9226. The figma-console MCP normally fills that
// role; this module replaces it for `tokens:fetch` so the CLI can drive
// extractions directly from a developer's terminal.
//
// Protocol (reverse-engineered from figma-console-mcp source):
//   - Server sends `{ type: 'SERVER_HELLO' }` when the plugin connects.
//   - Plugin replies with `{ type: 'FILE_INFO', fileId, fileName, ... }` within 30s
//     (otherwise it disconnects).
//   - Server sends `{ id, method: 'EXECUTE_CODE', params: { code, timeout } }`.
//   - Plugin returns `{ id, result }` on success or `{ id, error }` on failure.
//
// This client multiplexes multiple in-flight `executeCode` calls by tagging
// each request with a unique id and resolving the matching promise on response.

import { WebSocketServer, type WebSocket } from 'ws';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

export interface FileInfo {
  fileId?: string;
  fileName?: string;
  pageName?: string;
}

export interface BridgeOptions {
  /** Port to listen on. Default: 9226 (matches the bridge plugin's hardcoded server). */
  port?: number;
  /** How long to wait for the plugin to connect, in ms. Default: 30s. */
  connectionTimeoutMs?: number;
}

export class BridgeClient {
  private wss: WebSocketServer | null = null;
  private socket: WebSocket | null = null;
  private fileInfo: FileInfo | null = null;
  private pending = new Map<string, PendingRequest>();
  private nextId = 0;

  constructor(private opts: BridgeOptions = {}) {}

  /**
   * Bind the WebSocket server, wait for the plugin to connect and announce
   * its file. Resolves with the announced FileInfo. Rejects if the port is
   * already in use, the plugin doesn't connect within the timeout, or the
   * plugin disconnects before sending FILE_INFO.
   */
  async waitForPlugin(): Promise<FileInfo> {
    const port = this.opts.port ?? 9226;
    const timeoutMs = this.opts.connectionTimeoutMs ?? 30_000;

    return new Promise<FileInfo>((resolve, reject) => {
      let settled = false;
      const settle = (action: () => void) => {
        if (settled) return;
        settled = true;
        action();
      };

      // Bind the server.
      const wss = new WebSocketServer({ port, host: '127.0.0.1' });
      this.wss = wss;

      wss.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'EADDRINUSE') {
          settle(() =>
            reject(
              new Error(
                `Port ${port} is already in use. Is Claude Code (or the figma-console MCP) ` +
                  `currently running? Quit it and re-run \`pnpm tokens:fetch\`.`,
              ),
            ),
          );
        } else {
          settle(() => reject(err));
        }
      });

      const connectionTimer = setTimeout(() => {
        settle(() => {
          this.close();
          reject(
            new Error(
              `Bridge plugin did not connect within ${timeoutMs / 1000}s. ` +
                `Open the LETA Library in Figma desktop and ensure the Desktop Bridge plugin is active ` +
                `(Plugins → Development → Figma Desktop Bridge).`,
            ),
          );
        });
      }, timeoutMs);

      wss.on('connection', (socket) => {
        this.socket = socket;
        clearTimeout(connectionTimer);

        // Send the handshake and wait for FILE_INFO.
        socket.send(JSON.stringify({ type: 'SERVER_HELLO' }));

        const fileInfoTimer = setTimeout(() => {
          settle(() => {
            this.close();
            reject(new Error('Plugin connected but did not send FILE_INFO within 30s.'));
          });
        }, 30_000);

        socket.on('message', (raw) => {
          let msg: { type?: string; id?: string; result?: unknown; error?: string } & Record<string, unknown>;
          try {
            msg = JSON.parse(raw.toString());
          } catch {
            return; // ignore malformed
          }

          if (msg.type === 'FILE_INFO') {
            clearTimeout(fileInfoTimer);
            this.fileInfo = {
              fileId: typeof msg.fileId === 'string' ? msg.fileId : undefined,
              fileName: typeof msg.fileName === 'string' ? msg.fileName : undefined,
              pageName: typeof msg.pageName === 'string' ? msg.pageName : undefined,
            };
            settle(() => resolve(this.fileInfo!));
            return;
          }

          // Response to a previously issued executeCode request.
          if (msg.id !== undefined && this.pending.has(msg.id)) {
            const pending = this.pending.get(msg.id)!;
            this.pending.delete(msg.id);
            clearTimeout(pending.timer);
            if (msg.error) pending.reject(new Error(msg.error));
            else pending.resolve(msg.result);
          }
        });

        socket.on('close', () => {
          // Reject all in-flight requests.
          for (const [, pending] of this.pending) {
            clearTimeout(pending.timer);
            pending.reject(new Error('Bridge connection closed before response was received.'));
          }
          this.pending.clear();
          this.socket = null;
        });
      });
    });
  }

  /**
   * Run a snippet of JS inside the Figma plugin sandbox and return its result.
   * The snippet is wrapped in an async IIFE by the plugin, so `await` and
   * top-level `return` work as expected.
   */
  async executeCode<T = unknown>(code: string, timeoutMs = 25_000): Promise<T> {
    if (!this.socket) {
      throw new Error('Bridge is not connected. Call waitForPlugin() first.');
    }
    const id = `leta_${++this.nextId}_${Date.now()}`;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`executeCode timed out after ${timeoutMs}ms`));
      }, timeoutMs + 2_000); // give the plugin a small grace window

      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject, timer });

      this.socket!.send(
        JSON.stringify({
          id,
          method: 'EXECUTE_CODE',
          params: { code, timeout: timeoutMs },
        }),
      );
    });
  }

  close(): void {
    if (this.socket) this.socket.close();
    if (this.wss) this.wss.close();
    this.wss = null;
    this.socket = null;
  }
}
