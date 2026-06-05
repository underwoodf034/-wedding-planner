export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  item: string;
  planned: number;
  actual: number;
  paid: boolean;
}

export interface Guest {
  id: string;
  name: string;
  side: 'bride' | 'groom' | 'mutual';
  rsvp: 'pending' | 'attending' | 'declined';
  plusOne: boolean;
  table: number | null;
  dietary: string;
  phone: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  item: string;
  user: string;
  timestamp: string;
}

export interface WeddingData {
  tasks: Task[];
  budget: BudgetItem[];
  guests: Guest[];
  history: HistoryEntry[];
}
