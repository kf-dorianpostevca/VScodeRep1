/**
 * Performance Metrics Route
 * Provides performance monitoring and health check endpoints
 */

import { Router } from 'express';
import { getPerformanceMetrics } from '../middleware/performanceMonitor';

const router = Router();

/**
 * Get current performance metrics
 * GET /api/metrics
 */
router.get('/', (_req, res) => {
  const metrics = getPerformanceMetrics();

  res.json({
    success: true,
    message: '📊 Performance metrics retrieved successfully!',
    data: {
      performance: metrics,
      timestamp: new Date().toISOString(),
      status: metrics.performanceGrade === 'A' ? '🚀 Excellent' :
              metrics.performanceGrade === 'B' ? '⚡ Good' : '⚠️ Needs attention',
      recommendations: generateRecommendations(metrics)
    },
    celebrationTip: metrics.performanceGrade === 'A'
      ? 'Your API is performing excellently! 🌟'
      : 'Monitor your performance to keep users happy! 📈'
  });
});

/**
 * Performance health check
 * GET /api/metrics/health
 */
router.get('/health', (_req, res) => {
  const metrics = getPerformanceMetrics();
  const isHealthy = metrics.performanceGrade !== 'C' && metrics.averageResponseTime < 800;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy
      ? '✅ API performance is healthy!'
      : '⚠️ API performance needs attention',
    data: {
      healthy: isHealthy,
      averageResponseTime: metrics.averageResponseTime,
      slowRequestPercentage: metrics.slowRequestPercentage,
      performanceGrade: metrics.performanceGrade,
      timestamp: new Date().toISOString()
    },
    celebrationTip: isHealthy
      ? 'Great performance keeps users coming back! 🎯'
      : 'Performance optimization is an investment in user experience! 💪'
  });
});

/**
 * Generate performance recommendations based on metrics
 */
function generateRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  if (metrics.averageResponseTime > 500) {
    recommendations.push('Consider optimizing database queries for faster response times');
  }

  if (metrics.slowRequests > 0) {
    recommendations.push('Investigate and optimize endpoints with > 1000ms response times');
  }

  if (metrics.requestsPerMinute > 60) {
    recommendations.push('Consider implementing caching for frequently accessed data');
  }

  if (metrics.performanceGrade === 'C') {
    recommendations.push('Performance is below target - review error logs and optimize critical paths');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance looks great! Keep monitoring to maintain excellence');
  }

  return recommendations;
}

export { router as metricsRouter };