
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const dedupe = <T extends { id: string }>(items: T[]): T[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const ageTasks = (tasks: any[], lastRecap: string | null, today: string): any[] => {
    if (!lastRecap || lastRecap === today) return tasks;
    
    return tasks.map(t => {
        if (!t.completed && t.status !== 'someday') {
            return { ...t, consecutiveDaysPending: (t.consecutiveDaysPending || 0) + 1 };
        }
        return t;
    });
};

export const calculateDailyPenalty = (lastRecap: string | null, today: string, pauseScheduledFor: string | null): number => {
    if (!lastRecap || lastRecap === today) return 0;
    if (pauseScheduledFor === today) return 0;
    
    const lastDate = new Date(lastRecap);
    const currentDate = new Date(today);
    
    if (isNaN(lastDate.getTime()) || isNaN(currentDate.getTime())) return 0;
    
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 1) {
        return diffDays * 20; // 20 XP per day missed
    }
    return 0;
};
