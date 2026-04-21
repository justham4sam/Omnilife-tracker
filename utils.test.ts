import { describe, it, expect } from 'vitest';
import { dedupe, generateId, ageTasks } from './utils';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a string ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(5);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('dedupe', () => {
    it('should remove items with duplicate IDs', () => {
      const items = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
        { id: '1', title: 'Duplicate Task 1' },
      ];
      const result = dedupe(items);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[0].title).toBe('Task 1');
    });

    it('should return empty array for non-array input', () => {
      // @ts-ignore
      expect(dedupe(null)).toEqual([]);
      // @ts-ignore
      expect(dedupe(undefined)).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(dedupe([])).toEqual([]);
    });
  });

  describe('ageTasks', () => {
    const mockTasks = [
        { id: '1', title: 'Task 1', completed: false, status: 'active', consecutiveDaysPending: 0 },
        { id: '2', title: 'Task 2', completed: true, status: 'active', consecutiveDaysPending: 0 },
        { id: '3', title: 'Task 3', completed: false, status: 'someday', consecutiveDaysPending: 0 },
    ];

    it('should increment consecutiveDaysPending for incomplete active tasks when day changes', () => {
        const lastRecap = '2026-04-18';
        const today = '2026-04-19';
        const result = ageTasks(mockTasks, lastRecap, today);
        
        expect(result[0].consecutiveDaysPending).toBe(1); // Incomplete + Active
        expect(result[1].consecutiveDaysPending).toBe(0); // Completed
        expect(result[2].consecutiveDaysPending).toBe(0); // Someday
    });

    it('should not change tasks if date is the same', () => {
        const date = '2026-04-19';
        const result = ageTasks(mockTasks, date, date);
        expect(result).toEqual(mockTasks);
    });

    it('should not change tasks if lastRecap is null', () => {
        const result = ageTasks(mockTasks, null, '2026-04-19');
        expect(result).toEqual(mockTasks);
    });
  });
});
