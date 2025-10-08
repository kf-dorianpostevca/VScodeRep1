/**
 * Tests for ChartService sparkline generation
 */

import { ChartService } from '../../src/services/ChartService';

describe('ChartService - Sparklines', () => {
  describe('generateSparkline', () => {
    it('should generate sparkline for ascending values', () => {
      const values = [10, 20, 40, 60, 80, 100];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(6);
      // Verify it uses sparkline characters
      expect(/[▁▂▃▄▅▆▇█]/.test(sparkline)).toBe(true);
    });

    it('should generate sparkline for descending values', () => {
      const values = [100, 80, 60, 40, 20, 10];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(6);
    });

    it('should generate sparkline with mixed values', () => {
      const values = [45, 60, 55, 70, 75, 80];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(6);
    });

    it('should handle null values with placeholder character', () => {
      const values = [50, null, 60, null, 70];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(5);
      expect(sparkline).toContain('·');
    });

    it('should handle all null values', () => {
      const values = [null, null, null];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBe('···');
    });

    it('should handle empty array', () => {
      const values: number[] = [];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBe('');
    });

    it('should handle all same values', () => {
      const values = [50, 50, 50, 50];
      const sparkline = ChartService.generateSparkline(values);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(4);
    });

    it('should respect custom min/max options', () => {
      const values = [25, 50, 75];
      const sparkline = ChartService.generateSparkline(values, { min: 0, max: 100 });

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(3);
    });

    it('should use custom null character', () => {
      const values = [50, null, 60];
      const sparkline = ChartService.generateSparkline(values, { nullChar: '-' });

      expect(sparkline).toContain('-');
      expect(sparkline).not.toContain('·');
    });

    it('should handle values at boundaries', () => {
      const values = [0, 50, 100];
      const sparkline = ChartService.generateSparkline(values, { min: 0, max: 100 });

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(3);
      // First should be lowest, last should be highest
      expect(sparkline[0]).toBe('▁');
      expect(sparkline[2]).toBe('█');
    });
  });

  describe('generateCompletionRateSparkline', () => {
    it('should generate sparkline for completion rates', () => {
      const rates = [45, 60, 75, 80];
      const sparkline = ChartService.generateCompletionRateSparkline(rates);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(4);
    });

    it('should handle null completion rates', () => {
      const rates = [50, null, 60, null];
      const sparkline = ChartService.generateCompletionRateSparkline(rates);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(4);
      expect(sparkline).toContain('·');
    });

    it('should handle 0-100 percentage scale', () => {
      const rates = [0, 25, 50, 75, 100];
      const sparkline = ChartService.generateCompletionRateSparkline(rates);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(5);
    });
  });

  describe('generateAccuracySparkline', () => {
    it('should generate sparkline for accuracy percentages', () => {
      const accuracies = [60, 70, 75, 85];
      const sparkline = ChartService.generateAccuracySparkline(accuracies);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(4);
    });

    it('should handle null accuracy values', () => {
      const accuracies = [60, null, 75, null];
      const sparkline = ChartService.generateAccuracySparkline(accuracies);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(4);
      expect(sparkline).toContain('·');
    });

    it('should handle improving accuracy trend', () => {
      const accuracies = [50, 60, 70, 80, 90];
      const sparkline = ChartService.generateAccuracySparkline(accuracies);

      expect(sparkline).toBeTruthy();
      expect(sparkline.length).toBe(5);
      // First character should be lower than last
      const chars = '▁▂▃▄▅▆▇█';
      const firstIndex = chars.indexOf(sparkline[0]);
      const lastIndex = chars.indexOf(sparkline[4]);
      expect(lastIndex).toBeGreaterThan(firstIndex);
    });
  });

  describe('visual verification', () => {
    it('should generate visually distinct sparklines for different trends', () => {
      const improving = [40, 50, 60, 70, 80];
      const declining = [80, 70, 60, 50, 40];

      const improvingSparkline = ChartService.generateSparkline(improving);
      const decliningSparkline = ChartService.generateSparkline(declining);

      // Should be different
      expect(improvingSparkline).not.toBe(decliningSparkline);
      expect(improvingSparkline.length).toBe(5);
      expect(decliningSparkline.length).toBe(5);
    });
  });
});
