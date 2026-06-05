import { Heart, Calendar, CheckCircle, Users, Wallet } from 'lucide-react';
import type { WeddingData } from '../types';
import { getDaysUntilWedding } from '../lib/data';

interface Props {
  data: WeddingData;
}

export default function Header({ data }: Props) {
  const days = getDaysUntilWedding();
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalBudget = data.budget.reduce((sum, b) => sum + b.planned, 0);
  const spentBudget = data.budget.reduce((sum, b) => sum + b.actual, 0);
  const remaining = totalBudget - spentBudget;

  const attendingGuests = data.guests.filter(g => g.rsvp === 'attending').length;
  const totalWithPlusOnes = data.guests.reduce((sum, g) => sum + (g.rsvp === 'attending' ? 1 + (g.plusOne ? 1 : 0) : 0), 0);

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 50%, #5a8a69 100%)' }}>
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 text-6xl">🌿</div>
        <div className="absolute top-6 right-12 text-5xl">🌸</div>
        <div className="absolute bottom-2 left-1/4 text-4xl">🍃</div>
        <div className="absolute bottom-4 right-1/3 text-5xl">🌼</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* 标题区 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {data.settings.groomName} & {data.settings.brideName} 的婚礼
            </h1>
            <p className="text-sm text-white/70 mt-0.5">{data.settings.theme} · {data.settings.venue}</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="倒计时"
            value={days > 0 ? days : 0}
            unit="天"
            subtext={days > 0 ? '2027年5月15日' : '婚礼当天！'}
          />
          <StatCard
            icon={<CheckCircle className="w-4 h-4" />}
            label="任务进度"
            value={progress}
            unit="%"
            subtext={`${doneTasks}/${totalTasks} 完成`}
            showBar
            barValue={progress}
          />
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="预算剩余"
            value={remaining >= 0 ? (remaining / 10000).toFixed(1) : '0'}
            unit="万"
            subtext={`总预算 ¥${(data.settings.budgetTotal / 10000).toFixed(0)}万`}
            highlight={remaining < 0}
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="预计到场"
            value={totalWithPlusOnes}
            unit="人"
            subtext={`${attendingGuests} 位来宾确认`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, subtext, showBar, barValue, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  subtext: string;
  showBar?: boolean;
  barValue?: number;
  highlight?: boolean;
}) {
  return (
    <div className="card-glass">
      <div className="flex items-center gap-2 text-white/70 mb-1.5">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${highlight ? 'text-red-300' : 'text-white'}`}>
        {value}<span className="text-xs font-normal text-white/60 ml-1">{unit}</span>
      </div>
      {showBar && (
        <div className="progress-bar mt-2" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="progress-bar-fill" style={{ width: `${barValue}%`, background: 'linear-gradient(90deg, #c9a96e, #e8d5a3)' }} />
        </div>
      )}
      <div className="text-xs text-white/50 mt-1.5">{subtext}</div>
    </div>
  );
}
