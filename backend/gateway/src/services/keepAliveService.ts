import axios from 'axios';
import { config } from '../config';

export interface PingRecord {
  id: string;
  timestamp: string;
  targetUrl: string;
  statusCode?: number;
  latencyMs: number;
  success: boolean;
  error?: string;
  nextScheduledInSec?: number;
}

export interface KeepAliveStatus {
  isActive: boolean;
  targetUrl: string;
  minIntervalSec: number;
  maxIntervalSec: number;
  totalPings: number;
  successCount: number;
  failureCount: number;
  uptimeSeconds: number;
  lastPingAt: string | null;
  lastLatencyMs: number | null;
  lastStatusCode: number | null;
  nextPingAt: string | null;
  nextPingInSeconds: number | null;
  recentHistory: PingRecord[];
}

export class KeepAliveService {
  private targetUrl: string;
  private minIntervalSec: number;
  private maxIntervalSec: number;
  private timer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private startTime: number = Date.now();
  private nextPingTimestamp: number | null = null;
  private totalPings: number = 0;
  private successCount: number = 0;
  private failureCount: number = 0;
  private lastPingAt: string | null = null;
  private lastLatencyMs: number | null = null;
  private lastStatusCode: number | null = null;
  private history: PingRecord[] = [];

  constructor() {
    this.targetUrl = config.renderKeepAlive.targetUrl;
    this.minIntervalSec = config.renderKeepAlive.minIntervalSec;
    this.maxIntervalSec = config.renderKeepAlive.maxIntervalSec;

    if (config.renderKeepAlive.autoStart) {
      this.start();
    }
  }

  public getStatus(): KeepAliveStatus {
    const now = Date.now();
    const nextPingInSeconds = this.nextPingTimestamp && this.nextPingTimestamp > now
      ? Math.round((this.nextPingTimestamp - now) / 1000)
      : null;

    return {
      isActive: this.isActive,
      targetUrl: this.targetUrl,
      minIntervalSec: this.minIntervalSec,
      maxIntervalSec: this.maxIntervalSec,
      totalPings: this.totalPings,
      successCount: this.successCount,
      failureCount: this.failureCount,
      uptimeSeconds: Math.floor((now - this.startTime) / 1000),
      lastPingAt: this.lastPingAt,
      lastLatencyMs: this.lastLatencyMs,
      lastStatusCode: this.lastStatusCode,
      nextPingAt: this.nextPingTimestamp ? new Date(this.nextPingTimestamp).toISOString() : null,
      nextPingInSeconds,
      recentHistory: this.history.slice(-20).reverse()
    };
  }

  public configure(options: {
    targetUrl?: string;
    minIntervalSec?: number;
    maxIntervalSec?: number;
    autoStart?: boolean;
  }): KeepAliveStatus {
    if (options.targetUrl) this.targetUrl = options.targetUrl;
    if (options.minIntervalSec !== undefined) this.minIntervalSec = options.minIntervalSec;
    if (options.maxIntervalSec !== undefined) this.maxIntervalSec = options.maxIntervalSec;

    if (options.autoStart === true && !this.isActive) {
      this.start();
    } else if (options.autoStart === false && this.isActive) {
      this.stop();
    }

    return this.getStatus();
  }

  public start(): void {
    if (this.isActive) return;
    this.isActive = true;
    console.log(`[Render Keep-Alive] Started keep-alive service for target: ${this.targetUrl} (Random Interval: ${this.minIntervalSec}-${this.maxIntervalSec}s)`);
    this.scheduleNext(true);
  }

  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isActive = false;
    this.nextPingTimestamp = null;
    console.log('[Render Keep-Alive] Stopped keep-alive service');
  }

  public async pingNow(customUrl?: string): Promise<PingRecord> {
    const url = customUrl || this.targetUrl;
    const start = Date.now();
    const pingId = `ping-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'SwasthyaSetu-KeepAlive-Engine/1.0',
          'X-Keep-Alive-Ping': 'true'
        },
        validateStatus: () => true // Treat all HTTP status codes as valid ping responses
      });

      const latencyMs = Date.now() - start;
      const success = response.status >= 200 && response.status < 400;

      this.totalPings++;
      if (success) {
        this.successCount++;
      } else {
        this.failureCount++;
      }

      this.lastPingAt = timestamp;
      this.lastLatencyMs = latencyMs;
      this.lastStatusCode = response.status;

      const record: PingRecord = {
        id: pingId,
        timestamp,
        targetUrl: url,
        statusCode: response.status,
        latencyMs,
        success
      };

      this.recordHistory(record);
      console.log(`[Render Keep-Alive] Pinged ${url} in ${latencyMs}ms -> HTTP ${response.status}`);
      return record;
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      this.totalPings++;
      this.failureCount++;
      this.lastPingAt = timestamp;
      this.lastLatencyMs = latencyMs;
      this.lastStatusCode = null;

      const record: PingRecord = {
        id: pingId,
        timestamp,
        targetUrl: url,
        latencyMs,
        success: false,
        error: err.message
      };

      this.recordHistory(record);
      console.warn(`[Render Keep-Alive] Failed to ping ${url} in ${latencyMs}ms -> ${err.message}`);
      return record;
    }
  }

  private scheduleNext(immediate: boolean = false): void {
    if (!this.isActive) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (immediate) {
      // Fire first ping almost immediately (1-2s delay)
      this.timer = setTimeout(async () => {
        await this.pingNow();
        this.scheduleNext(false);
      }, 1500);
      this.nextPingTimestamp = Date.now() + 1500;
      return;
    }

    // Calculate random interval between minIntervalSec and maxIntervalSec (40s - 45s)
    const randomIntervalSec = this.minIntervalSec + Math.random() * (this.maxIntervalSec - this.minIntervalSec);
    const intervalMs = Math.round(randomIntervalSec * 1000);
    this.nextPingTimestamp = Date.now() + intervalMs;

    this.timer = setTimeout(async () => {
      await this.pingNow();
      this.scheduleNext(false);
    }, intervalMs);

    console.log(`[Render Keep-Alive] Next ping scheduled in ${randomIntervalSec.toFixed(1)}s (Target: ${this.targetUrl})`);
  }

  private recordHistory(record: PingRecord): void {
    this.history.push(record);
    if (this.history.length > 50) {
      this.history.shift();
    }
  }
}

export const keepAliveService = new KeepAliveService();
