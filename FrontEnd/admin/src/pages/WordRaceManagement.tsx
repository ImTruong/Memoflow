import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2, RefreshCw, X, AlertCircle, Eye, Zap } from 'lucide-react';
import { adminApi } from '../api/api';
import type { WordRaceLessonPayload } from '../api/api';

type WordRaceItem = {
  id?: number;
  title?: string;
  description?: string;
  learningActivityId?: number;
  content?: unknown;
};

type WordRaceRecord = {
  id: number;
  title: string;
  description: string;
  learningActivityId: number;
  targetScore: number;
  timeLimit: number;
  forbiddenEndings: string[];
};

type WordRaceFormState = {
  title: string;
  description: string;
  targetScore: number;
  timeLimit: number;
  forbiddenEndings: string[];
  endingInput: string;
};

type Notice = {
  type: 'success' | 'error';
  text: string;
};

const DEFAULT_WORD_RACE_ACTIVITY_ID = 4;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumberOr = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const parseForbiddenEndings = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  value.forEach((item) => {
    if (typeof item !== 'string') {
      return;
    }

    const clean = item.trim().toLowerCase();
    if (clean) {
      unique.add(clean);
    }
  });

  return Array.from(unique);
};

const normalizeEnding = (value: string): string => value.trim().toLowerCase();

const mapToWordRaceRecord = (item: WordRaceItem): WordRaceRecord => {
  const content = isRecord(item.content) ? item.content : {};

  return {
    id: Number(item.id ?? 0),
    title: item.title ?? 'Không có tiêu đề',
    description: item.description ?? '',
    learningActivityId: Number(item.learningActivityId ?? DEFAULT_WORD_RACE_ACTIVITY_ID),
    targetScore: toNumberOr(content.targetScore, 40),
    timeLimit: toNumberOr(content.timeLimit, 20),
    forbiddenEndings: parseForbiddenEndings(content.forbiddenEndings),
  };
};

const buildDefaultForm = (): WordRaceFormState => ({
  title: '',
  description: '',
  targetScore: 40,
  timeLimit: 20,
  forbiddenEndings: [],
  endingInput: '',
});

const mapToForm = (record: WordRaceRecord): WordRaceFormState => ({
  title: record.title,
  description: record.description,
  targetScore: record.targetScore,
  timeLimit: record.timeLimit,
  forbiddenEndings: record.forbiddenEndings,
  endingInput: '',
});

const WordRaceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<WordRaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WordRaceRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WordRaceRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formState, setFormState] = useState<WordRaceFormState>(buildDefaultForm());

  const fetchRecords = useCallback(async (targetPage: number) => {
    try {
      setRefreshing(true);

      const response = await adminApi.getWordRaceLessons(targetPage, size);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được game Đua từ với Bot');
      }

      const pageData = response.data as {
        content?: WordRaceItem[];
        totalElements?: number;
        totalPages?: number;
      };

      const content = Array.isArray(pageData.content) ? pageData.content : [];
      const mapped = content.map(mapToWordRaceRecord).filter((item) => item.id > 0);

      setRecords(mapped);
      setTotalElements(Number(pageData.totalElements ?? mapped.length));
      setTotalPages(Math.max(1, Number(pageData.totalPages ?? 1)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải dữ liệu Word Race';
      setNotice({ type: 'error', text: message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [size]);

  useEffect(() => {
    void fetchRecords(page);
  }, [fetchRecords, page]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return records;
    }

    return records.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.forbiddenEndings.join(' ').toLowerCase().includes(keyword)
      );
    });
  }, [records, searchTerm]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(buildDefaultForm());
    setShowFormModal(true);
  };

  const openEditModal = async (record: WordRaceRecord) => {
    setEditingRecord(record);
    setShowFormModal(true);
    setFormLoading(true);

    try {
      const response = await adminApi.getWordRaceLessonDetail(record.id);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được chi tiết game');
      }

      const detail = mapToWordRaceRecord(response.data as WordRaceItem);
      setFormState(mapToForm(detail));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải chi tiết game';
      setNotice({ type: 'error', text: message });
      setFormState(mapToForm(record));
    } finally {
      setFormLoading(false);
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingRecord(null);
    setFormState(buildDefaultForm());
  };

  const addForbiddenEnding = (value: string) => {
    const ending = normalizeEnding(value);
    if (!ending) {
      return;
    }

    setFormState((prev) => {
      if (prev.forbiddenEndings.some((item) => item === ending)) {
        return { ...prev, endingInput: '' };
      }

      return {
        ...prev,
        forbiddenEndings: [...prev.forbiddenEndings, ending],
        endingInput: '',
      };
    });
  };

  const removeForbiddenEnding = (ending: string) => {
    setFormState((prev) => ({
      ...prev,
      forbiddenEndings: prev.forbiddenEndings.filter((item) => item !== ending),
    }));
  };

  const handleEndingKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    addForbiddenEnding(formState.endingInput);
  };

  const buildPayload = (): WordRaceLessonPayload | null => {
    const title = formState.title.trim();
    if (!title) {
      setNotice({ type: 'error', text: 'Tiêu đề game là bắt buộc.' });
      return null;
    }

    const targetScore = Math.max(1, Math.floor(formState.targetScore));
    const timeLimit = Math.max(3, Math.floor(formState.timeLimit));

    return {
      title,
      description: formState.description.trim() || undefined,
      targetScore,
      timeLimit,
      forbiddenEndings: formState.forbiddenEndings,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingRecord) {
        const response = await adminApi.updateWordRaceLesson(editingRecord.id, payload);
        if (!response.success) {
          throw new Error(response.message || 'Không thể cập nhật game Đua từ với Bot');
        }
        setNotice({ type: 'success', text: 'Đã cập nhật game Đua từ với Bot.' });
      } else {
        const response = await adminApi.createWordRaceLesson(DEFAULT_WORD_RACE_ACTIVITY_ID, payload);
        if (!response.success) {
          throw new Error(response.message || 'Không thể tạo game Đua từ với Bot');
        }
        setNotice({ type: 'success', text: 'Đã tạo game Đua từ với Bot.' });
      }

      closeFormModal();
      await fetchRecords(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi lưu dữ liệu Word Race';
      setNotice({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await adminApi.deleteWordRaceLesson(selectedRecord.id);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xoá game Đua từ với Bot');
      }

      setNotice({ type: 'success', text: 'Đã xoá game Đua từ với Bot.' });
      setShowDeleteModal(false);
      setSelectedRecord(null);

      const shouldGoBack = records.length === 1 && page > 0;
      const nextPage = shouldGoBack ? page - 1 : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchRecords(page);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi xoá game';
      setNotice({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wordrace-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý game Đua từ với Bot</h1>
          <p className="page-subtitle">CRUD bộ luật Word Race: target score, time limit, forbidden endings</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={() => void fetchRecords(page)} disabled={refreshing || loading}>
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="primary-btn" onClick={openCreateModal}>
            <Zap size={18} />
            <span>Tạo game mới</span>
          </button>
        </div>
      </header>

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}

      <div className="table-container">
        <div className="table-header-tools">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên game hoặc từ cấm kết thúc..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="summary">
            Tổng: <strong>{totalElements}</strong> game
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={30} className="spinning" />
            <p>Đang tải danh sách game...</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên game</th>
                  <th>Target Score</th>
                  <th>Time Limit (s)</th>
                  <th>Forbidden Endings</th>
                  <th>Activity ID</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="title-cell">
                          <strong>{record.title}</strong>
                          <span>{record.description || 'Không có mô tả'}</span>
                        </div>
                      </td>
                      <td>{record.targetScore}</td>
                      <td>{record.timeLimit}</td>
                      <td>{record.forbiddenEndings.length > 0 ? record.forbiddenEndings.join(', ') : 'Không có'}</td>
                      <td>{record.learningActivityId}</td>
                      <td className="actions-cell">
                        <button className="icon-btn" onClick={() => void openEditModal(record)}>
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      Không có game nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button disabled={page <= 0} onClick={() => setPage((prev) => Math.max(0, prev - 1))}>
                Trang trước
              </button>
              <span>
                Trang {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Trang sau
              </button>
            </div>
          </>
        )}
      </div>

      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon primary">
                  <Zap size={20} color="#6366f1" />
                </div>
                <div>
                  <h3>{editingRecord ? 'Cập nhật game Đua từ với Bot' : 'Tạo game Đua từ với Bot'}</h3>
                  <p>Payload khớp UpsertWordRaceLessonRequest</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeFormModal}>
                <X size={18} />
              </button>
            </div>

            {formLoading ? (
              <div className="modal-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Đang tải chi tiết game...</span>
              </div>
            ) : (
              <div className="modal-body">
                <div className="input-group">
                  <label>Tiêu đề game</label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Ví dụ: Chạy đua tử thần"
                  />
                </div>

                <div className="input-group">
                  <label>Mô tả</label>
                  <textarea
                    rows={2}
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Mô tả luật chơi"
                  />
                </div>

                <div className="input-group two-col">
                  <div>
                    <label>Target Score</label>
                    <input
                      type="number"
                      min={1}
                      value={formState.targetScore}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, targetScore: Number(event.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div>
                    <label>Time Limit (giây)</label>
                    <input
                      type="number"
                      min={3}
                      value={formState.timeLimit}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, timeLimit: Number(event.target.value) || 3 }))
                      }
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Forbidden Endings (nhập hậu tố rồi Enter)</label>
                  <input
                    type="text"
                    value={formState.endingInput}
                    onChange={(event) => setFormState((prev) => ({ ...prev, endingInput: event.target.value }))}
                    onKeyDown={handleEndingKeyDown}
                    onBlur={() => addForbiddenEnding(formState.endingInput)}
                    placeholder="Ví dụ: ing"
                  />
                  <div className="token-list">
                    {formState.forbiddenEndings.map((ending) => (
                      <span key={ending} className="token-chip">
                        {ending}
                        <button
                          type="button"
                          className="token-remove"
                          onClick={() => removeForbiddenEnding(ending)}
                          aria-label={`Xoá hậu tố ${ending}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="secondary-btn" onClick={closeFormModal} disabled={submitting}>
                Huỷ
              </button>
              <button className="primary-btn" onClick={() => void handleSubmit()} disabled={submitting || formLoading}>
                {submitting ? 'Đang lưu...' : editingRecord ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon warning">
                <AlertCircle size={20} color="#ef4444" />
              </div>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h3>Xoá game?</h3>
              <p>
                Bạn có chắc muốn xoá <strong>{selectedRecord.title}</strong>?
              </p>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowDeleteModal(false)} disabled={submitting}>
                Huỷ
              </button>
              <button className="danger-btn" onClick={() => void handleDelete()} disabled={submitting}>
                Xoá ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wordrace-management {
          padding: 32px 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          gap: 12px;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .page-title {
          margin: 0;
          font-size: 1.9rem;
        }

        .page-subtitle {
          margin: 0;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .refresh-btn,
        .primary-btn,
        .secondary-btn,
        .danger-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          transition: all 0.2s;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .primary-btn {
          background: var(--primary);
          color: white;
        }

        .primary-btn:hover {
          background: var(--primary-hover);
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .danger-btn {
          background: var(--danger);
          color: #fff;
        }

        .notice {
          padding: 11px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        .notice.success {
          background: rgba(16, 185, 129, 0.18);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.34);
        }

        .notice.error {
          background: rgba(239, 68, 68, 0.16);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.34);
        }

        .table-container {
          background: var(--bg-card);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24);
        }

        .table-header-tools {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
        }

        .summary {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .summary strong {
          color: var(--text-primary);
        }

        .search-bar {
          position: relative;
          max-width: 420px;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-bar input {
          width: 100%;
          padding: 11px 12px 11px 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          font-family: inherit;
        }

        .search-bar input:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.7);
        }

        .table-loading {
          min-height: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text-secondary);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          text-align: left;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          vertical-align: top;
        }

        .data-table th {
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .title-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title-cell strong {
          color: #f8fafc;
          font-size: 0.95rem;
        }

        .title-cell span {
          color: #94a3b8;
          font-size: 0.82rem;
          line-height: 1.4;
        }

        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .icon-btn.danger {
          background: rgba(239, 68, 68, 0.16);
          color: #fecaca;
        }

        .icon-btn.danger:hover {
          background: rgba(239, 68, 68, 0.24);
        }

        .text-right {
          text-align: right;
        }

        .empty-row {
          text-align: center;
          color: var(--text-secondary);
          padding: 34px 0;
        }

        .pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding: 14px 20px 18px;
        }

        .pagination button {
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px 10px;
        }

        .pagination button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .pagination span {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.78);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 210;
          padding: 20px;
        }

        .modal-card {
          width: min(560px, 100%);
          background: #162036;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .modal-title-area {
          display: flex;
          gap: 10px;
        }

        .modal-title-area h3 {
          margin: 0;
          font-size: 1.04rem;
        }

        .modal-title-area p {
          margin: 3px 0 0;
          color: var(--text-secondary);
          font-size: 0.84rem;
        }

        .modal-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-icon.primary {
          background: rgba(99, 102, 241, 0.18);
        }

        .modal-icon.warning {
          background: rgba(239, 68, 68, 0.2);
        }

        .close-btn {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .modal-loading {
          min-height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text-secondary);
        }

        .modal-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-body h3 {
          margin: 0;
        }

        .modal-body p {
          margin: 0;
          color: var(--text-secondary);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group small {
          color: #94a3b8;
          font-size: 0.74rem;
        }

        .token-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          min-height: 28px;
        }

        .token-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.35);
          color: #c7d2fe;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 0.78rem;
        }

        .token-remove {
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1;
          padding: 0;
        }

        .input-group label {
          color: #cbd5e1;
          font-size: 0.84rem;
          font-weight: 600;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.22);
          color: var(--text-primary);
          font-family: inherit;
          padding: 10px 12px;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.7);
        }

        .two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .two-col > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 18px 18px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .wordrace-management {
            padding: 20px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .data-table {
            min-width: 700px;
          }

          .table-container {
            overflow-x: auto;
          }

          .two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WordRaceManagement;
