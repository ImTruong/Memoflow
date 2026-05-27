import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users, 
  LogOut, 
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Zap,
  BookOpenCheck,
  Gamepad2,
  Headphones,
} from 'lucide-react';

// Sidebar dieu huong chinh cua admin web.
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [vocabOpen, setVocabOpen] = React.useState(false);

  // Cac menu cap cao khong thuoc nhom tu vung.
  const menuItems = [
    { title: 'Thống kê', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Người dùng', icon: <Users size={20} />, path: '/users' },
    { title: 'Luyện nghe', icon: <Headphones size={20}/>, path: '/listening' },
  ];

  // Cac menu quan ly noi dung tu vung, bao gom phan tinh nang ca nhan phu trach.
  const vocabItems = [
    { title: 'Flashcards', icon: <Zap size={18} />, path: '/vocab/flashcards' },
    { title: 'Truyện chêm', icon: <BookOpenCheck size={18} />, path: '/vocab/story-lessons' },
    { title: 'Đua từ với Bot', icon: <Gamepad2 size={18} />, path: '/vocab/word-race' },
    { title: 'Tinh mắt tìm từ', icon: <Gamepad2 size={18} />, path: '/vocab/word-hunt' },
    { title: 'Song ngữ', icon: <BookOpen size={18} />, path: '/vocab/bilingual' },
  ];

  // Dang xuat admin bang cach xoa token local va quay ve login.
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">MF</div>
        <span className="brand-name">MemoFlow Admin</span>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}

        <div className={`nav-dropdown ${vocabOpen ? 'open' : ''}`}>
          <div 
            className="nav-item dropdown-toggle" 
            onClick={() => setVocabOpen(!vocabOpen)}
          >
            <BookOpen size={20} />
            <span>Quản lý từ vựng</span>
            <div className="chevron">
              {vocabOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </div>
          
          <div className="dropdown-content">
            {vocabItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--bg-sidebar);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          flex-shrink: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
          margin-bottom: 40px;
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .brand-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .nav-item.active {
          background-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .sidebar-footer {
          padding: 0 12px;
          margin-top: auto;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: var(--danger);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          font-family: inherit;
          font-size: 1rem;
          text-align: left;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        .nav-dropdown {
          display: flex;
          flex-direction: column;
        }

        .dropdown-toggle {
          cursor: pointer;
          user-select: none;
        }

        .dropdown-toggle .chevron {
          margin-left: auto;
          color: var(--text-secondary);
        }

        .dropdown-content {
          height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-dropdown.open .dropdown-content {
          height: auto;
          padding-bottom: 8px;
        }

        .sub-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .sub-nav-item:hover {
          background-color: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .sub-nav-item.active {
          color: var(--primary);
          background-color: rgba(99, 102, 241, 0.05);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
