/**
 * Splunk On-Call Monitoring Setup for Product Service
 * Provides incident alerting and health monitoring
 */

import {
  createAlertManager,
  createHealthMonitor,
  createSplunkOnCallMiddleware,
  createHealthEndpoint,
  HealthChecks,
  AlertManager,
  HealthMonitor,
} from '@3asoftwares/utils/backend';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import { Application } from 'express';

const SERVICE_NAME = 'product-service';

let alertManager: AlertManager;
let healthMonitor: HealthMonitor;

/**
 * Initialize Splunk On-Call monitoring
 */
export function initializeMonitoring(app: Application, redisClient?: Redis): void {
  // Create alert manager
  alertManager = createAlertManager(SERVICE_NAME);

  // Create Splunk On-Call middleware
  const { requestTracker, errorHandler, getMetrics } = createSplunkOnCallMiddleware({
    serviceName: SERVICE_NAME,
    alertOnErrors: true,
    alertOnSlowRequests: true,
    slowRequestThresholdMs: 3000,
    errorRateThresholdPercent: 5,
    excludePaths: ['/health', '/ready', '/metrics', '/api-docs'],
  });

  // Add request tracking middleware (before routes)
  app.use(requestTracker);

  // Configure health checks
  const healthChecks = [
    HealthChecks.mongodb('mongodb', mongoose),
    HealthChecks.memory('memory', 85),
  ];

  // Add Redis check if client provided
  if (redisClient) {
    healthChecks.push(HealthChecks.redis('redis', redisClient));
  }

  // Create health monitor
  healthMonitor = createHealthMonitor(SERVICE_NAME, healthChecks, {
    defaultInterval: 30000, // Check every 30 seconds
    defaultTimeout: 5000,
    onHealthChange: (results: Array<{ name: string; healthy: boolean }>) => {
      const failingChecks = results.filter((r: { healthy: boolean }) => !r.healthy);
      if (failingChecks.length > 0) {
        console.warn(
          '[HealthMonitor] Failing checks:',
          failingChecks.map((c: { name: string }) => c.name)
        );
      }
    },
  });

  // Add health endpoints
  const healthCheckFunctions: Record<string, () => Promise<boolean>> = {
    mongodb: async () => mongoose.connection.readyState === 1,
    memory: async () => {
      const used = process.memoryUsage();
      return (used.heapUsed / used.heapTotal) * 100 < 85;
    },
  };

  if (redisClient) {
    healthCheckFunctions.redis = async () => {
      const result = await redisClient.ping();
      return result === 'PONG';
    };
  }

  app.get('/health', createHealthEndpoint(SERVICE_NAME, healthCheckFunctions));

  app.get('/ready', (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    res.status(isReady ? 200 : 503).json({
      service: SERVICE_NAME,
      ready: isReady,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', (req, res) => {
    const metrics = getMetrics();
    const healthSummary = healthMonitor.getSummary();

    res.json({
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      requests: metrics,
      health: healthSummary,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Add error handler (after routes)
  // Note: This should be added after all routes are defined
  // app.use(errorHandler);

  // Start health monitoring
  healthMonitor.start();

  console.log(`[${SERVICE_NAME}] Splunk On-Call monitoring initialized`);
}

/**
 * Get the alert manager instance
 */
export function getAlertManager(): AlertManager {
  if (!alertManager) {
    alertManager = createAlertManager(SERVICE_NAME);
  }
  return alertManager;
}

/**
 * Get the health monitor instance
 */
export function getHealthMonitor(): HealthMonitor | undefined {
  return healthMonitor;
}

/**
 * Send a custom alert
 */
export async function sendAlert(
  severity: 'critical' | 'warning' | 'info',
  message: string,
  details?: Record<string, any>
): Promise<void> {
  const manager = getAlertManager();
  await manager.alert(severity, message, { details });
}

/**
 * Shutdown monitoring gracefully
 */
export function shutdownMonitoring(): void {
  if (healthMonitor) {
    healthMonitor.stop();
  }
  console.log(`[${SERVICE_NAME}] Monitoring shutdown complete`);
}

/**
 * Database event handlers for alerting
 */
export function setupDatabaseAlerts(): void {
  const manager = getAlertManager();

  mongoose.connection.on('disconnected', () => {
    manager.databaseDown('mongodb', new Error('MongoDB connection lost'));
  });

  mongoose.connection.on('reconnected', () => {
    manager.databaseRecovered('mongodb');
  });

  mongoose.connection.on('error', (err) => {
    manager.databaseDown('mongodb', err);
  });

  console.log(`[${SERVICE_NAME}] Database alert handlers configured`);
}

export default {
  initializeMonitoring,
  getAlertManager,
  getHealthMonitor,
  sendAlert,
  shutdownMonitoring,
  setupDatabaseAlerts,
};
