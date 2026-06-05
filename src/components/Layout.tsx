import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { WeddingData } from '../types';
import { loadData, saveData } from '../lib/data';
import { isSupabaseConfigured, syncToSupabase, loadFromSupabase } from '../lib/supabase';
import Header from './Header';
import MobileNav from './MobileNav';

export default function Layout() {
  const [data, setData] = useState<WeddingData>(loadData);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 尝试从 Supabase 加载（如果已配置）
  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadFromSupabase(data.settings.projectId).then(remote => {
        if (remote) {
          setData(remote);
          saveData(remote);
        }
      });
    }
  }, []);

  const handleUpdate = (newData: WeddingData) => {
    setData(newData);
    saveData(newData);
    // 后台同步到 Supabase
    if (isSupabaseConfigured()) {
      syncToSupabase(newData, newData.settings.projectId);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f3 0%, #f5f2eb 100%)' }}>
      <Header data={data} />

      <div className="max-w-7xl mx-auto px-4 py-6" style={{ paddingBottom: isMobile ? '5rem' : '2rem' }}>
        {/* 顶部导航栏（桌面端） */}
        {!isMobile && (
          <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  location.pathname === item.path || (item.path === '/board' && location.pathname === '/')
                    ? 'text-white shadow-md'
                    : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200/60'
                }`}
                style={
                  location.pathname === item.path || (item.path === '/board' && location.pathname === '/')
                    ? { background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)' }
                    : {}
                }
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* 页面内容 */}
        <div className="animate-fade-in">
          <Outlet context={{ data, onUpdate: handleUpdate }} />
        </div>
      </div>

      {/* 移动端底部导航 */}
      {isMobile && <MobileNav />}
    </div>
  );
}

const navItems = [
  { path: '/board', label: '任务看板', icon: '📋' },
  { path: '/budget', label: '预算', icon: '💰' },
  { path: '/guests', label: '来宾', icon: '👥' },
  { path: '/seats', label: '座位', icon: '🪑' },
  { path: '/timeline', label: '日程', icon: '📅' },
  { path: '/vendors', label: '供应商', icon: '🤝' },
  { path: '/music', label: '音乐', icon: '🎵' },
  { path: '/gifts', label: '礼物', icon: '🎁' },
  { path: '/photos', label: '照片', icon: '📷' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];
