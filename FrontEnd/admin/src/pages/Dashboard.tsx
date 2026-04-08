import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Zap,
  FileText,
  MessageSquare,
  Globe
} from 'lucide-react';
import { adminApi } from '../api/api';

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        if (res.success) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Tổng người dùng', value: statsData?.totalUsers?.toLocaleString() || '0', icon: <Users size={24} />, color: '#6366f1' },
    { title: 'Bộ Flashcard', value: statsData?.totalFlashcardSets?.toLocaleString() || '0', icon: <Zap size={24} />, color: '#10b981' },
    { title: 'Tổng số từ vựng', value: statsData?.totalWords?.toLocaleString() || '0', icon: <BookOpen size={24} />, color: '#f59e0b' },
    { title: 'Truyện chêm', value: statsData?.totalStoryLessons?.toLocaleString() || '0', icon: <FileText size={24} />, color: '#ef4444' },
    { title: 'Luyện nghe', value: statsData?.totalListeningLessons?.toLocaleString() || '0', icon: <MessageSquare size={24} />, color: '#8b5cf6' },
    { title: 'Song ngữ', value: statsData?.totalBilingualLessons?.toLocaleString() || '0', icon: <Globe size={24} />, color: '#ec4899' },
  ];

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1 className="page-title">Trang chủ Thống kê</h1>
        <p className="page-subtitle">Tổng quan về hoạt động của ứng dụng MemoFlow</p>
      </header>

      <section className="stats-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon gray"></div>
              <div className="stat-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <span className="stat-label">{stat.title}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))
        )}
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

        .skeleton-line {
          height: 20px;
          width: 100px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-line.short {
          height: 14px;
          width: 60px;
          margin-bottom: 8px;
        }

        .skeleton-line::after {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.5s infinite;
        }

        .stat-icon.gray {
          background-color: rgba(255,255,255,0.05);
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
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
