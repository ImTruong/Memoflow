import React from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Tổng người dùng', value: '1,234', icon: <Users size={24} />, color: '#6366f1' },
    { title: 'Bài học hoàn thành', value: '8,567', icon: <BookOpen size={24} />, color: '#10b981' },
    { title: 'Tỷ lệ tương tác', value: '+12.5%', icon: <TrendingUp size={24} />, color: '#f59e0b' },
    { title: 'Thời gian trung bình', value: '24m', icon: <Clock size={24} />, color: '#ef4444' },
  ];

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1 className="page-title">Trang chủ Thống kê</h1>
        <p className="page-subtitle">Tổng quan về hoạt động của ứng dụng MemoFlow</p>
      </header>

      <section className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="charts-placeholder">
        <div className="placeholder-card big">
          <h2>Biểu đồ Tăng trưởng</h2>
          <div className="chart-empty">
            <div className="loader-pulse"></div>
            <span>Đang thu thập dữ liệu thống kê...</span>
          </div>
        </div>
        
        <div className="placeholder-card small">
          <h2>Hoạt động gần đây</h2>
          <div className="activity-empty">
            <span>Chưa có hoạt động mới</span>
          </div>
        </div>
      </section>

      <style>{`
        .dashboard {
          padding: 32px 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background-color: var(--bg-card);
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .charts-placeholder {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .placeholder-card {
          background-color: var(--bg-card);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .placeholder-card h2 {
          font-size: 1.1rem;
          margin-bottom: 24px;
          color: var(--text-secondary);
        }

        .chart-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          border: 2px dashed rgba(255,255,255,0.05);
          border-radius: 12px;
        }

        .activity-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          opacity: 0.5;
        }

        .loader-pulse {
          width: 40px;
          height: 10px;
          background: var(--primary);
          border-radius: 5px;
          animation: pulse 1s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
