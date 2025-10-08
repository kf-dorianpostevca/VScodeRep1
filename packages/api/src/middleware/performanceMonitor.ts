/**
 * Performance Monitoring Middleware
 * Tracks response times and ensures sub-1 second performance requirement
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@intelligent-todo/shared';

const logger = createLogger('performance');

// Track performance metrics
interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  maxResponseTime: number;
  slowRequests: number; // > 1000ms
  requestsPerMinute: number;
}

let metrics: PerformanceMetrics = {
  totalRequests: 0,
  averageResponseTime: 0,
  maxResponseTime: 0,
  slowRequests: 0,
  requestsPerMinute: 0
};

let responseTimes: number[] = [];
let requestTimestamps: number[] = [];

/**
 * Performance monitoring middleware
 * Logs response times and tracks performance metrics
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - startTime;

    // Update metrics
    updateMetrics(responseTime, req);

    // Log slow requests (> 1000ms)
    if (responseTime > 1000) {
      logger.warn('Slow response detected', {
        method: req.method,
        url: req.url,
        responseTime,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent')
      });
    } else {
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        responseTime,
        statusCode: res.statusCode
      });
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Performance-Grade', responseTime <= 1000 ? 'A' : 'B');

    // Call original end and return the result
    return originalEnd.call(res, chunk, encoding);
  };

  next();
}

/**
 * Update performance metrics with new response time
 */
function updateMetrics(responseTime: number, _req: Request): void {
  const now = Date.now();

  // Update basic metrics
  metrics.totalRequests++;
  responseTimes.push(responseTime);
  requestTimestamps.push(now);

  // Track slow requests
  if (responseTime > 1000) {
    metrics.slowRequests++;
  }

  // Update max response time
  if (responseTime > metrics.maxResponseTime) {
    metrics.maxResponseTime = responseTime;
  }

  // Calculate average (keep last 1000 requests for efficiency)
  if (responseTimes.length > 1000) {
    responseTimes = responseTimes.slice(-1000);
  }
  metrics.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

  // Calculate requests per minute (keep last hour of timestamps)
  const oneHourAgo = now - (60 * 60 * 1000);
  requestTimestamps = requestTimestamps.filter(timestamp => timestamp > oneHourAgo);
  const oneMinuteAgo = now - (60 * 1000);
  const recentRequests = requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
  metrics.requestsPerMinute = recentRequests.length;

  // Log performance summary every 100 requests
  if (metrics.totalRequests % 100 === 0) {
    logger.info('Performance summary', {
      totalRequests: metrics.totalRequests,
      averageResponseTime: Math.round(metrics.averageResponseTime),
      maxResponseTime: metrics.maxResponseTime,
      slowRequests: metrics.slowRequests,
      slowRequestPercentage: ((metrics.slowRequests / metrics.totalRequests) * 100).toFixed(2) + '%',
      requestsPerMinute: metrics.requestsPerMinute
    });
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics & {
  slowRequestPercentage: string;
  performanceGrade: string;
} {
  const slowRequestPercentage = metrics.totalRequests > 0
    ? ((metrics.slowRequests / metrics.totalRequests) * 100).toFixed(2) + '%'
    : '0%';

  const performanceGrade = metrics.slowRequests / metrics.totalRequests < 0.05 ? 'A' :
                          metrics.slowRequests / metrics.totalRequests < 0.15 ? 'B' : 'C';

  return {
    ...metrics,
    averageResponseTime: Math.round(metrics.averageResponseTime),
    slowRequestPercentage,
    performanceGrade
  };
}

/**
 * Reset performance metrics (useful for testing)
 */
export function resetMetrics(): void {
  metrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    slowRequests: 0,
    requestsPerMinute: 0
  };
  responseTimes = [];
  requestTimestamps = [];
}