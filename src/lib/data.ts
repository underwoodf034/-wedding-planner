import type { HistoryEntry, WeddingData } from '../types';

const STORAGE_KEY = 'wedding-planner-data';
const WEDDING_DATE = '2027-05-15';

export const getDefaultData = (): WeddingData => ({
  tasks: [
    { id: '1', title: '确定婚礼场地', description: '联系酒店/户外场地，实地考察', status: 'todo', priority: 'high', assignee: '新郎', dueDate: '2026-08-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', title: '预约婚纱照', description: '选择摄影工作室，预约拍摄时间', status: 'todo', priority: 'high', assignee: '新娘', dueDate: '2026-09-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', title: '设计婚礼请柬', description: '确定设计风格，制作电子/纸质请柬', status: 'in-progress', priority: 'medium', assignee: '新娘', dueDate: '2026-10-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '4', title: '确定婚礼主题色', description: '白+金+绿森系风格', status: 'done', priority: 'medium', assignee: '共同', dueDate: '2026-06-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  budget: [
    { id: '1', category: '场地', item: '酒店宴会厅', planned: 80000, actual: 0, paid: false },
    { id: '2', category: '餐饮', item: '婚宴酒席（80人）', planned: 120000, actual: 0, paid: false },
    { id: '3', category: '摄影', item: '婚纱照+婚礼跟拍', planned: 25000, actual: 0, paid: false },
    { id: '4', category: '化妆', item: '新娘妆+伴娘妆', planned: 8000, actual: 0, paid: false },
    { id: '5', category: '装饰', item: '现场布置+花艺', planned: 30000, actual: 0, paid: false },
  ],
  guests: [
    { id: '1', name: '张三', side: 'bride', rsvp: 'attending', plusOne: true, table: 1, dietary: '', phone: '138****1234' },
    { id: '2', name: '李四', side: 'groom', rsvp: 'pending', plusOne: false, table: null, dietary: '素食', phone: '139****5678' },
  ],
  history: [
    { id: '1', action: '创建任务', item: '确定婚礼场地', user: '新郎', timestamp: new Date().toISOString() },
  ],
});

export const loadData = (): WeddingData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultData();
};

export const saveData = (data: WeddingData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addHistory = (data: WeddingData, action: string, item: string, user: string = '用户'): WeddingData => {
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    action,
    item,
    user,
    timestamp: new Date().toISOString(),
  };
  const updated = { ...data, history: [entry, ...data.history].slice(0, 100) };
  saveData(updated);
  return updated;
};

export const getDaysUntilWedding = (): number => {
  const wedding = new Date(WEDDING_DATE);
  const now = new Date();
  const diff = wedding.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
