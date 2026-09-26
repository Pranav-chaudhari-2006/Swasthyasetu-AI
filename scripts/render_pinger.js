#!/usr/bin/env node
/**
 * Render Free Tier Service Keep-Alive Runner
 * Pings configured Render services at random intervals between 40-45 seconds
 * to prevent automated free-tier spin-down (15-min idle inactivity).
 */

const https = require('https');
const http = require('http');

// Configuration
const TARGET_URL = process.env.RENDER_SERVICE_URL || 'https://swasthyasetu-api-gateway.onrender.com/health';
const MIN_INTERVAL_SEC = 40;
const MAX_INTERVAL_SEC = 45;

let pingCount = 0;
let successCount = 0;
let failureCount = 0;

function getRandomInterval() {
  return MIN_INTERVAL_SEC + Math.random() * (MAX_INTERVAL_SEC - MIN_INTERVAL_SEC);
}

function ping(url) {
  const start = Date.now();
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;

  console.log(`[${new Date().toISOString()}] Sending keep-alive ping #${++pingCount} to: ${url}...`);

  const req = client.get(url, {
    headers: {
      'User-Agent': 'SwasthyaSetu-KeepAlive-Worker/1.0',
      'X-Keep-Alive-Ping': 'true'
    },
    timeout: 15000
  }, (res) => {
    const latency = Date.now() - start;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      successCount++;
      console.log(`✓ [SUCCESS] HTTP ${res.statusCode} | Latency: ${latency}ms | Total Successful: ${successCount}`);
    } else {
      failureCount++;
      console.warn(`! [WARNING] HTTP ${res.statusCode} | Latency: ${latency}ms`);
    }
    scheduleNext();
  });

  req.on('error', (err) => {
    const latency = Date.now() - start;
    failureCount++;
    console.error(`✗ [ERROR] Ping failed (${latency}ms): ${err.message}`);
    scheduleNext();
  });

  req.on('timeout', () => {
    req.destroy();
    failureCount++;
    console.error(`✗ [TIMEOUT] Ping timed out after 15s`);
    scheduleNext();
  });
}

function scheduleNext() {
  const nextSec = getRandomInterval();
  const nextMs = Math.round(nextSec * 1000);
  console.log(`⏳ Next keep-alive ping in ${nextSec.toFixed(1)} seconds (${new Date(Date.now() + nextMs).toLocaleTimeString()})\n`);
  setTimeout(() => ping(TARGET_URL), nextMs);
}

console.log('='.repeat(70));
console.log('  SwasthyaSetu AI: Render Service Keep-Alive Daemon');
console.log(`  Target URL:        ${TARGET_URL}`);
console.log(`  Interval Range:    ${MIN_INTERVAL_SEC}s - ${MAX_INTERVAL_SEC}s (Random Jitter)`);
console.log('='.repeat(70));

// Start first ping immediately
ping(TARGET_URL);
