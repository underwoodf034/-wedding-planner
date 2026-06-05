import { Heart, Calendar, CheckCircle } from 'lucide-react';
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

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-red-400 fill-red-400" />
          <h1 className="text-2xl font-bold text-gray-800">婚礼筹备管家</h1>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">倒计时</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{days}<span className="text-sm font-normal text-gray-500 ml-1">天</span></div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">任务进度</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{progress}<span className="text-sm font-normal text-gray-500 ml-1">%</span></div>
            <div className="text-xs text-gray-400 mt-1">{doneTasks}/{totalTasks} 完成</div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm">💰 预算</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">¥{(remaining / 10000).toFixed(1)}<span className="text-sm font-normal text-gray-500 ml-1">万</span></div>
            <div className="text-xs text-gray-400 mt-1">剩余 / 总 ¥{(totalBudget / 10000).toFixed(1)}万</div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm">👥 来宾</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.guests.length}<span className="text-sm font-normal text-gray-500 ml-1">人</span></div>
            <div className="text-xs text-gray-400 mt-1">{data.guests.filter(g => g.rsvp === 'attending').length} 人已确认</div>
          </div>
        </div>
      </div>
    </div>
  );
}
