import { useOutletContext } from 'react-router-dom';
import { History, Clock, User } from 'lucide-react';
import type { WeddingData } from '../types';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function HistoryPage() {
  const { data } = useOutletContext<OutletContext>();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>改动历史</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>共 {data.history.length} 条操作记录</p>
      </div>

      <div className="card">
        <div className="space-y-0">
          {data.history.map((entry, index) => (
            <div key={entry.id} className="timeline-item">
              <div className="timeline-dot" style={{ background: index < 3 ? 'var(--color-accent)' : 'var(--color-sage)' }} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-green text-xs">{entry.action}</span>
                    <span className="font-medium text-sm">{entry.item}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {entry.user}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.history.length === 0 && (
          <div className="text-center py-8">
            <History className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-sage)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无操作记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
