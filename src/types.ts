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
  email?: string;
  notes?: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  item: string;
  user: string;
  timestamp: string;
}

export interface Vendor {
  id: string;
  category: 'venue' | 'catering' | 'photography' | 'videography' | 'makeup' | 'florist' | 'music' | 'mc' | 'transport' | 'other';
  name: string;
  contact: string;
  phone: string;
  email?: string;
  price: number;
  deposit: number;
  paid: boolean;
  contractUrl?: string;
  notes: string;
  rating: number; // 1-5
  status: 'contacted' | 'quoted' | 'booked' | 'completed' | 'cancelled';
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: number; // minutes
  location: string;
  responsible: string;
  type: 'preparation' | 'ceremony' | 'reception' | 'photo' | 'meal' | 'entertainment' | 'transport';
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  scene: 'entrance' | 'ceremony' | 'recessional' | 'dinner' | 'first-dance' | 'party' | 'send-off' | 'other';
  url?: string;
  notes: string;
}

export interface Gift {
  id: string;
  from: string;
  amount?: number;
  item?: string;
  type: 'cash' | 'gift';
  notes: string;
  receivedAt: string;
  thanked: boolean;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: 'engagement' | 'pre-wedding' | 'wedding-day' | 'honeymoon' | 'other';
  uploadedAt: string;
}

export interface WeddingSettings {
  weddingDate: string;
  venue: string;
  theme: string;
  brideName: string;
  groomName: string;
  budgetTotal: number;
  guestEstimate: number;
  projectId: string;
}

export interface WeddingData {
  tasks: Task[];
  budget: BudgetItem[];
  guests: Guest[];
  history: HistoryEntry[];
  vendors: Vendor[];
  timeline: TimelineEvent[];
  music: MusicTrack[];
  gifts: Gift[];
  photos: Photo[];
  settings: WeddingSettings;
}
