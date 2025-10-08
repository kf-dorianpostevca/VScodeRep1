/**
 * Tests for TimeEstimateParser
 * Validates parsing of various time formats and error handling
 */

import { parseTimeEstimate, formatTimeEstimate } from '../../src/parsers/TimeEstimateParser';

describe('TimeEstimateParser', () => {
  describe('parseTimeEstimate', () => {
    describe('valid formats', () => {
      it('should parse minutes only', () => {
        expect(parseTimeEstimate('30m')).toBe(30);
        expect(parseTimeEstimate('45m')).toBe(45);
        expect(parseTimeEstimate('1m')).toBe(1);
        expect(parseTimeEstimate('1440m')).toBe(1440); // 24 hours
      });

      it('should parse hours only', () => {
        expect(parseTimeEstimate('1h')).toBe(60);
        expect(parseTimeEstimate('2h')).toBe(120);
        expect(parseTimeEstimate('24h')).toBe(1440);
      });

      it('should parse combined hours and minutes', () => {
        expect(parseTimeEstimate('1h30m')).toBe(90);
        expect(parseTimeEstimate('2h15m')).toBe(135);
        expect(parseTimeEstimate('12h30m')).toBe(750);
      });

      it('should handle case variations', () => {
        expect(parseTimeEstimate('30M')).toBe(30);
        expect(parseTimeEstimate('2H')).toBe(120);
        expect(parseTimeEstimate('1H30M')).toBe(90);
      });

      it('should handle whitespace', () => {
        expect(parseTimeEstimate('  30m  ')).toBe(30);
        expect(parseTimeEstimate(' 2h ')).toBe(120);
        expect(parseTimeEstimate('  1h30m  ')).toBe(90);
      });

      it('should parse decimal hours', () => {
        expect(parseTimeEstimate('1.5h')).toBe(90);
        expect(parseTimeEstimate('2.5h')).toBe(150);
        expect(parseTimeEstimate('0.5h')).toBe(30);
        expect(parseTimeEstimate('3.25h')).toBe(195);
      });

      it('should parse spelled-out minutes', () => {
        expect(parseTimeEstimate('30 minutes')).toBe(30);
        expect(parseTimeEstimate('90 minutes')).toBe(90);
        expect(parseTimeEstimate('45 minute')).toBe(45);
        expect(parseTimeEstimate('1 minute')).toBe(1);
        expect(parseTimeEstimate('120 mins')).toBe(120);
        expect(parseTimeEstimate('15 min')).toBe(15);
      });

      it('should parse spelled-out hours', () => {
        expect(parseTimeEstimate('2 hours')).toBe(120);
        expect(parseTimeEstimate('1 hour')).toBe(60);
        expect(parseTimeEstimate('3 hours')).toBe(180);
        expect(parseTimeEstimate('24 hours')).toBe(1440);
      });

      it('should handle decimal spelled-out formats', () => {
        expect(parseTimeEstimate('1.5 hours')).toBe(90);
        expect(parseTimeEstimate('2.5 hours')).toBe(150);
        expect(parseTimeEstimate('0.5 hour')).toBe(30);
      });

      it('should handle case variations for spelled-out formats', () => {
        expect(parseTimeEstimate('30 MINUTES')).toBe(30);
        expect(parseTimeEstimate('2 HOURS')).toBe(120);
        expect(parseTimeEstimate('45 Minute')).toBe(45);
      });
    });

    describe('invalid formats', () => {
      it('should throw for empty or null input', () => {
        expect(() => parseTimeEstimate('')).toThrow('Time estimate is required');
        expect(() => parseTimeEstimate(null as any)).toThrow('Time estimate is required');
        expect(() => parseTimeEstimate(undefined as any)).toThrow('Time estimate is required');
      });

      it('should throw for invalid format strings', () => {
        expect(() => parseTimeEstimate('invalid')).toThrow('Invalid time format');
        expect(() => parseTimeEstimate('30')).toThrow('Invalid time format');
        expect(() => parseTimeEstimate('30s')).toThrow('Invalid time format');
        expect(() => parseTimeEstimate('1d')).toThrow('Invalid time format');
        expect(() => parseTimeEstimate('2h3')).toThrow('Invalid time format');
      });

      it('should throw for zero time', () => {
        expect(() => parseTimeEstimate('0m')).toThrow('Time estimate must be greater than 0');
        expect(() => parseTimeEstimate('0h')).toThrow('Time estimate must be greater than 0');
        expect(() => parseTimeEstimate('0h0m')).toThrow('Time estimate must be greater than 0');
      });

      it('should throw for time over 24 hours', () => {
        expect(() => parseTimeEstimate('1441m')).toThrow('Time estimate must be between 1 minute and 24 hours');
        expect(() => parseTimeEstimate('25h')).toThrow('Time estimate must be between 1 minute and 24 hours');
        expect(() => parseTimeEstimate('24h1m')).toThrow('Time estimate must be between 1 minute and 24 hours');
      });

      it('should throw for negative numbers', () => {
        expect(() => parseTimeEstimate('-30m')).toThrow('Invalid time format');
        expect(() => parseTimeEstimate('-1h')).toThrow('Invalid time format');
      });
    });
  });

  describe('formatTimeEstimate', () => {
    it('should format minutes only', () => {
      expect(formatTimeEstimate(30)).toBe('30m');
      expect(formatTimeEstimate(45)).toBe('45m');
      expect(formatTimeEstimate(59)).toBe('59m');
    });

    it('should format hours only', () => {
      expect(formatTimeEstimate(60)).toBe('1h');
      expect(formatTimeEstimate(120)).toBe('2h');
      expect(formatTimeEstimate(1440)).toBe('24h');
    });

    it('should format combined hours and minutes', () => {
      expect(formatTimeEstimate(90)).toBe('1h30m');
      expect(formatTimeEstimate(135)).toBe('2h15m');
      expect(formatTimeEstimate(750)).toBe('12h30m');
    });

    it('should handle edge cases', () => {
      expect(formatTimeEstimate(1)).toBe('1m');
      expect(formatTimeEstimate(61)).toBe('1h1m');
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain consistency through parse and format', () => {
      const testCases = ['30m', '2h', '1h30m', '12h45m', '1h1m'];

      for (const testCase of testCases) {
        const parsed = parseTimeEstimate(testCase);
        const formatted = formatTimeEstimate(parsed);
        expect(formatted).toBe(testCase);
      }
    });
  });
});