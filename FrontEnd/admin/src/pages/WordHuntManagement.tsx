import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2, RefreshCw, X, AlertCircle, Eye, Zap } from 'lucide-react';
import { adminApi, wordValidationApi } from '../api/api';
import type { WordHuntLessonPayload } from '../api/api';

type WordHuntProgressItem = {
  id?: number;
  progressPercent?: number;
  isCompleted?: boolean;
  learningLesson?: {
    id?: number;
    title?: string;
    description?: string;
    learningActivityId?: number;
    content?: unknown;
  };
};

type WordHuntRecord = {
  id: number;
  title: string;
  description: string;
  learningActivityId: number;
  progressPercent: number;
  isCompleted: boolean;
  content: {
    categoryKey: string;
    categoryLabel: string;
    boardSize: number;
    timeLimitSeconds: number;
    targetWordCount: number;
    maxHintsPerDay: number;
    objectiveText: string;
    unlockRequirementText: string;
    words: string[];
  };
};

type WordHuntFormState = {
  title: string;
  categoryLabel: string;
  boardSize: number;
  timeLimitSeconds: number;
  targetWordCount: number;
  maxHintsPerDay: number;
  objectiveText: string;
  unlockRequirementText: string;
  words: string[];
  wordInput: string;
};

type Notice = {
  type: 'success' | 'error';
  text: string;
};

const DEFAULT_WORD_HUNT_ACTIVITY_ID = 5;

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

const parseWords = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();
  value.forEach((item) => {
    if (typeof item !== 'string') {
      return;
    }

    const clean = item.trim().toUpperCase();
    if (clean) {
      unique.add(clean);
    }
  });

  return Array.from(unique);
};

const normalizeWord = (value: string): string => value.trim().toUpperCase();

const toCategoryKey = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const mapToRecord = (item: WordHuntProgressItem): WordHuntRecord => {
  const lesson = item.learningLesson;
  const content = isRecord(lesson?.content) ? lesson.content : {};

  return {
    id: Number(lesson?.id ?? item.id ?? 0),
    title: lesson?.title ?? 'Không có tiêu đề',
    description: lesson?.description ?? '',
    learningActivityId: Number(lesson?.learningActivityId ?? DEFAULT_WORD_HUNT_ACTIVITY_ID),
    progressPercent: Number(item.progressPercent ?? 0),
    isCompleted: Boolean(item.isCompleted),
    content: {
      categoryKey: typeof content.categoryKey === 'string' ? content.categoryKey : 'topic',
      categoryLabel: typeof content.categoryLabel === 'string' ? content.categoryLabel : 'Chủ đề',
      boardSize: toNumberOr(content.boardSize, 8),
      timeLimitSeconds: toNumberOr(content.timeLimitSeconds, 105),
      targetWordCount: toNumberOr(content.targetWordCount, 5),
      maxHintsPerDay: toNumberOr(content.maxHintsPerDay, 3),
      objectiveText: typeof content.objectiveText === 'string' ? content.objectiveText : 'Mục tiêu: tìm đủ từ',
      unlockRequirementText: typeof content.unlockRequirementText === 'string' ? content.unlockRequirementText : '',
      words: parseWords(content.words),
    },
  };
};

const buildDefaultForm = (): WordHuntFormState => ({
  title: '',
  categoryLabel: 'Chủ đề tổng hợp',
  boardSize: 8,
  timeLimitSeconds: 105,
  targetWordCount: 5,
  maxHintsPerDay: 3,
  objectiveText: 'Mục tiêu: tìm đủ 5 từ',
  unlockRequirementText: '',
  words: [],
  wordInput: '',
});

const mapToForm = (record: WordHuntRecord): WordHuntFormState => ({
  title: record.title,
  categoryLabel: record.content.categoryLabel,
  boardSize: record.content.boardSize,
  timeLimitSeconds: record.content.timeLimitSeconds,
  targetWordCount: record.content.targetWordCount,
  maxHintsPerDay: record.content.maxHintsPerDay,
  objectiveText: record.content.objectiveText,
  unlockRequirementText: record.content.unlockRequirementText,
  words: record.content.words,
  wordInput: '',
});

const WordHuntManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<WordHuntRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WordHuntRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WordHuntRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingWord, setValidatingWord] = useState(false);

  const [formState, setFormState] = useState<WordHuntFormState>(buildDefaultForm());

  const fetchRecords = useCallback(async (targetPage: number) => {
    try {
      setRefreshing(true);

      const response = await adminApi.getWordHuntLessons(targetPage, size);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được game Tinh mắt tìm từ');
      }

      const pageData = response.data as {
        content?: WordHuntProgressItem[];
        totalElements?: number;
        totalPages?: number;
      };

      const content = Array.isArray(pageData.content) ? pageData.content : [];
      const mapped = content.map(mapToRecord).filter((item) => item.id > 0);

      setRecords(mapped);
      setTotalElements(Number(pageData.totalElements ?? mapped.length));
      setTotalPages(Math.max(1, Number(pageData.totalPages ?? 1)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải dữ liệu Word Hunt';
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
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return records;
    }

    return records.filter((record) => {
      return (
        record.title.toLowerCase().includes(keyword) ||
        record.description.toLowerCase().includes(keyword) ||
        record.content.categoryLabel.toLowerCase().includes(keyword) ||
        record.content.words.join(' ').toLowerCase().includes(keyword)
      );
    });
  }, [records, searchTerm]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(buildDefaultForm());
    setShowFormModal(true);
  };

  const openEditModal = async (record: WordHuntRecord) => {
    setEditingRecord(record);
    setShowFormModal(true);
    setFormLoading(true);

    try {
      const response = await adminApi.getWordHuntLessonDetail(record.id);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được chi tiết Word Hunt');
      }

      const detail = mapToRecord(response.data as WordHuntProgressItem);
      setFormState(mapToForm(detail));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải chi tiết Word Hunt';
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

  const addWord = async (value: string) => {
    const word = normalizeWord(value);
    if (!word) {
      return;
    }

    if (formState.words.includes(word)) {
      setFormState((prev) => ({ ...prev, wordInput: '' }));
      return;
    }

    setValidatingWord(true);

    const isEnglishWord = await wordValidationApi.isEnglishWord(word);
    if (!isEnglishWord) {
      setNotice({ type: 'error', text: `"${word}" không phải từ tiếng Anh hợp lệ.` });
      setFormState((prev) => ({ ...prev, wordInput: '' }));
      setValidatingWord(false);
      return;
    }

    setFormState((prev) => {
      if (prev.words.includes(word)) {
        return { ...prev, wordInput: '' };
      }

      const nextWords = [...prev.words, word];

      return {
        ...prev,
        words: nextWords,
        wordInput: '',
        targetWordCount: Math.min(Math.max(1, prev.targetWordCount), nextWords.length),
      };
    });

    setValidatingWord(false);
  };

  const removeWord = (word: string) => {
    setFormState((prev) => ({
      ...prev,
      words: prev.words.filter((item) => item !== word),
      targetWordCount: Math.min(
        Math.max(1, prev.targetWordCount),
        Math.max(1, prev.words.filter((item) => item !== word).length),
      ),
    }));
  };

  const handleWordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void addWord(formState.wordInput);
  };

  const buildPayload = (): WordHuntLessonPayload | null => {
    const title = formState.title.trim();
    if (!title) {
      setNotice({ type: 'error', text: 'Tiêu đề game Tinh mắt tìm từ là bắt buộc.' });
      return null;
    }

    const categoryLabel = formState.categoryLabel.trim();
    const objectiveText = formState.objectiveText.trim();
    const categoryKey =
      toCategoryKey(categoryLabel) ||
      toCategoryKey(title) ||
      editingRecord?.content.categoryKey ||
      'topic';

    if (!categoryLabel || !objectiveText) {
      setNotice({ type: 'error', text: 'Category label và objective text là bắt buộc.' });
      return null;
    }

    const words = formState.words;
    if (words.length === 0) {
      setNotice({ type: 'error', text: 'Danh sách words phải có ít nhất 1 từ.' });
      return null;
    }

    const targetWordCount = Math.min(Math.max(1, Math.floor(formState.targetWordCount)), words.length);

    return {
      title,
      description: editingRecord?.description?.trim() || undefined,
      categoryKey,
      categoryLabel,
      boardSize: Math.min(20, Math.max(6, Math.floor(formState.boardSize))),
      timeLimitSeconds: Math.max(30, Math.floor(formState.timeLimitSeconds)),
      targetWordCount,
      maxHintsPerDay: Math.max(0, Math.floor(formState.maxHintsPerDay)),
      objectiveText,
      unlockRequirementText: formState.unlockRequirementText.trim() || undefined,
      words,
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
        const response = await adminApi.updateWordHuntLesson(editingRecord.id, payload);
        if (!response.success) {
          throw new Error(response.message || 'Không thể cập nhật game Tinh mắt tìm từ');
        }
        setNotice({ type: 'success', text: 'Đã cập nhật game Tinh mắt tìm từ.' });
      } else {
        const response = await adminApi.createWordHuntLesson(DEFAULT_WORD_HUNT_ACTIVITY_ID, payload);
        if (!response.success) {
          throw new Error(response.message || 'Không thể tạo game Tinh mắt tìm từ');
        }
        setNotice({ type: 'success', text: 'Đã tạo game Tinh mắt tìm từ.' });
      }

      closeFormModal();
      await fetchRecords(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi lưu game Word Hunt';
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

      const response = await adminApi.deleteWordHuntLesson(selectedRecord.id);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xoá game Tinh mắt tìm từ');
      }

      setNotice({ type: 'success', text: 'Đã xoá game Tinh mắt tìm từ.' });
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
      const message = error instanceof Error ? error.message : 'Lỗi khi xoá dữ liệu';
      setNotice({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wordhunt-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý game Tinh mắt tìm từ</h1>
          <p className="page-subtitle">CRUD board, time limit, objective, unlock requirement và kho từ Word Hunt</p>
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
              placeholder="Tìm theo tên game, category hoặc words..."
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
            <p>Đang tải danh sách game Word Hunt...</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên game</th>
                  <th>Category</th>
                  <th>Board</th>
                  <th>Time</th>
                  <th>Words</th>
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
                      <td>
                        <div className="meta-chip-wrap">
                          <span className="meta-chip">{record.content.categoryLabel}</span>
                          <span className="meta-sub">{record.content.categoryKey}</span>
                        </div>
                      </td>
                      <td>{record.content.boardSize}x{record.content.boardSize}</td>
                      <td>{record.content.timeLimitSeconds}s</td>
                      <td>{record.content.words.length}</td>
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
                      Không có dữ liệu phù hợp.
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
          <div className="modal-card wide">
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon primary">
                  <Zap size={20} color="#6366f1" />
                </div>
                <div>
                  <h3>{editingRecord ? 'Cập nhật game Tinh mắt tìm từ' : 'Tạo game Tinh mắt tìm từ'}</h3>
                  <p>Payload khớp UpsertWordHuntLessonRequest của backend</p>
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
              <div className="modal-body scrollable">
                <div className="form-grid">
                  <div className="input-group">
                    <label>Tiêu đề game</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Ví dụ: Động vật"
                    />
                  </div>

                  <div className="input-group">
                    <label>Category Label</label>
                    <input
                      type="text"
                      value={formState.categoryLabel}
                      onChange={(event) => setFormState((prev) => ({ ...prev, categoryLabel: event.target.value }))}
                      placeholder="Động vật"
                    />
                  </div>

                  <div className="input-group two-col full">
                    <div>
                      <label>Board Size</label>
                      <input
                        type="number"
                        min={6}
                        max={20}
                        value={formState.boardSize}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, boardSize: Number(event.target.value) || 6 }))
                        }
                      />
                    </div>
                    <div>
                      <label>Time Limit Seconds</label>
                      <input
                        type="number"
                        min={30}
                        value={formState.timeLimitSeconds}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, timeLimitSeconds: Number(event.target.value) || 30 }))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-group two-col full">
                    <div>
                      <label>Target Word Count</label>
                      <input
                        type="number"
                        min={1}
                        value={formState.targetWordCount}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, targetWordCount: Number(event.target.value) || 1 }))
                        }
                      />
                    </div>
                    <div>
                      <label>Max Hints Per Day</label>
                      <input
                        type="number"
                        min={0}
                        value={formState.maxHintsPerDay}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, maxHintsPerDay: Number(event.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-group full">
                    <label>Objective Text</label>
                    <input
                      type="text"
                      value={formState.objectiveText}
                      onChange={(event) => setFormState((prev) => ({ ...prev, objectiveText: event.target.value }))}
                      placeholder="Mục tiêu: 5 từ"
                    />
                  </div>

                  <div className="input-group full">
                    <label>Unlock Requirement Text (tuỳ chọn)</label>
                    <input
                      type="text"
                      value={formState.unlockRequirementText}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, unlockRequirementText: event.target.value }))
                      }
                      placeholder="Cần vượt qua màn trước để mở khoá"
                    />
                  </div>

                  <div className="input-group full">
                    <label>Words (nhập từ rồi Enter)</label>
                    <input
                      type="text"
                      value={formState.wordInput}
                      onChange={(event) => setFormState((prev) => ({ ...prev, wordInput: event.target.value }))}
                      onKeyDown={handleWordKeyDown}
                      onBlur={() => void addWord(formState.wordInput)}
                      placeholder="Ví dụ: rabbit"
                      disabled={validatingWord}
                    />
                    <small>Chỉ chấp nhận từ tiếng Anh hợp lệ (kiểm tra bằng dictionary API).</small>
                    <div className="token-list">
                      {formState.words.map((word) => (
                        <span key={word} className="token-chip">
                          {word}
                          <button
                            type="button"
                            className="token-remove"
                            onClick={() => removeWord(word)}
                            aria-label={`Xoá từ ${word}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
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
        .wordhunt-management {
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

        .meta-chip-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-chip {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.18);
          color: #c7d2fe;
          font-size: 0.76rem;
          width: fit-content;
        }

        .meta-sub {
          color: #94a3b8;
          font-size: 0.76rem;
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

        .modal-card.wide {
          width: min(980px, 100%);
          max-height: 92vh;
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

        .modal-body.scrollable {
          overflow-y: auto;
        }

        .modal-body h3 {
          margin: 0;
        }

        .modal-body p {
          margin: 0;
          color: var(--text-secondary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group.full {
          grid-column: 1 / -1;
        }

        .input-group small {
          color: #94a3b8;
          font-size: 0.74rem;
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
          .wordhunt-management {
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
            min-width: 760px;
          }

          .table-container {
            overflow-x: auto;
          }

          .form-grid,
          .two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WordHuntManagement;
