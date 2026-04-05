import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  RefreshCw,
  X,
  Eye,
  Headphones,
  Plus,
  UploadCloud,
  FolderPlus,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { adminApi } from '../api/api';

type ListeningLessonSummary = {
  id: number;
  title: string;
  isCompleted: boolean | null;
  totalQuestions: number;
  score: number | null;
};

type ListeningOption = {
  id?: number | null;
  orderIndex: number;
  type: string;
  optionText: string;
  isCorrect: boolean;
};

type ListeningQuiz = {
  id?: number | null;
  orderIndex: number;
  questionText: string;
  translation: string;
  options: ListeningOption[];
};

type ListeningGroup = {
  id?: number | null;
  orderIndex: number;
  type: string;
  transcript: string;
  translation: string;
  hasAudio: boolean;
  hasImage: boolean;
  audioFile: File | null;
  imageFile: File | null;
  audioPath: string;
  imagePath: string;
  quizzes: ListeningQuiz[];
};

type ListeningFormState = {
  id?: number;
  title: string;
  part: number;
  groups: ListeningGroup[];
  excelFileName: string;
};

type Notice = {
  type: 'success' | 'error';
  text: string;
};

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

const buildDefaultOption = (orderIndex: number): ListeningOption => ({
  id: null,
  orderIndex,
  type: '',
  optionText: '',
  isCorrect: false,
});

const buildDefaultQuiz = (orderIndex: number): ListeningQuiz => ({
  id: null,
  orderIndex,
  questionText: '',
  translation: '',
  options: [
    buildDefaultOption(1),
    buildDefaultOption(2),
    buildDefaultOption(3),
    buildDefaultOption(4),
  ],
});

const buildDefaultGroup = (orderIndex: number): ListeningGroup => ({
  id: null,
  orderIndex,
  type: '',
  transcript: '',
  translation: '',
  hasAudio: true,
  hasImage: true,
  audioFile: null,
  imageFile: null,
  audioPath: '',
  imagePath: '',
  quizzes: [buildDefaultQuiz(1)],
});

const buildDefaultForm = (): ListeningFormState => ({
  title: '',
  part: 1,
  groups: [buildDefaultGroup(1)],
  excelFileName: '',
});

const parsePartFromType = (type: string): number => {
  const match = /PART_(\d+)/.exec(type);
  return match ? parseInt(match[1], 10) : 1;
};

const ListeningLessonManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lessons, setLessons] = useState<ListeningLessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [part, setPart] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [modalNotice, setModalNotice] = useState<Notice | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<Notice | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ListeningLessonSummary | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ListeningLessonSummary | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<ListeningFormState>(buildDefaultForm());

  const fetchLessons = useCallback(async (targetPage: number) => {
    try {
      setRefreshing(true);
      const response = await adminApi.getListeningLessons(targetPage, size, part, undefined);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được danh sách bài Nghe');
      }

      const pageData = response.data as {
        content?: unknown[];
        totalPages?: number;
        totalElements?: number;
      };

      const items = Array.isArray(pageData.content)
        ? pageData.content.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            id: parseNumber(record.id, 0),
            title: safeString(record.title),
            isCompleted: record.isCompleted === true,
            totalQuestions: parseNumber(record.totalQuestions, 0),
            score: record.score === null ? null : parseNumber(record.score, 0),
          };
        })
        : [];

      setLessons(items);
      setTotalPages(Math.max(1, Number(pageData.totalPages ?? 1)));
      setTotalElements(Number(pageData.totalElements ?? items.length));
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi tải danh sách bài Nghe') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [part, size]);

  useEffect(() => {
    void fetchLessons(page);
  }, [fetchLessons, page]);

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
      void fetchLessons(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [part, fetchLessons]);

  const filteredLessons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return lessons;
    }

    return lessons.filter((lesson) => lesson.title.toLowerCase().includes(keyword));
  }, [lessons, searchTerm]);

  const openCreateModal = () => {
    setEditingLesson(null);
    setFormState(buildDefaultForm());
    setModalNotice(null);
    setShowFormModal(true);
  };

  const mapDetailToForm = (detail: any): ListeningFormState => ({
    id: parseNumber(detail.id),
    title: safeString(detail.title),
    part: parsePartFromType(safeString(detail.type)),
    groups: Array.isArray(detail.groups)
      ? detail.groups.map((group: any, idx: number) => ({
        id: parseNumber(group.id) || undefined,
        orderIndex: parseNumber(group.orderIndex, idx + 1),
        type: safeString(group.type),
        transcript: safeString(group.transcript),
        translation: safeString(group.translation),
        hasAudio: Boolean(group.hasAudio),
        hasImage: Boolean(group.hasImage),
        audioFile: null,
        imageFile: null,
        audioPath: safeString(group.audioPath),
        imagePath: safeString(group.imagePath),
        quizzes: Array.isArray(group.quizzes)
          ? group.quizzes.map((quiz: any, qIdx: number) => ({
            id: parseNumber(quiz.id) || undefined,
            orderIndex: parseNumber(quiz.orderIndex, qIdx + 1),
            questionText: safeString(quiz.questionText),
            translation: safeString(quiz.translation),
            options: Array.isArray(quiz.options)
              ? quiz.options.map((option: any, oIdx: number) => ({
                id: parseNumber(option.id) || undefined,
                orderIndex: parseNumber(option.orderIndex, oIdx + 1),
                type: safeString(option.type),
                optionText: safeString(option.optionText),
                isCorrect: Boolean(option.isCorrect),
              }))
              : [buildDefaultOption(1), buildDefaultOption(2), buildDefaultOption(3), buildDefaultOption(4)],
          }))
          : [buildDefaultQuiz(1)],
      }))
      : [buildDefaultGroup(1)],
    excelFileName: '',
  });

  const openEditModal = async (lesson: ListeningLessonSummary) => {
    setEditingLesson(lesson);
    setModalNotice(null);
    setShowFormModal(true);
    setFormLoading(true);

    try {
      const response = await adminApi.getListeningLessonDetail(lesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được chi tiết bài Nghe');
      }

      setFormState(mapDetailToForm(response.data));
    } catch (error) {
      setModalNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi tải chi tiết bài Nghe') });
      setFormState(buildDefaultForm());
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
    setModalNotice(null);
  };

  const closeDeleteModal = () => {
    if (submitting) {
      return;
    }

    setShowDeleteModal(false);
    setSelectedLesson(null);
    setDeleteNotice(null);
  };

  const assignFilesToGroups = (
    groups: ListeningGroup[],
    files: File[],
    field: 'audioFile' | 'imageFile',
    previewField: 'audioPath' | 'imagePath',
    flagField: 'hasAudio' | 'hasImage',
  ): ListeningGroup[] => {
    const queue = [...files];
    return groups.map((group) => {
      if (!group[flagField]) {
        return { ...group, [field]: null, [previewField]: '' } as ListeningGroup;
      }

      const file = queue.shift() ?? null;
      return {
        ...group,
        [field]: file,
        [previewField]: file ? URL.createObjectURL(file) : group[previewField],
      } as ListeningGroup;
    });
  };

  const handleAudioFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const selected = Array.from(files);

    setFormState((prev) => ({
      ...prev,
      groups: assignFilesToGroups(prev.groups, selected, 'audioFile', 'audioPath', 'hasAudio'),
    }));
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const selected = Array.from(files);

    setFormState((prev) => ({
      ...prev,
      groups: assignFilesToGroups(prev.groups, selected, 'imageFile', 'imagePath', 'hasImage'),
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
      const response = await adminApi.uploadListeningLessonExcel(file);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được file Excel');
      }

      const groups = Array.isArray(response.data)
        ? response.data.map((group: any, index: number) => ({
          orderIndex: parseNumber(group.orderIndex, index + 1),
          type: safeString(group.type),
          transcript: safeString(group.transcript),
          translation: safeString(group.translation),
          hasAudio: Boolean(group.hasAudio),
          hasImage: Boolean(group.hasImage),
          audioFile: null,
          imageFile: null,
          audioPath: '',
          imagePath: '',
          quizzes: Array.isArray(group.quizzes)
            ? group.quizzes.map((quiz: any, qIndex: number) => ({
              orderIndex: parseNumber(quiz.orderIndex, qIndex + 1),
              questionText: safeString(quiz.questionText),
              translation: safeString(quiz.translation),
              options: Array.isArray(quiz.options)
                ? quiz.options.map((option: any, oIndex: number) => ({
                  orderIndex: parseNumber(option.orderIndex, oIndex + 1),
                  type: safeString(option.type),
                  optionText: safeString(option.optionText),
                  isCorrect: Boolean(option.isCorrect),
                }))
                : [buildDefaultOption(1), buildDefaultOption(2), buildDefaultOption(3), buildDefaultOption(4)],
            }))
            : [buildDefaultQuiz(1)],
        }))
        : [];

      setFormState((prev) => ({
        ...prev,
        groups: groups.length > 0 ? groups : [buildDefaultGroup(1)],
      }));
      setModalNotice({ type: 'success', text: 'Đã tải file Excel và điền dữ liệu vào nhóm.' });
    } catch (error) {
      setModalNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi upload file Excel') });
    } finally {
      setFormLoading(false);
    }
  };

  const updateGroup = (index: number, next: Partial<ListeningGroup>) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      groups[index] = { ...groups[index], ...next };
      return { ...prev, groups };
    });
  };

  const addGroup = () => {
    setFormState((prev) => ({
      ...prev,
      groups: [...prev.groups, buildDefaultGroup(prev.groups.length + 1)],
    }));
  };

  const removeGroup = (index: number) => {
    setFormState((prev) => {
      const groups = prev.groups.filter((_, idx) => idx !== index).map((group, idx) => ({
        ...group,
        orderIndex: idx + 1,
      }));
      return { ...prev, groups: groups.length > 0 ? groups : [buildDefaultGroup(1)] };
    });
  };

  const updateQuiz = (groupIndex: number, quizIndex: number, next: Partial<ListeningQuiz>) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      const quizzes = [...group.quizzes];
      quizzes[quizIndex] = { ...quizzes[quizIndex], ...next };
      groups[groupIndex] = { ...group, quizzes };
      return { ...prev, groups };
    });
  };

  const addQuiz = (groupIndex: number) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      groups[groupIndex] = {
        ...group,
        quizzes: [...group.quizzes, buildDefaultQuiz(group.quizzes.length + 1)],
      };
      return { ...prev, groups };
    });
  };

  const removeQuiz = (groupIndex: number, quizIndex: number) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      const quizzes = group.quizzes.filter((_, idx) => idx !== quizIndex).map((quiz, idx) => ({
        ...quiz,
        orderIndex: idx + 1,
      }));
      groups[groupIndex] = { ...group, quizzes: quizzes.length > 0 ? quizzes : [buildDefaultQuiz(1)] };
      return { ...prev, groups };
    });
  };

  const updateOption = (
    groupIndex: number,
    quizIndex: number,
    optionIndex: number,
    next: Partial<ListeningOption>,
  ) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      const quizzes = [...group.quizzes];
      const options = [...quizzes[quizIndex].options];
      options[optionIndex] = { ...options[optionIndex], ...next };
      quizzes[quizIndex] = { ...quizzes[quizIndex], options };
      groups[groupIndex] = { ...group, quizzes };
      return { ...prev, groups };
    });
  };

  const addOption = (groupIndex: number, quizIndex: number) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      const quizzes = [...group.quizzes];
      const options = [...quizzes[quizIndex].options, buildDefaultOption(quizzes[quizIndex].options.length + 1)];
      quizzes[quizIndex] = { ...quizzes[quizIndex], options };
      groups[groupIndex] = { ...group, quizzes };
      return { ...prev, groups };
    });
  };

  const removeOption = (groupIndex: number, quizIndex: number, optionIndex: number) => {
    setFormState((prev) => {
      const groups = [...prev.groups];
      const group = groups[groupIndex];
      const quizzes = [...group.quizzes];
      const options = quizzes[quizIndex].options
        .filter((_, idx) => idx !== optionIndex)
        .map((option, idx) => ({
          ...option,
          orderIndex: idx + 1,
        }));

      quizzes[quizIndex] = {
        ...quizzes[quizIndex],
        options: options.length > 0 ? options : [buildDefaultOption(1)],
      };
      groups[groupIndex] = { ...group, quizzes };
      return { ...prev, groups };
    });
  };

  const buildPayload = () => {
    const title = formState.title.trim();
    if (!title) {
      setModalNotice({ type: 'error', text: 'Tên bài nghe không được để trống.' });
      return null;
    }

    const groups = formState.groups.map((group) => ({
      ...(group.id && { id: group.id }),
      orderIndex: group.orderIndex,
      type: group.type.trim(),
      transcript: group.transcript.trim(),
      translation: group.translation.trim(),
      hasAudio: group.hasAudio,
      hasImage: group.hasImage,
      quizzes: group.quizzes.map((quiz) => ({
        ...(quiz.id && { id: quiz.id }),
        orderIndex: quiz.orderIndex,
        questionText: quiz.questionText.trim(),
        translation: quiz.translation.trim(),
        options: quiz.options.map((option) => ({
          ...(option.id && { id: option.id }),
          orderIndex: option.orderIndex,
          type: option.type.trim(),
          optionText: option.optionText.trim(),
          isCorrect: option.isCorrect,
        })),
      })),
    }));

    const audioFiles = formState.groups
      .filter((group) => group.hasAudio && group.audioFile)
      .map((group) => group.audioFile as File);
    const imageFiles = formState.groups
      .filter((group) => group.hasImage && group.imageFile)
      .map((group) => group.imageFile as File);

    return {
      ...(formState.id && { id: formState.id }),
      title,
      part: formState.part,
      groups,
      audioFiles,
      imageFiles,
    };
  };

  const handleSubmit = async () => {
    setModalNotice(null);
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    if (editingLesson) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminApi.createListeningLesson(
        { title: payload.title, part: payload.part, groups: payload.groups },
        payload.audioFiles,
        payload.imageFiles,
      );

      if (!response.success) {
        throw new Error(response.message || 'Không thể lưu bài Nghe');
      }

      setNotice({ type: 'success', text: editingLesson ? 'Cập nhật bài Nghe thành công.' : 'Tạo bài Nghe thành công.' });
      setShowFormModal(false);
      setEditingLesson(null);
      setFormState(buildDefaultForm());
      await fetchLessons(page);
    } catch (error) {
      setModalNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi lưu bài Nghe') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLesson) {
      return;
    }

    setDeleteNotice(null);

    try {
      setSubmitting(true);
      const response = await adminApi.deleteListeningLesson(selectedLesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xoá bài Nghe');
      }

      setNotice({ type: 'success', text: 'Đã xoá bài Nghe thành công.' });
      setShowDeleteModal(false);
      setSelectedLesson(null);

      const nextPage = lessons.length === 1 && page > 0 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchLessons(page);
      }
    } catch (error) {
      setDeleteNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi xoá bài Nghe') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="listening-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý bài nghe</h1>
          <p className="page-subtitle">Quản lý danh sách và nội dung bài trắc nghiệm nghe.</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={() => void fetchLessons(page)} disabled={refreshing || loading}>
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

      <div className="table-container">
        <div className="table-header-tools">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filters-row">
            <div className="filter-block">
              <label>Part</label>
              <select value={part} onChange={(event) => setPart(Number(event.target.value))} className="styled-select">
                <option value={1}>Part 1</option>
                <option value={2}>Part 2</option>
                <option value={3}>Part 3</option>
                <option value={4}>Part 4</option>
              </select>
            </div>
            <div className="summary">
              Tổng: <strong>{totalElements}</strong> lessons
            </div>
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={30} className="spinning" />
            <p>Đang tải danh sách bài Nghe...</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên bài</th>
                  <th>Số lượng câu hỏi</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.length > 0 ? (
                  filteredLessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>{lesson.id}</td>
                      <td>{lesson.title}</td>
                      <td>{lesson.totalQuestions}</td>
                      <td className="actions-cell">
                        <button className="icon-btn" onClick={() => void openEditModal(lesson)}>
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setDeleteNotice(null);
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
                    <td colSpan={4} className="empty-row">
                      Không có bài Nghe nào phù hợp.
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
                  <Headphones size={22} color="#6366f1" />
                </div>
                <div>
                  <h3>{editingLesson ? 'Chỉnh sửa bài nghe' : 'Thêm mới bài nghe'}</h3>
                  <p>Upload Excel, audio và ảnh, sau đó kiểm tra lại nội dung trước khi lưu.</p>
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
                {modalNotice && <div className={`notice ${modalNotice.type}`}>{modalNotice.text}</div>}
                <div className="upload-section">
                  <div className="upload-card">
                    <div className="upload-card-header">
                      <UploadCloud size={18} />
                      <div>
                        <h4>Tải lên Excel</h4>
                        <p>Nội dung sẽ được tạo thành nhóm, câu hỏi và đáp án.</p>
                      </div>
                    </div>
                    <label className="upload-button" htmlFor="listening-excel-upload">
                      <FolderPlus size={18} />
                      <span>Chọn file Excel</span>
                    </label>
                    <input
                      id="listening-excel-upload"
                      type="file"
                      accept=".xlsx,.csv"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        void handleExcelUpload(file || undefined);
                      }}
                    />
                    {formState.excelFileName && <span className="upload-note">{formState.excelFileName}</span>}
                  </div>

                  <div className="upload-card small-card">
                    <div className="upload-card-header">
                      <Headphones size={18} />
                      <div>
                        <h4>Upload audio</h4>
                        <p>Upload danh sách file audio</p>
                      </div>
                    </div>
                    <label className="upload-button" htmlFor="audio-upload">
                      <Headphones size={18} />
                      <span>Chọn audio</span>
                    </label>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        handleAudioFiles(event.target.files);
                      }}
                    />
                    <span className="upload-note">
                      {formState.groups.filter((group) => group.audioFile).length} audio đã chọn
                    </span>
                  </div>

                  <div className="upload-card small-card">
                    <div className="upload-card-header">
                      <FolderPlus size={18} />
                      <div>
                        <h4>Upload ảnh</h4>
                        <p>Upload danh sách file ảnh</p>
                      </div>
                    </div>
                    <label className="upload-button" htmlFor="image-upload">
                      <FolderPlus size={18} />
                      <span>Chọn ảnh</span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        handleImageFiles(event.target.files);
                      }}
                    />
                    <span className="upload-note">
                      {formState.groups.filter((group) => group.imageFile).length} ảnh đã chọn
                    </span>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group full">
                    <label>Tên bài</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Test 01 - Part 3"
                    />
                  </div>

                  <div className="input-group half">
                    <label>Part</label>
                    <select
                      value={formState.part}
                      onChange={(event) => setFormState((prev) => ({ ...prev, part: Number(event.target.value) }))}
                      className="styled-select"
                    >
                      <option value={1}>Part 1</option>
                      <option value={2}>Part 2</option>
                      <option value={3}>Part 3</option>
                      <option value={4}>Part 4</option>
                    </select>
                  </div>
                </div>

                <div className="group-list">
                  <div className="group-header">
                    <h4>Nội dung bài nghe</h4>
                    <button className="secondary-btn" type="button" onClick={addGroup}>
                      <Plus size={16} /> Thêm nhóm
                    </button>
                  </div>

                  {formState.groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="group-card">
                      <div className="group-card-header">
                        <div>
                          <span className="group-label">Group #{String(group.orderIndex).padStart(2, '0')}</span>
                        </div>
                        <button className="remove-group" type="button" onClick={() => removeGroup(groupIndex)}>
                          Xóa nhóm
                        </button>
                      </div>

                      <div className="row-grid">
                        <div className="input-group half">
                          <label>Transcript</label>
                          <textarea
                            value={group.transcript}
                            rows={2}
                            onChange={(event) => updateGroup(groupIndex, { transcript: event.target.value })}
                          />
                        </div>
                        <div className="input-group half">
                          <label>Translation</label>
                          <textarea
                            value={group.translation}
                            rows={2}
                            onChange={(event) => updateGroup(groupIndex, { translation: event.target.value })}
                          />
                        </div>
                      </div>

                      <div className="row-grid">
                        <div className="input-group half">
                          <label>Type</label>
                          <input
                            type="text"
                            value={group.type}
                            onChange={(event) => updateGroup(groupIndex, { type: event.target.value })}
                            placeholder="LISTENING_PART_1"
                          />
                        </div>
                        <div className="checkbox-row half">
                          <label>
                            <input
                              type="checkbox"
                              checked={group.hasAudio}
                              onChange={(event) => {
                                updateGroup(groupIndex, {
                                  hasAudio: event.target.checked,
                                  audioFile: event.target.checked ? group.audioFile : null,
                                  audioPath: event.target.checked ? group.audioPath : '',
                                });
                              }}
                            />
                            Có audio
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={group.hasImage}
                              onChange={(event) => {
                                updateGroup(groupIndex, {
                                  hasImage: event.target.checked,
                                  imageFile: event.target.checked ? group.imageFile : null,
                                  imagePath: event.target.checked ? group.imagePath : '',
                                });
                              }}
                            />
                            Có hình ảnh
                          </label>
                        </div>
                      </div>

                      <div className="row-grid">
                        <div className="input-group half">
                          <label>Audio file</label>
                          <input
                            type="file"
                            accept="audio/*"
                            disabled={!group.hasAudio}
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              updateGroup(groupIndex, {
                                audioFile: file,
                                audioPath: file ? URL.createObjectURL(file) : '',
                              });
                            }}
                          />
                          <div className="file-info">
                            {group.audioFile?.name ?? (group.hasAudio ? 'No audio selected' : 'Disabled')}
                          </div>
                          {group.audioPath && (
                            <audio controls style={{ width: '100%', marginTop: '8px' }}>
                              <source src={group.audioPath} />
                            </audio>
                          )}
                        </div>
                        <div className="input-group half">
                          <label>Image file</label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={!group.hasImage}
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              updateGroup(groupIndex, {
                                imageFile: file,
                                imagePath: file ? URL.createObjectURL(file) : '',
                              });
                            }}
                          />
                          <div className="file-info">
                            {group.imageFile?.name ?? (group.hasImage ? 'No image selected' : 'Disabled')}
                          </div>
                          {group.imagePath && (
                            <img src={group.imagePath} alt="Group image" style={{ width: '100%', marginTop: '8px' }} />
                          )}
                        </div>
                      </div>

                      <div className="quiz-list">
                        <div className="quiz-header">
                          <span>Câu hỏi
                          </span>
                          <button className="secondary-btn" type="button" onClick={() => addQuiz(groupIndex)}>
                            <Plus size={14} /> Add Question
                          </button>
                        </div>

                        {group.quizzes.map((quiz, quizIndex) => (
                          <div key={quizIndex} className="quiz-card">
                            <div className="quiz-card-header">
                              <span>Câu hỏi #{quiz.orderIndex}</span>
                              <div className="quiz-header-actions">
                                <button className="secondary-btn" type="button" onClick={() => addOption(groupIndex, quizIndex)}>
                                  <Plus size={14} /> Thêm đáp án
                                </button>
                                <button
                                  className="remove-group"
                                  type="button"
                                  onClick={() => removeQuiz(groupIndex, quizIndex)}
                                >
                                  Xóa câu hỏi
                                </button>
                              </div>
                            </div>

                            <div className="row-grid">
                              <div className="input-group half">
                                <label>Câu hỏi</label>
                                <input
                                  type="text"
                                  value={quiz.questionText}
                                  onChange={(event) => updateQuiz(groupIndex, quizIndex, { questionText: event.target.value })}
                                />
                              </div>
                              <div className="input-group half">
                                <label>Translation</label>
                                <input
                                  type="text"
                                  value={quiz.translation}
                                  onChange={(event) => updateQuiz(groupIndex, quizIndex, { translation: event.target.value })}
                                />
                              </div>
                            </div>

                            <div className="options-grid">
                              {quiz.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="option-card">
                                  <div className="option-row">
                                    <span className="option-index">Đáp án {option.orderIndex}</span>
                                    <input
                                      type="text"
                                      className="option-input"
                                      value={option.optionText}
                                      onChange={(event) => updateOption(groupIndex, quizIndex, optionIndex, { optionText: event.target.value })}
                                      placeholder="Option text"
                                    />
                                    <label className="correct-radio">
                                      <input
                                        type="radio"
                                        name={`correct-${groupIndex}-${quizIndex}`}
                                        checked={option.isCorrect}
                                        onChange={() => {
                                          const nextOptions = quiz.options.map((item, idx) => ({
                                            ...item,
                                            isCorrect: idx === optionIndex,
                                          }));
                                          updateQuiz(groupIndex, quizIndex, { options: nextOptions });
                                        }}
                                      />
                                      Đáp án đúng
                                    </label>
                                    <button
                                      type="button"
                                      className="remove-option-btn"
                                      onClick={() => removeOption(groupIndex, quizIndex, optionIndex)}
                                      disabled={quiz.options.length <= 1}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  editingLesson ? 'Cập nhật' : 'Lưu thay đổi'
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
                  <p>Bài nghe sẽ bị xoá khỏi hệ thống.</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {deleteNotice && <div className={`notice ${deleteNotice.type}`}>{deleteNotice.text}</div>}
              <p>Bạn có chắc muốn xoá bài nghe <strong>{selectedLesson?.title}</strong> không?</p>
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
        .listening-management {
          padding: 24px 28px 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
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

        .header-actions button:hover,
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

        .filters-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-block {
          display: grid;
          gap: 6px;
        }

        .filter-block label {
          color: var(--text-secondary);
          font-size: 0.84rem;
        }

        .filter-block select,
        .search-bar input {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          padding: 10px 12px;
          width: 180px;
        }

        .search-bar {
          position: relative;
          max-width: 360px;
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
          padding-left: 40px;
        }

        .summary {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .summary strong {
          color: var(--text-primary);
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

        .actions-cell {
          display: flex;
          justify-content: left;
          align-items: center;
          gap: 8px;
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

        .existing-media-section {
          margin-bottom: 24px;
        }

        .existing-media-section h4 {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .media-grid {
          display: grid;
          gap: 12px;
        }

        .media-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
        }

        .media-header {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .media-content {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .media-file {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.12);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .media-file a {
          color: inherit;
          text-decoration: none;
        }

        .media-file a:hover {
          text-decoration: underline;
        }

        .upload-section {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
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

        .small-card {
          min-height: 170px;
        }

        .upload-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upload-card-header h4 {
          margin: 0;
          font-size: 1rem;
        }

        .upload-card-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .upload-note {
          color: var(--text-secondary);
          font-size: 0.85rem;
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
        .input-group textarea,
        .input-group select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          padding: 12px 14px;
          font-family: inherit;
          resize: vertical;
        }

        .styled-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        .input-group textarea {
          min-height: 90px;
        }

        .group-list {
          display: grid;
          gap: 18px;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .group-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 18px;
          display: grid;
          gap: 18px;
        }

        .group-card-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }

        .group-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.12);
          font-weight: 700;
        }

        .remove-group {
          border: none;
          background: rgba(248, 113, 113, 0.14);
          color: #fecaca;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
        }

        .row-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .checkbox-row {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .checkbox-row label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.95rem;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .checkbox-row label:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .checkbox-row input[type="checkbox"] {
          accent-color: #6366f1;
        }

        .file-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .file-input-block {
          display: grid;
          gap: 8px;
        }

        .file-field {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          padding: 12px 14px;
          color: var(--text-secondary);
          min-height: 48px;
          display: flex;
          align-items: center;
        }

        .quiz-list {
          display: grid;
          gap: 14px;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .quiz-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 16px;
          display: grid;
          gap: 14px;
          background: rgba(255, 255, 255, 0.03);
        }

        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .quiz-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .options-grid {
          display: grid;
          gap: 12px;
        }

        .option-card {
          display: grid;
          gap: 8px;
        }

        .option-row {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .option-index {
          color: var(--text-secondary);
          white-space: nowrap;
          min-width: 92px;
        }

        .option-input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          padding: 12px 14px;
          font-family: inherit;
        }

        .correct-radio {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(99, 102, 241, 0.24);
          background: rgba(99, 102, 241, 0.12);
          color: var(--text-primary);
          cursor: pointer;
          white-space: nowrap;
        }

        .correct-radio input {
          accent-color: #6366f1;
        }

        .remove-option-btn {
          border: none;
          background: rgba(248, 113, 113, 0.14);
          color: #fecaca;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          min-width: 72px;
        }

        .remove-option-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
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

        @media (max-width: 1100px) {
          .overview-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .upload-section {
            grid-template-columns: 1fr;
          }

          .row-grid,
          .file-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions,
          .filters-row {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ListeningLessonManagement;
