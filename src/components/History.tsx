import { Clock, User } from 'lucide-react';
import type { WeddingData } from '../types';

interface Props {
  data: WeddingData;
}

export default function History({ data }: Props) {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">📜 改动历史</h2>
        <span className="text-sm text-gray-500">最近 100 条记录</span>
      </div>

      <div className="card">
        {data.history.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无记录</p>
        ) : (
          <div className="space-y-3">
            {data.history.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{entry.user}</span>
                    <span className="text-sm text-gray-500">{entry.action}</span>
                    <span className="font-medium text-sm text-gray-800">{entry.item}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
