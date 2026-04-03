import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import FlashcardManagement from './pages/FlashcardManagement';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="admin-layout">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
                  <Sidebar />
                  <main className="admin-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/vocab/flashcards" element={<FlashcardManagement />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>

        <style>{`
          .admin-layout {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background-color: var(--bg-main);
          }

          .admin-content {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-main);
          }
        `}</style>
      </div>
    </Router>
  );
};

export default App;
