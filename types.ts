
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string; 
  projectId?: string;
  consecutiveDaysPending?: number;
  status: 'active' | 'someday';
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  logs: string[];
  icon?: string;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  startBalance: number;
  interestRate: number;
  minPayment: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  progress: number;
  category: 'Reading' | 'To Read' | 'Finished';
  rating?: number;
  notes?: string;
  review?: string;
  finishedDate?: string;
}

export interface QuarterGoal {
  id: string;
  quarter: string; // e.g., "2024-Q1"
  targetBooks: number;
  completed: boolean;
}

export interface HealthMetric {
  date: string;
  weight: number;
  sleepHours: number;
  mood: number;
  steps?: number;
  activeCalories?: number;
  waterIntake?: number;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  location?: string;
  type: 'Medical' | 'Therapy' | 'Other';
  notes?: string;
}

export interface TherapyResource {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Worksheet' | 'Audio';
  url?: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export interface BraindumpItem {
  id: string;
  content: string;
  createdAt: string;
  category?: 'General' | 'Health' | 'Finance' | 'Learning' | 'Habits' | 'Work';
}

export interface FastingState {
  isActive: boolean;
  startTime: string | null;
  goalHours: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  startDate: string;
  dueDate: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  theme: 'light' | 'dark';
  pauseStatus: {
    isActive: boolean;
    scheduledFor: string | null; // Date string YYYY-MM-DD
    frequency: number; // For frequency analysis
    lastPauseDate: string | null;
  };
  hasSeenTutorial: boolean;
}

export interface PlannerItem {
  id: string;
  type: 'photo' | 'note' | 'sticker' | 'quote';
  content: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  color?: string;
}

export interface PlannerSpread {
  id: string;
  name: string;
  items: PlannerItem[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'Tasks' | 'Habits' | 'Finance' | 'Health' | 'Learning' | 'General';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Health' | 'Finance' | 'Learning' | 'Work' | 'Personal' | 'Spiritual';
  description: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

export interface AppState {
  userProfile: UserProfile;
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  debts: Debt[];
  transactions: Transaction[];
  budgets: Budget[];
  expenseCategories: string[];
  books: Book[];
  quarterGoals: QuarterGoal[];
  health: HealthMetric[];
  appointments: Appointment[];
  therapyResources: TherapyResource[];
  journalEntries: JournalEntry[];
  braindump: BraindumpItem[];
  fasting: FastingState;
  plannerSpreads: PlannerSpread[];
  activeSpreadId: string | null;
  achievements: Achievement[];
  goals: Goal[];
  isFocusing?: boolean;
  isPausedToday?: boolean;
  pauseHistory: { date: string; reasonCategory?: string; reflection?: string }[];
  lastMindfulPrompt?: string;
  lastMorningReview?: string;
  lastNightRecap?: string;
  lastWeeklyAudit?: string;
}

export enum Tab {
  SANCTUARY = 'Sanctuary', // Dashboard + Tree
  ACTIONS = 'Actions',     // Tasks + Projects + Braindump + Finance + Planner + etc
  VITALITY = 'Vitality',   // Health + Habits + Therapy + Goals + Learning + Achievements
  SETTINGS = 'Settings'
}
