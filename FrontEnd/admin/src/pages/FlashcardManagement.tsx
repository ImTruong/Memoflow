import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Eye,
  Zap,
  RefreshCw,
  X,
  AlertCircle,
  User,
  LayoutGrid
} from 'lucide-react';
import { adminApi } from '../api/api';

interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  creatorName: string;
  totalWords: number;
  createdAt?: string;
}

interface Word {
  id: number;
  name: string;
  meaning: string;
  exampleSentence?: string;
  imageUrl?: string;
}

const FlashcardManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getFlashcards();
      if (res.success) {
        setFlashcards(res.data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch flashcards', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWords = async (setId: number) => {
    try {
      setLoadingWords(true);
      const res = await adminApi.getFlashcardWords(setId);
      if (res.success) {
        setWords(res.data.words?.content || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch words', error);
      alert('Lỗi truy cập chi tiết: ' + (error.response?.data?.message || 'Có thể bạn cần đăng nhập lại với tư cách Admin.'));
    } finally {
      setLoadingWords(false);
    }
  };

  const handleDeleteSet = async () => {
    if (selectedSet) {
      try {
        const res = await adminApi.deleteFlashcard(selectedSet.id);
        if (res.success) {
          setFlashcards(flashcards.filter(f => f.id !== selectedSet.id));
          setShowDeleteModal(false);
          setSelectedSet(null);
        }
      } catch (error: any) {
        alert('Lỗi khi xoá bộ flashcard này: ' + (error.response?.data?.message || 'Lỗi hệ thống.'));
      }
    }
  };

  const handleViewWords = (set: FlashcardSet) => {
    setSelectedSet(set);
    fetchWords(set.id);
    setShowWordsModal(true);
  };

  const filteredSets = flashcards.filter(set => 
    set.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý Flashcards</h1>
          <p className="page-subtitle">Quản lý và kiểm soát toàn bộ kho từ vựng của cộng đồng</p>
        </div>
        <button className="refresh-btn" onClick={fetchFlashcards} disabled={loading}>
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
              placeholder="Tìm kiếm theo tên bộ hoặc người tạo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={32} className="spinning" />
            <p>Đang tải danh sách flashcard...</p>
          </div>
        ) : (
          <div className="grid-layout">
            {filteredSets.length > 0 ? (
              filteredSets.map((set) => (
                <div key={set.id} className="card-item">
                  <div className="card-image-wrap">
                    {set.imageUrl ? (
                      <img src={set.imageUrl} alt={set.title} />
                    ) : (
                      <div className="card-placeholder">
                        <Zap size={32} color="rgba(255,255,255,0.2)" />
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{set.title}</h3>
                    <p className="card-desc">{set.description || 'Không có mô tả'}</p>
                    
                    <div className="card-meta">
                      <div className="meta-item">
                        <User size={14} />
                        <span>{set.creatorName}</span>
                      </div>
                      <div className="meta-item">
                        <LayoutGrid size={14} />
                        <span>{set.totalWords} từ</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="action-btn view" onClick={() => handleViewWords(set)}>
                      <Eye size={16} />
                      <span>Chi tiết</span>
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => { setSelectedSet(set); setShowDeleteModal(true); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} color="rgba(255,255,255,0.1)" />
                <p>Không tìm thấy bộ flashcard nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WORDS MODAL */}
      {showWordsModal && selectedSet && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon primary">
                  <Zap size={24} color="#6366f1" />
                </div>
                <div>
                  <h3 className="modal-title">Chi tiết từ vựng</h3>
                  <p className="modal-subtitle">{selectedSet.title} • {selectedSet.totalWords} từ</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowWordsModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body scrollable">
              {loadingWords ? (
                <div className="words-loading">
                  <RefreshCw size={24} className="spinning" />
                  <span>Đang tải danh sách từ...</span>
                </div>
              ) : (
                <div className="words-list">
                  {words.length > 0 ? (
                    words.map((word) => (
                      <div key={word.id} className="word-item">
                        <div className="word-preview">
                          {word.imageUrl ? (
                            <img src={word.imageUrl} alt={word.name} />
                          ) : (
                            <div className="word-no-img">{word.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="word-main">
                          <div className="word-name">{word.name}</div>
                          <div className="word-meaning">{word.meaning}</div>
                        </div>
                        {word.exampleSentence && (
                          <div className="word-example">
                            <em>{word.exampleSentence}</em>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-words">Bộ này chưa có từ nào.</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowWordsModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedSet && (
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
              <h3>Xoá bộ flashcard?</h3>
              <p>Bạn có chắc chắn muốn xoá bộ <strong>{selectedSet.title}</strong>? Thao tác này sẽ xoá toàn bộ từ vựng và lịch sử học tập liên quan.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowDeleteModal(false)}>Huỷ</button>
              <button className="danger-btn" onClick={handleDeleteSet}>Xoá ngay</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-management {
          padding: 32px 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .refresh-btn {
          background-color: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.2);
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
          background-color: var(--primary);
          color: white;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .table-container {
          background-color: var(--bg-card);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          min-height: 300px;
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

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          padding: 24px;
        }

        .card-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .card-item:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          background-color: rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .card-image-wrap {
          height: 160px;
          width: 100%;
          background-color: rgba(0,0,0,0.2);
          position: relative;
        }

        .card-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-body {
          padding: 20px;
          flex: 1;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: white;
        }

        .card-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .card-meta {
          display: flex;
          gap: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .card-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          gap: 8px;
        }

        .action-btn {
          height: 40px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .action-btn.view {
          flex: 1;
          background-color: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          gap: 8px;
        }

        .action-btn.view:hover {
          background-color: var(--primary);
          color: white;
        }

        .action-btn.delete {
          width: 40px;
          background-color: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .action-btn.delete:hover {
          background-color: var(--danger);
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
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

        .modal-card.wide {
          max-width: 800px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .modal-title-area {
          display: flex;
          gap: 16px;
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

        .modal-title { font-size: 1.4rem; margin-bottom: 4px; }
        .modal-subtitle { color: var(--text-secondary); font-size: 0.9rem; }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .modal-body.scrollable {
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 8px;
        }

        .words-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .word-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .word-preview {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
        }

        .word-main { flex: 1; }
        .word-name { font-weight: 700; color: white; }
        .word-meaning { font-size: 0.9rem; color: var(--text-secondary); }

        .modal-footer {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
        }

        .secondary-btn, .danger-btn {
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .secondary-btn {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .danger-btn {
          background: var(--danger);
          color: white;
          border: none;
          margin-left: 12px;
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

export default FlashcardManagement;
