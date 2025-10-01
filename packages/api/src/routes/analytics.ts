/**
 * Analytics Routes
 * REST API endpoints for monthly summaries and analytics data
 */

import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { taskRepository } from '../index';

const router = Router();
const analyticsController = new AnalyticsController(taskRepository);

/**
 * GET /api/v1/analytics/monthly
 * Get current month analytics summary
 */
router.get('/monthly', async (req, res) => {
  await analyticsController.getCurrentMonthSummary(req, res);
});

/**
 * GET /api/v1/analytics/monthly/:year/:month
 * Get historical month analytics summary
 * @param year - 4-digit year (e.g., 2025)
 * @param month - 1-2 digit month (1-12)
 */
router.get('/monthly/:year/:month', async (req, res) => {
  await analyticsController.getHistoricalMonthSummary(req, res);
});

export default router;