import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Key, 
  Shield,
  Calendar,
  X,
  AlertCircle,
  RefreshCw,
  UserCog
} from 'lucide-react';
import { adminApi } from '../api/api';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string | { name: string; id: number };
  dateOfBirth?: string;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: any) => {
    if (typeof role === 'string') return role;
    return role?.name || 'User';
  };

  const filteredUsers = (users || []).filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await adminApi.deleteUser(selectedUser.id.toString());
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } catch (error) {
        alert('Không thể xoá người dùng này.');
      }
    }
  };

  const handleChangePassword = async () => {
    if (selectedUser && newPassword) {
      try {
        await adminApi.changePassword(selectedUser.id.toString(), newPassword);
        setNewPassword('');
        setShowPasswordModal(false);
        setSelectedUser(null);
        alert('Đổi mật khẩu thành công!');
      } catch (error) {
        alert('Lỗi khi đổi mật khẩu.');
      }
    }
  };

  const handleUpdateRole = async (newRole: 'Admin' | 'User') => {
    if (selectedUser) {
      const roleId = newRole === 'Admin' ? 2 : 1;
      try {
        await adminApi.changeRole(selectedUser.id.toString(), roleId);
        fetchUsers(); // Refresh list to see updated role
        setShowRoleModal(false);
        setSelectedUser(null);
      } catch (error) {
        alert('Lỗi khi cập nhật vai trò.');
      }
    }
  };

  return (
    <div className="user-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý Người dùng</h1>
          <p className="page-subtitle">Kiểm soát và phân quyền người dùng từ dữ liệu thực tế</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          <span>Làm mới</span>
        </button>
      </header>

      <div className="table-container">
        <div className="table-header-tools">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={32} className="spinning" />
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Ngày sinh</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const roleName = getRoleName(user.role);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="avatar-img" />
                            ) : (
                                user.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${roleName.replace('ROLE_', '').toLowerCase()}`}>
                          {roleName.includes('ADMIN') ? <Shield size={12} /> : null}
                          {roleName.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14} />
                          {user.dateOfBirth || 'Chưa cập nhật'}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="icon-btn" 
                          onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                          title="Sửa vai trò"
                        >
                          <UserCog size={18} />
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                          title="Đổi mật khẩu"
                        >
                          <Key size={18} />
                        </button>
                        <button 
                          className="icon-btn danger" 
                          onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                          title="Xoá người dùng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Không tìm thấy người dùng phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon warning">
                <AlertCircle size={24} color="#ef4444" />
              </div>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>Xoá người dùng?</h3>
              <p>Bạn có chắc chắn muốn xoá người dùng <strong>{selectedUser.name}</strong>? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowDeleteModal(false)}>Huỷ</button>
              <button className="danger-btn" onClick={handleDeleteUser}>Xoá ngay</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon primary">
                <Key size={24} color="#6366f1" />
              </div>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>Đổi mật khẩu</h3>
              <p>Đặt lại mật khẩu mới cho người dùng <strong>{selectedUser.name}</strong></p>
              <div className="input-group">
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu mới..." 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowPasswordModal(false)}>Huỷ</button>
              <button className="primary-btn" onClick={handleChangePassword}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon primary">
                <UserCog size={24} color="#6366f1" />
              </div>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>Sửa vai trò</h3>
              <p>Thay đổi quyền hạn cho <strong>{selectedUser.name}</strong></p>
              <div className="role-options">
                <button 
                  className={`role-option ${getRoleName(selectedUser.role).includes('ADMIN') ? 'active' : ''}`}
                  onClick={() => handleUpdateRole('Admin')}
                >
                  <Shield size={18} />
                  <span>Quản trị viên (Admin)</span>
                </button>
                <button 
                  className={`role-option ${!getRoleName(selectedUser.role).includes('ADMIN') ? 'active' : ''}`}
                  onClick={() => handleUpdateRole('User')}
                >
                  <span>Người dùng thường (User)</span>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowRoleModal(false)}>Huỷ</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-management {
          padding: 32px 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .refresh-btn {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .primary-btn {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .primary-btn:hover {
          background-color: var(--primary-hover);
        }

        .secondary-btn {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        .secondary-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .danger-btn {
          background-color: var(--danger);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        .danger-btn:hover {
          background-color: var(--danger-hover);
        }

        .table-container {
          background-color: var(--bg-card);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          min-height: 300px;
        }

        .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: var(--text-secondary);
          gap: 16px;
        }

        .table-header-tools {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .search-bar {
          position: relative;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-bar input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background-color: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .search-bar input:focus {
          border-color: var(--primary);
          background-color: rgba(0,0,0,0.3);
          outline: none;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
        }

        .user-table th {
          text-align: left;
          padding: 16px 24px;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 1px;
          background-color: rgba(0,0,0,0.1);
        }

        .user-table td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background-color: #4338ca;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .user-email {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .role-badge.user {
          background-color: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
        }

        .role-badge.admin {
          background-color: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .actions-cell {
          text-align: right;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .icon-btn.danger:hover {
          color: var(--danger);
          background-color: rgba(239, 68, 68, 0.1);
        }

        .empty-row {
          text-align: center;
          padding: 60px !important;
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .text-right { text-align: right; }

        /* MODALS */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-card {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-icon.warning { background-color: rgba(239, 68, 68, 0.15); }
        .modal-icon.primary { background-color: rgba(99, 102, 241, 0.15); }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .modal-body h3 {
          font-size: 1.4rem;
          margin-bottom: 12px;
        }

        .modal-body p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .input-group input {
          background-color: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 8px;
          color: white;
        }

        .role-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .role-option:hover {
          background-color: rgba(255,255,255,0.08);
        }

        .role-option.active {
          border-color: var(--primary);
          background-color: rgba(99, 102, 241, 0.1);
        }

        .modal-footer {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
