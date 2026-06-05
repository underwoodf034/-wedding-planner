import { useState, useEffect } from 'react';
import type { WeddingData } from '../types';
import { loadData } from '../lib/data';
import Header from './Header';
import KanbanBoard from './KanbanBoard';
import Budget from './Budget';
import GuestList from './GuestList';
import History from './History';

export default function Layout() {
  const [data, setData] = useState<WeddingData>(loadData);
  const [activeTab, setActiveTab] = useState<'board' | 'budget' | 'guests' | 'history'>('board');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const link = `${window.location.origin}?project=wedding-2027`;
    setInviteLink(link);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('邀请链接已复制！');
  };

  const tabs = [
    { id: 'board' as const, label: '📋 任务看板' },
    { id: 'budget' as const, label: '💰 预算管理' },
    { id: 'guests' as const, label: '👥 来宾管理' },
    { id: 'history' as const, label: '📜 改动历史' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header data={data} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Invite Banner */}
        <div className="card mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">💒 婚礼筹备协作空间</h2>
            <p className="text-sm text-gray-500 mt-1">婚礼日期：2027年5月15日 · 邀请家人一起规划</p>
          </div>
          <button onClick={copyLink} className="btn-primary flex items-center gap-2">
            🔗 复制邀请链接
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'board' && <KanbanBoard data={data} onUpdate={setData} />}
          {activeTab === 'budget' && <Budget data={data} onUpdate={setData} />}
          {activeTab === 'guests' && <GuestList data={data} onUpdate={setData} />}
          {activeTab === 'history' && <History data={data} />}
        </div>
      </div>
    </div>
  );
}
