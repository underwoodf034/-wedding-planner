import { useState } from 'react';
import { Heart, Calendar, CheckCircle, Users, Wallet, Pencil, Check, X } from 'lucide-react';
import type { WeddingData } from '../types';
import { getDaysUntilWedding } from '../lib/data';

interface Props {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function Header({ data, onUpdate }: Props) {
  const days = getDaysUntilWedding();
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalBudget = data.budget.reduce((sum, b) => sum + b.planned, 0);
  const spentBudget = data.budget.reduce((sum, b) => sum + b.actual, 0);
  const remaining = totalBudget - spentBudget;

  const attendingGuests = data.guests.filter(g => g.rsvp === 'attending').length;
  const totalWithPlusOnes = data.guests.reduce((sum, g) => sum + (g.rsvp === 'attending' ? 1 + (g.plusOne ? 1 : 0) : 0), 0);

  // 标题编辑状态
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editNames, setEditNames] = useState({ groom: data.settings.groomName, bride: data.settings.brideName });

  const saveTitle = () => {
    const updated = {
      ...data,
      settings: { ...data.settings, groomName: editNames.groom, brideName: editNames.bride },
    };
    onUpdate(updated);
    setIsEditingTitle(false);
  };

  const cancelEdit = () => {
    setEditNames({ groom: data.settings.groomName, bride: data.settings.brideName });
    setIsEditingTitle(false);
  };

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3d2a 0%, #2d5a3d 40%, #3d7a4d 100%)' }}>
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute top-3 left-6 text-5xl">🌿</div>
        <div className="absolute top-4 right-10 text-4xl">🌸</div>
        <div className="absolute bottom-1 left-1/3 text-3xl">🍃</div>
        <div className="absolute bottom-3 right-1/4 text-4xl">🌼</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-5 md:py-7">
        {/* 标题区 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  className="px-2 py-1 rounded text-sm font-bold bg-white/90 text-gray-800 outline-none w-20"
                  value={editNames.groom}
                  onChange={e => setEditNames({ ...editNames, groom: e.target.value })}
                  placeholder="新郎"
                />
                <span className="text-white/80 font-medium">&</span>
                <input
                  className="px-2 py-1 rounded text-sm font-bold bg-white/90 text-gray-800 outline-none w-20"
                  value={editNames.bride}
                  onChange={e => setEditNames({ ...editNames, bride: e.target.value })}
                  placeholder="新娘"
                />
                <span className="text-white/80 text-sm">的婚礼</span>
                <button onClick={saveTitle} className="ml-1 p-1 rounded bg-white/20 hover:bg-white/30 text-white transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={cancelEdit} className="p-1 rounded bg-white/20 hover:bg-white/30 text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
                  {data.settings.groomName} & {data.settings.brideName} 的婚礼
                </h1>
                <Pencil className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-sm mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {data.settings.theme} · {data.settings.venue}
            </p>
          </div>
        </div>

        {/* 统计卡片 — 白色实底，深色文字，高对比度 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="倒计时"
            value={days > 0 ? days : 0}
            unit="天"
            subtext={days > 0 ? data.settings.weddingDate : '婚礼当天！'}
            accent="#2d5a3d"
          />
          <StatCard
            icon={<CheckCircle className="w-4 h-4" />}
            label="任务进度"
            value={progress}
            unit="%"
            subtext={`${doneTasks}/${totalTasks} 完成`}
            showBar
            barValue={progress}
            accent="#4a7c59"
          />
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="预算剩余"
            value={remaining >= 0 ? (remaining / 10000).toFixed(1) : '0'}
            unit="万"
            subtext={`总预算 ¥${(data.settings.budgetTotal / 10000).toFixed(0)}万`}
            highlight={remaining < 0}
            accent="#c9a96e"
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="预计到场"
            value={totalWithPlusOnes}
            unit="人"
            subtext={`${attendingGuests} 位来宾确认`}
            accent="#8b5a5a"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, subtext, showBar, barValue, highlight, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  subtext: string;
  showBar?: boolean;
  barValue?: number;
  highlight?: boolean;
  accent: string;
}) {
  return (
    <div className="rounded-xl p-3 md:p-4" style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs font-semibold" style={{ color: '#5a6b5c' }}>{label}</span>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${highlight ? 'text-red-500' : ''}`} style={highlight ? {} : { color: '#1e3d2a' }}>
        {value}<span className="text-xs font-normal ml-1" style={{ color: '#8a9a8c' }}>{unit}</span>
      </div>
      {showBar && (
        <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: '#e8e4dc' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barValue}%`, background: `linear-gradient(90deg, ${accent}, ${accent}dd)` }}
          />
        </div>
      )}
      <div className="text-xs mt-1.5" style={{ color: '#8a9a8c' }}>{subtext}</div>
    </div>
  );
}
