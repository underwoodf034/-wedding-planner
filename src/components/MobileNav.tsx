import { useLocation, useNavigate } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: '/board', label: '看板', icon: '📋' },
    { path: '/budget', label: '预算', icon: '💰' },
    { path: '/guests', label: '来宾', icon: '👥' },
    { path: '/timeline', label: '日程', icon: '📅' },
    { path: '/settings', label: '更多', icon: '⚙️' },
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {items.map(item => {
          const isActive = location.pathname === item.path || (item.path === '/board' && location.pathname === '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
