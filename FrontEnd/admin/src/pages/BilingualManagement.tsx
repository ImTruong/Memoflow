import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  RefreshCw,
  X,
  Eye,
  BookOpenCheck,
  FileUp,
  Plus,
  Image,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { adminApi } from '../api/api';

type BilingualParagraph = {
  order: number;
  en: string;
  vi: string;
};

type BilingualLesson = {
  id: number;
  title: string;
  description: string;
  content: {
    views: number;
    createdAt: string;
    paragraphs: BilingualParagraph[];
  };
  media: {
    url?: string;
  };
  isRead: boolean;
};

type BilingualFormState = {
  title: string;
  description: string;
  paragraphs: BilingualParagraph[];
  imageFile: File | null;
  imageFileName: string;
  imagePreview: string;
  excelFileName: string;
};

type Notice = {
  type: 'success' | 'error';
  text: string;
};

const buildDefaultParagraph = (order = 1): BilingualParagraph => ({
  order,
  en: '',
  vi: '',
});

const buildDefaultForm = (): BilingualFormState => ({
  title: '',
  description: '',
  paragraphs: [buildDefaultParagraph(1)],
  imageFile: null,
  imageFileName: '',
  imagePreview: '',
  excelFileName: '',
});

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const safeString = (value: unknown): string => (typeof value === 'string' ? value : '');

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const normalizeParagraphs = (paragraphs: BilingualParagraph[]): BilingualParagraph[] =>
  paragraphs
    .map((item, index) => ({
      order: index + 1,
      en: item.en.trim(),
      vi: item.vi.trim(),
    }))
    .filter((item) => item.en.length > 0 || item.vi.length > 0);

const mapApiLesson = (item: unknown): BilingualLesson => {
  const lesson = item as Record<string, unknown>;
  const content = lesson.content as Record<string, unknown> | undefined;
  const rawParagraphs = Array.isArray(content?.paragraphs) ? content.paragraphs : [];

  return {
    id: parseNumber(lesson.id, 0),
    title: safeString(lesson.title),
    description: safeString(lesson.description),
    content: {
      views: parseNumber(content?.views, 0),
      createdAt: safeString(content?.createdAt),
      paragraphs: rawParagraphs.map((paragraph) => {
        const record = paragraph as Record<string, unknown>;
        return {
          order: parseNumber(record.order, 0),
          en: safeString(record.en),
          vi: safeString(record.vi),
        };
      }),
    },
    media: {
      url: safeString((lesson.media as Record<string, unknown> | undefined)?.url),
    },
    isRead: Boolean(lesson.isRead),
  };
};

const mapLessonToFormState = (lesson: BilingualLesson): BilingualFormState => ({
  title: lesson.title,
  description: lesson.description,
  paragraphs: lesson.content.paragraphs.length > 0 ? lesson.content.paragraphs : [buildDefaultParagraph(1)],
  imageFile: null,
  imageFileName: lesson.media.url ? lesson.media.url : '',
  imagePreview: lesson.media.url ? lesson.media.url : '',
  excelFileName: '',
});

const BilingualManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [lessons, setLessons] = useState<BilingualLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<BilingualLesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<BilingualLesson | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<BilingualFormState>(buildDefaultForm());

  const fetchLessons = useCallback(async (targetPage: number, targetKeyword: string) => {
    try {
      setRefreshing(true);
      const response = await adminApi.getBilingualLessons(targetPage, size, targetKeyword, 'newest', 'all');
      if (!response.success) {
        throw new Error(response.message || 'Không tải được danh sách bài viết song ngữ');
      }

      const pageData = response.data as {
        content?: unknown[];
        totalPages?: number;
        totalElements?: number;
      };

      const content = Array.isArray(pageData.content) ? pageData.content.map(mapApiLesson) : [];
      setLessons(content);
      setTotalPages(Math.max(1, Number(pageData.totalPages ?? 1)));
      setTotalElements(Number(pageData.totalElements ?? content.length));
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi hệ thống khi tải bài viết song ngữ') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [size]);

  useEffect(() => {
    void fetchLessons(page, keyword);
  }, [fetchLessons, page, keyword]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, notice.type === 'error' ? 8000 : 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setKeyword(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const openCreateModal = () => {
    setEditingLesson(null);
    setFormState(buildDefaultForm());
    setShowFormModal(true);
  };

  const openEditModal = async (lesson: BilingualLesson) => {
    setEditingLesson(lesson);
    setShowFormModal(true);
    setFormLoading(true);

    try {
      const response = await adminApi.getBilingualLessonDetail(lesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được chi tiết bài viết song ngữ');
      }

      const detail = mapApiLesson(response.data);
      setFormState(mapLessonToFormState(detail));
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi tải dữ liệu chi tiết bài viết') });
      setFormState(mapLessonToFormState(lesson));
    } finally {
      setFormLoading(false);
    }
  };

  const closeFormModal = () => {
    if (submitting) {
      return;
    }
    setShowFormModal(false);
    setEditingLesson(null);
    setFormState(buildDefaultForm());
  };

  const closeDeleteModal = () => {
    if (submitting) {
      return;
    }
    setShowDeleteModal(false);
    setSelectedLesson(null);
  };

  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imageFileName: file.name,
      imagePreview: preview,
    }));
  };

  const handleExcelUpload = async (file?: File) => {
    if (!file) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      excelFileName: file.name,
    }));
    setFormLoading(true);

    try {
      const response = await adminApi.uploadBilingualLesson(file, formState.imageFile);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được file Excel');
      }

      const paragraphs = Array.isArray(response.data) ? response.data.map((item: any) => ({
        order: parseNumber(item.order, 0),
        en: safeString(item.en),
        vi: safeString(item.vi),
      })) : [];

      setFormState((prev) => ({
        ...prev,
        paragraphs: paragraphs.length > 0 ? paragraphs : [buildDefaultParagraph(1)],
      }));
      setNotice({ type: 'success', text: 'Đã tải file Excel và điền tự động nội dung.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi upload file Excel') });
    } finally {
      setFormLoading(false);
    }
  };

  const updateParagraph = (index: number, key: 'en' | 'vi', value: string) => {
    setFormState((prev) => {
      const next = [...prev.paragraphs];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, paragraphs: next };
    });
  };

  const addParagraph = () => {
    setFormState((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, buildDefaultParagraph(prev.paragraphs.length + 1)],
    }));
  };

  const removeParagraph = (index: number) => {
    setFormState((prev) => {
      const next = prev.paragraphs.filter((_, idx) => idx !== index).map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      return { ...prev, paragraphs: next.length > 0 ? next : [buildDefaultParagraph(1)] };
    });
  };

  const buildRequestPayload = () => {
    const title = formState.title.trim();
    const description = formState.description.trim();
    if (!title) {
      setNotice({ type: 'error', text: 'Tiêu đề là bắt buộc.' });
      return null;
    }

    const paragraphs = normalizeParagraphs(formState.paragraphs);
    if (paragraphs.length === 0) {
      setNotice({ type: 'error', text: 'Tối thiểu một đoạn văn phải có nội dung.' });
      return null;
    }

    return {
      title,
      description,
      content: {
        paragraphs,
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildRequestPayload();
    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingLesson) {
        const response = await adminApi.updateBilingualLesson(editingLesson.id, payload, formState.imageFile);
        if (!response.success) {
          throw new Error(response.message || 'Không thể cập nhật bài viết song ngữ');
        }
        setNotice({ type: 'success', text: 'Cập nhật bài viết song ngữ thành công.' });
      } else {
        const response = await adminApi.createBilingualLesson(payload, formState.imageFile);
        if (!response.success) {
          throw new Error(response.message || 'Không thể tạo bài viết song ngữ');
        }
        setNotice({ type: 'success', text: 'Tạo bài viết song ngữ thành công.' });
      }

      setShowFormModal(false);
      setEditingLesson(null);
      setFormState(buildDefaultForm());
      await fetchLessons(page, keyword);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi lưu bài viết') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLesson) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminApi.deleteBilingualLesson(selectedLesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xoá bài viết song ngữ');
      }
      setNotice({ type: 'success', text: 'Đã xoá bài viết song ngữ thành công.' });
      setShowDeleteModal(false);
      setSelectedLesson(null);

      const shouldGoBack = lessons.length === 1 && page > 0;
      const nextPage = shouldGoBack ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchLessons(page, keyword);
      }
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi xoá bài viết') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bilingual-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý Bài viết song ngữ</h1>
          <p className="page-subtitle">Quản lý danh sách và nội dung bài viết song ngữ</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => void fetchLessons(page, keyword)} disabled={refreshing || loading}>
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Thêm mới</span>
          </button>
        </div>
      </header>

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}

      <div className="cards-container">
        <div className="table-header-tools">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="summary">
            Tổng: <strong>{totalElements}</strong> bài viết
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={30} className="spinning" />
            <p>Đang tải danh sách bài viết...</p>
          </div>
        ) : (
          <>
            <div className="cards-grid">
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-card">
                    <div className="card-image">
                      {lesson.media.url ? (
                        <img src={lesson.media.url} alt={lesson.title} />
                      ) : (
                        <div className="no-image">
                          <Image size={48} />
                          <span>Không có ảnh</span>
                        </div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{lesson.title}</h3>
                      <p className="card-description">{lesson.description || 'Không có mô tả'}</p>
                      <div className="card-meta">
                        <span className="views">👁 {lesson.content.views} lượt xem</span>
                        <span className="date">{new Date(lesson.content.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="card-actions">
                        <button className="icon-btn" onClick={() => void openEditModal(lesson)}>
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  Không tìm thấy bài viết song ngữ phù hợp.
                </div>
              )}
            </div>

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
                  <BookOpenCheck size={22} color="#6366f1" />
                </div>
                <div>
                  <h3>{editingLesson ? 'Sửa bài viết song ngữ' : 'Thêm bài viết song ngữ mới'}</h3>
                  <p>Upload Excel hoặc nhập tay nội dung bài viết.</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeFormModal}>
                <X size={20} />
              </button>
            </div>

            {formLoading ? (
              <div className="modal-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="modal-body scrollable">
                <div className="upload-section">
                  <div className="upload-card">
                    <div>
                      <h4>Tải lên từ Excel</h4>
                      <p>Chọn tệp .xlsx để hệ thống đọc và điền tự động.</p>
                    </div>
                    <label className="upload-button" htmlFor="excel-upload">
                      <FileUp size={18} />
                      <span>Chọn tệp .xlsx</span>
                    </label>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        void handleExcelUpload(file);
                      }}
                    />
                    {formState.excelFileName && <span className="upload-note">{formState.excelFileName}</span>}
                  </div>

                  <div className="upload-card small">
                    <div>
                      <h4>Ảnh bìa (tuỳ chọn)</h4>
                      <p>Upload ảnh nếu muốn hiển thị ảnh đại diện.</p>
                    </div>
                    <label className="upload-button" htmlFor="image-upload">
                      <FileUp size={18} />
                      <span>Chọn ảnh</span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        handleImageChange(file || undefined);
                      }}
                    />
                    {formState.imageFileName && <span className="upload-note">{formState.imageFileName}</span>}
                    {formState.imagePreview && <img className="image-preview" src={formState.imagePreview} alt="Ảnh bìa" />}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group half">
                    <label>Tiêu đề</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Ví dụ: The Future of AI"
                    />
                  </div>

                  <div className="input-group half">
                    <label>Mô tả</label>
                    <textarea
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Ví dụ: Tương lai của AI"
                      rows={2}
                    />
                  </div>

                  <div className="paragraph-list">
                    <div className="paragraph-header">
                      <span>Danh sách đoạn văn</span>
                      <button className="secondary-btn" type="button" onClick={addParagraph}>
                        <Plus size={16} /> Thêm đoạn văn
                      </button>
                    </div>
                    {formState.paragraphs.map((paragraph, index) => (
                      <div key={index} className="paragraph-row">
                        <div className="paragraph-number">{String(paragraph.order).padStart(2, '0')}</div>
                        <div className="paragraph-fields">
                          <div className="input-group half">
                            <label>Tiếng Anh</label>
                            <textarea
                              value={paragraph.en}
                              onChange={(event) => updateParagraph(index, 'en', event.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="input-group half">
                            <label>Tiếng Việt</label>
                            <textarea
                              value={paragraph.vi}
                              onChange={(event) => updateParagraph(index, 'vi', event.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>
                        <button className="remove-paragraph" type="button" onClick={() => removeParagraph(index)}>
                          Xóa đoạn
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="secondary-btn" onClick={closeFormModal} disabled={submitting}>
                Hủy
              </button>
              <button className="primary-btn" onClick={handleSubmit} disabled={submitting || formLoading}>
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    {editingLesson ? 'Đang cập nhật' : 'Đang lưu...'}
                  </>
                ) : (
                  editingLesson ? 'Cập nhật' : 'Lưu bài viết'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card small">
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon danger">
                  <Trash2 size={22} color="#f97316" />
                </div>
                <div>
                  <h3>Xác nhận xoá</h3>
                  <p>Bài viết sẽ bị xoá vĩnh viễn khỏi hệ thống.</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc muốn xoá bài viết <strong>{selectedLesson?.title}</strong> không?</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={closeDeleteModal} disabled={submitting}>
                Hủy
              </button>
              <button className="primary-btn danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Đang xoá...
                  </>
                ) : (
                  'Xoá'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bilingual-management {
          padding: 24px 28px 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .header-info {
          max-width: 650px;
        }

        .page-title {
          margin: 0;
          font-size: 1.95rem;
        }

        .page-subtitle {
          margin: 8px 0 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .refresh-btn,
        .primary-btn,
        .secondary-btn,
        .upload-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          transition: background 0.2s ease;
        }

        .primary-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.08);
        }

        .refresh-btn:hover,
        .primary-btn:hover,
        .secondary-btn:hover,
        .upload-button:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .overview-card {
          background: var(--bg-card);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 22px 20px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
        }

        .growth-card {
          position: relative;
        }

        .card-title {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .card-value {
          font-size: 2rem;
          line-height: 1;
        }

        .card-note {
          color: var(--text-secondary);
          font-size: 0.82rem;
        }

        .growth-bars {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          margin-top: 8px;
          height: 6px;
        }

        .growth-bars .bar {
          flex: 1;
          border-radius: 4px;
          background: rgba(148, 163, 184, 0.2);
          height: 4px;
        }

        .growth-bars .bar.active {
          background: #34d399;
        }

        .table-container {
          background: var(--bg-card);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
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

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .lesson-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .lesson-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          overflow: hidden;
          position: relative;
          display: grid;
          place-items: center;
          padding: 12px;
          min-height: 140px;
          max-height: 180px;
          background: rgba(255, 255, 255, 0.04);
        }

        .card-image img {
          width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 16px;
          max-height: 180px;
        }

        .no-image {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
        }

        .no-image span {
          font-size: 0.9rem;
        }

        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .card-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-secondary);
          padding: 60px 20px;
          font-size: 1rem;
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 10px;
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
          z-index: 1000;
          background: rgba(10, 15, 28, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card {
          width: min(1040px, 100%);
          background: var(--bg-card);
          border-radius: 22px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .modal-card.wide {
          max-height: min(92vh, 860px);
        }

        .modal-card.small {
          max-width: 520px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-title-area {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .modal-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(99, 102, 241, 0.12);
        }

        .modal-icon.danger {
          background: rgba(248, 113, 113, 0.16);
        }

        .modal-title-area h3 {
          margin: 0;
          font-size: 1.15rem;
        }

        .modal-title-area p {
          margin: 6px 0 0;
          color: var(--text-secondary);
          font-size: 0.92rem;
        }

        .close-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
        }

        .modal-body {
          padding: 20px 24px;
          display: grid;
          gap: 20px;
        }

        .modal-body.scrollable {
          max-height: calc(92vh - 180px);
          overflow-y: auto;
        }

        .upload-section {
          display: grid;
          grid-template-columns: 0.8fr 1.6fr;
          gap: 16px;
        }

        .upload-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .upload-card.small {
          min-width:100%;
        }

        .upload-card h4 {
          margin: 0;
          font-size: 1rem;
        }

        .upload-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.90rem;
        }

        .upload-button {
          width: fit-content;
          padding: 10px 14px;
          background: rgba(99, 102, 241, 0.16);
          color: #eef2ff;
        }

        .upload-note {
          color: var(--text-secondary);
          font-size: 0.85rem;
          overflow: hidden;
        }

        .image-preview {
          width: 100%;
          border-radius: 16px;
          object-fit: cover;
        }

        .form-grid {
          display: grid;
          gap: 20px;
        }

        .input-group {
          display: grid;
          gap: 10px;
        }

        .input-group.full {
          grid-column: span 2;
        }

        .input-group.half {
          width: 100%;
        }

        .input-group label {
          color: var(--text-secondary);
          font-size: 0.92rem;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          padding: 12px 14px;
          font-family: inherit;
          resize: vertical;
        }

        .input-group textarea {
          min-height: 90px;
        }

        .paragraph-list {
          display: grid;
          gap: 14px;
        }

        .paragraph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .paragraph-row {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 12px;
          align-items: start;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 16px;
        }

        .paragraph-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.16);
          color: #eef2ff;
          font-weight: 700;
        }

        .paragraph-fields {
          display: grid;
          gap: 14px;
        }

        .remove-paragraph {
          border: none;
          background: rgba(248, 113, 113, 0.14);
          color: #fecaca;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 18px 24px 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .notice {
          margin-bottom: 20px;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.95rem;
        }

        .notice.success {
          background: rgba(34, 197, 94, 0.12);
          color: #bbf7d0;
        }

        .notice.error {
          background: rgba(248, 113, 113, 0.12);
          color: #fecaca;
        }

        .modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          color: var(--text-secondary);
          min-height: 200px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 980px) {
          .overview-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .upload-section {
            grid-template-columns: 1fr;
          }

          .paragraph-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: flex-start;
          }

          .table-header-tools {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default BilingualManagement;
