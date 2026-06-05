import type { HistoryEntry, WeddingData, WeddingSettings } from '../types';

const STORAGE_KEY = 'wedding-planner-data';
export const WEDDING_DATE = '2027-05-15';

export const getDefaultSettings = (): WeddingSettings => ({
  weddingDate: WEDDING_DATE,
  venue: '待定草坪场地',
  theme: '森系草坪婚礼',
  brideName: '新娘',
  groomName: '新郎',
  budgetTotal: 200000,
  guestEstimate: 70,
  projectId: 'wedding-2027',
});

export const getDefaultData = (): WeddingData => ({
  settings: getDefaultSettings(),
  tasks: [
    { id: '1', title: '确定草坪婚礼场地', description: '考察户外草坪场地，确认天气备案方案', status: 'todo', priority: 'high', assignee: '新郎', dueDate: '2026-08-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', title: '预约婚纱照（森系风格）', description: '选择擅长自然光/森系风格的摄影工作室', status: 'todo', priority: 'high', assignee: '新娘', dueDate: '2026-09-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', title: '设计婚礼请柬', description: '森系手绘风格，含草坪婚礼注意事项', status: 'in-progress', priority: 'medium', assignee: '新娘', dueDate: '2026-10-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '4', title: '确定婚礼主题色', description: '森系绿+香槟金+奶油白', status: 'done', priority: 'medium', assignee: '共同', dueDate: '2026-06-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '5', title: '预订婚礼策划团队', description: '寻找有草坪婚礼经验的策划师', status: 'todo', priority: 'high', assignee: '共同', dueDate: '2026-07-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '6', title: '确定婚纱礼服', description: '新娘主纱+敬酒服，新郎西装', status: 'todo', priority: 'medium', assignee: '新娘', dueDate: '2026-11-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '7', title: '设计草坪仪式流程', description: '迎宾→入场→证婚→交换戒指→抛花球→合影', status: 'todo', priority: 'high', assignee: '共同', dueDate: '2026-12-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '8', title: '预订花艺布置', description: '拱门花艺、路引花、桌花，以绿植+白玫瑰为主', status: 'todo', priority: 'medium', assignee: '新娘', dueDate: '2026-10-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '9', title: '确定婚宴菜单', description: '户外自助餐或西式分餐，考虑天气保温', status: 'todo', priority: 'medium', assignee: '共同', dueDate: '2026-11-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '10', title: '预订婚礼乐队/DJ', description: '草坪仪式背景音乐+晚宴助兴', status: 'todo', priority: 'low', assignee: '新郎', dueDate: '2026-12-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  budget: [
    { id: '1', category: '场地', item: '草坪场地租赁', planned: 30000, actual: 0, paid: false },
    { id: '2', category: '餐饮', item: '户外婚宴（70人）', planned: 70000, actual: 0, paid: false },
    { id: '3', category: '摄影', item: '婚纱照+婚礼跟拍', planned: 20000, actual: 0, paid: false },
    { id: '4', category: '摄像', item: '婚礼录像+剪辑', planned: 12000, actual: 0, paid: false },
    { id: '5', category: '化妆', item: '新娘妆+伴娘妆', planned: 8000, actual: 0, paid: false },
    { id: '6', category: '花艺', item: '拱门+路引+桌花', planned: 15000, actual: 0, paid: false },
    { id: '7', category: '布置', item: '现场装饰+灯光', planned: 18000, actual: 0, paid: false },
    { id: '8', category: '礼服', item: '婚纱+西装+伴娘服', planned: 15000, actual: 0, paid: false },
    { id: '9', category: '策划', item: '婚礼策划服务', planned: 12000, actual: 0, paid: false },
    { id: '10', category: '音乐', item: '乐队/DJ+音响', planned: 8000, actual: 0, paid: false },
    { id: '11', category: '交通', item: '宾客接送+婚车', planned: 5000, actual: 0, paid: false },
    { id: '12', category: '其他', item: '请柬+伴手礼+应急', planned: 7000, actual: 0, paid: false },
  ],
  guests: [
    { id: '1', name: '张叔叔', side: 'bride', rsvp: 'attending', plusOne: true, table: 1, dietary: '', phone: '138****0001', email: '', notes: '' },
    { id: '2', name: '李阿姨', side: 'bride', rsvp: 'attending', plusOne: false, table: 1, dietary: '素食', phone: '139****0002', email: '', notes: '' },
    { id: '3', name: '王伯伯', side: 'groom', rsvp: 'pending', plusOne: true, table: null, dietary: '', phone: '137****0003', email: '', notes: '' },
    { id: '4', name: '赵姑姑', side: 'groom', rsvp: 'attending', plusOne: false, table: 2, dietary: '', phone: '136****0004', email: '', notes: '' },
    { id: '5', name: '刘同学', side: 'mutual', rsvp: 'attending', plusOne: true, table: 3, dietary: '海鲜过敏', phone: '135****0005', email: '', notes: '' },
    { id: '6', name: '陈闺蜜', side: 'bride', rsvp: 'attending', plusOne: false, table: 4, dietary: '', phone: '134****0006', email: '', notes: '伴娘' },
    { id: '7', name: '周兄弟', side: 'groom', rsvp: 'pending', plusOne: false, table: null, dietary: '', phone: '133****0007', email: '', notes: '伴郎' },
    { id: '8', name: '吴老师', side: 'mutual', rsvp: 'declined', plusOne: false, table: null, dietary: '', phone: '132****0008', email: '', notes: '出差无法参加' },
  ],
  history: [
    { id: '1', action: '创建项目', item: '草坪婚礼筹备', user: '新郎', timestamp: new Date().toISOString() },
  ],
  vendors: [
    { id: '1', category: 'venue', name: '绿野庄园', contact: '王经理', phone: '138****1001', email: '', price: 30000, deposit: 10000, paid: false, notes: '草坪可容纳100人，有室内备案', rating: 4, status: 'contacted' },
    { id: '2', category: 'photography', name: '森光摄影', contact: '林摄影师', phone: '139****1002', email: '', price: 20000, deposit: 5000, paid: false, notes: '擅长自然光，看过样片很满意', rating: 5, status: 'quoted' },
    { id: '3', category: 'catering', name: '悦食餐饮', contact: '陈总监', phone: '137****1003', email: '', price: 70000, deposit: 20000, paid: false, notes: '户外自助餐，含保温设备', rating: 4, status: 'contacted' },
  ],
  timeline: [
    { id: '1', time: '08:00', title: '新娘化妆', description: '新娘+伴娘妆发造型', duration: 150, location: '酒店套房', responsible: '化妆师', type: 'preparation' },
    { id: '2', time: '09:00', title: '新郎准备', description: '新郎+伴郎整理着装', duration: 90, location: '酒店套房', responsible: '新郎', type: 'preparation' },
    { id: '3', time: '10:30', title: '外景拍摄', description: '新人+伴郎伴娘团外景拍照', duration: 90, location: '草坪周边', responsible: '摄影师', type: 'photo' },
    { id: '4', time: '12:00', title: '宾客签到', description: '来宾签到、领取伴手礼、入座', duration: 60, location: '草坪入口', responsible: '接待组', type: 'reception' },
    { id: '5', time: '13:00', title: '草坪仪式', description: '新人入场、证婚、交换戒指、拥吻', duration: 45, location: '草坪仪式区', responsible: '司仪', type: 'ceremony' },
    { id: '6', time: '13:45', title: '抛花球+合影', description: '抛花球环节、全体大合影', duration: 30, location: '草坪仪式区', responsible: '司仪', type: 'ceremony' },
    { id: '7', time: '14:15', title: '鸡尾酒时间', description: '宾客自由交流、拍照、享用饮品', duration: 45, location: '草坪休闲区', responsible: '餐饮组', type: 'reception' },
    { id: '8', time: '15:00', title: '婚宴开始', description: '新人入场、开席、敬酒', duration: 120, location: '草坪宴会区', responsible: '餐饮组', type: 'meal' },
    { id: '9', time: '17:00', title: '切蛋糕+First Dance', description: '切婚礼蛋糕、新人第一支舞', duration: 30, location: '草坪宴会区', responsible: '司仪', type: 'entertainment' },
    { id: '10', time: '17:30', title: '互动游戏+抽奖', description: '宾客互动游戏、抽奖环节', duration: 60, location: '草坪宴会区', responsible: '司仪', type: 'entertainment' },
    { id: '11', time: '18:30', title: '送客', description: '新人送客、发放伴手礼', duration: 30, location: '草坪入口', responsible: '接待组', type: 'transport' },
  ],
  music: [
    { id: '1', title: 'A Thousand Years', artist: 'Christina Perri', scene: 'ceremony', url: '', notes: '新娘入场' },
    { id: '2', title: 'Perfect', artist: 'Ed Sheeran', scene: 'first-dance', url: '', notes: 'First Dance' },
    { id: '3', title: 'Marry You', artist: 'Bruno Mars', scene: 'party', url: '', notes: '抛花球' },
    { id: '4', title: 'Canon in D', artist: 'Pachelbel', scene: 'entrance', url: '', notes: '迎宾背景音乐' },
  ],
  gifts: [],
  photos: [],
});

export const loadData = (): WeddingData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 合并默认数据结构（处理新增字段）
      const defaults = getDefaultData();
      return {
        ...defaults,
        ...parsed,
        settings: { ...defaults.settings, ...parsed.settings },
        vendors: parsed.vendors || defaults.vendors,
        timeline: parsed.timeline || defaults.timeline,
        music: parsed.music || defaults.music,
        gifts: parsed.gifts || defaults.gifts,
        photos: parsed.photos || defaults.photos,
      };
    }
  } catch { /* ignore */ }
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

export const exportToJSON = (data: WeddingData): string => {
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = (json: string): WeddingData | null => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const exportGuestsToCSV = (guests: WeddingData['guests']): string => {
  const headers = ['姓名', '归属', 'RSVP', '携带+1', '座位', '饮食禁忌', '电话', '邮箱', '备注'];
  const rows = guests.map(g => [
    g.name,
    g.side === 'bride' ? '新娘方' : g.side === 'groom' ? '新郎方' : '共同',
    g.rsvp === 'attending' ? '确认出席' : g.rsvp === 'declined' ? '缺席' : '待定',
    g.plusOne ? '是' : '否',
    g.table || '',
    g.dietary || '',
    g.phone,
    g.email || '',
    g.notes || '',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
