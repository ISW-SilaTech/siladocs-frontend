/**
 * Client-side wrapper for the backend SSE stream at /blockchain/events/stream.
 *
 * Usage:
 *   const client = BlockchainEventsService.connect(sessionId, {
 *     onEvent: (e) => console.log(e),
 *     onComplete: () => ...,
 *     onError: (err) => ...,
 *   });
 *   // later:
 *   client.close();
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export type BlockchainEventType =
  | 'file_received'
  | 'hash_computing'
  | 'hash_computed'
  | 'storage_uploading'
  | 'storage_uploaded'
  | 'fabric_connecting'
  | 'fabric_submitting'
  | 'fabric_confirmed'
  | 'db_saving'
  | 'completed'
  | 'batch_progress'
  | 'error';

export interface BlockchainEvent {
  sessionId: string;
  eventType: string;
  message: string;
  detail: string;
  timestamp: number;
  progress: number;
}

export interface BlockchainEventsClient {
  close: () => void;
  sessionId: string;
}

interface ConnectOptions {
  onEvent: (event: BlockchainEvent) => void;
  onComplete?: () => void;
  onError?: (err: Event) => void;
}

const ALL_EVENT_TYPES: BlockchainEventType[] = [
  'file_received',
  'hash_computing',
  'hash_computed',
  'storage_uploading',
  'storage_uploaded',
  'fabric_connecting',
  'fabric_submitting',
  'fabric_confirmed',
  'db_saving',
  'completed',
  'batch_progress',
  'error',
];

export const BlockchainEventsService = {
  /** Opens an SSE connection for the given sessionId. Returns a handle to close it. */
  connect(sessionId: string, options: ConnectOptions): BlockchainEventsClient {
    const url = `${API_BASE}/blockchain/events/stream?sessionId=${encodeURIComponent(sessionId)}`;
    const source = new EventSource(url);

    ALL_EVENT_TYPES.forEach((type) => {
      source.addEventListener(type, (raw: MessageEvent) => {
        try {
          const event: BlockchainEvent = JSON.parse(raw.data);
          options.onEvent(event);
          if (type === 'completed' || type === 'error') {
            source.close();
            options.onComplete?.();
          }
        } catch {
          // ignore parse errors
        }
      });
    });

    source.onerror = (err) => {
      options.onError?.(err);
      source.close();
    };

    return {
      sessionId,
      close: () => source.close(),
    };
  },

  /** Generates a random session ID for a new upload. */
  newSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },
};
