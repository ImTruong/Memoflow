import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  Eye,
  BookOpenCheck,
  Zap,
  FileUp,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { adminApi } from '../api/api';
import type { StoryLessonPayload } from '../api/api';
import { parseStoryWordFile } from '../utils/storyWordParser.ts';

type StoryProgressItem = {
  id?: number;
  isCompleted?: boolean;
  progressPercent?: number;
  learningLesson?: {
    id?: number;
    title?: string;
    description?: string;
    learningActivityId?: number;
    content?: unknown;
    image?: {
      url?: string;
    } | null;
  };
};

type StoryLessonRecord = {
  id: number;
  title: string;
  description: string;
  learningActivityId: number;
  imageUrl?: string;
  isCompleted: boolean;
  progressPercent: number;
  content: {
    englishTitle: string;
    paragraphs: string[];
    vocabulary: string[];
  };
};

type StoryWordMapping = {
  source: string;
  english: string;
  placeholder: string;
};

type StoryFormState = {
  title: string;
  description: string;
  englishTitle: string;
  paragraphs: string[];
  paragraphEditor: string;
  vocabulary: string[];
  imageFile: File | null;
  imagePreview: string;
  wordFileName: string;
  parserWarnings: string[];
  wordMappings: StoryWordMapping[];
};

type Notice = {
  type: 'success' | 'error';
  text: string;
};

const DEFAULT_STORY_ACTIVITY_ID = 2;
const MAX_PARAGRAPH_PREVIEW = 3;
const PLACEHOLDER_PATTERN = /\{([^{}]+)\}/g;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
};

const parseVocabularyFromContent = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  value.forEach((item) => {
    let word = '';

    if (typeof item === 'string') {
      word = item.trim();
    } else if (isRecord(item) && typeof item.word === 'string') {
      word = item.word.trim();
    }

    if (word) {
      unique.add(word);
    }
  });

  return Array.from(unique);
};

const parseParagraphEditor = (value: string): string[] => {
  return value
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const toTitleCaseWord = (value: string): string => {
  if (!value) {
    return value;
  }

  if (value.includes('-')) {
    return value
      .split('-')
      .map((item) => toTitleCaseWord(item))
      .join('-');
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const normalizePlaceholderToken = (value: string): string => {
  return value
    .trim()
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_'-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

const normalizePlaceholderBraces = (value: string): string => {
  return value.replace(PLACEHOLDER_PATTERN, (fullMatch: string, rawToken: string) => {
    const normalized = normalizePlaceholderToken(rawToken);
    return normalized ? `{${normalized}}` : fullMatch;
  });
};

const countPlaceholderTokens = (value: string): Map<string, number> => {
  const counts = new Map<string, number>();

  Array.from(value.matchAll(PLACEHOLDER_PATTERN)).forEach((match) => {
    const token = normalizePlaceholderToken(match[1] ?? '');
    if (!token) {
      return;
    }

    counts.set(token, (counts.get(token) ?? 0) + 1);
  });

  return counts;
};

const detectSinglePlaceholderRename = (
  previousEditor: string,
  nextEditor: string,
): { from: string; to: string } | null => {
  const previousCounts = countPlaceholderTokens(previousEditor);
  const nextCounts = countPlaceholderTokens(nextEditor);

  const allKeys = new Set<string>([...previousCounts.keys(), ...nextCounts.keys()]);
  const removed: Array<{ token: string; diff: number }> = [];
  const added: Array<{ token: string; diff: number }> = [];

  allKeys.forEach((token) => {
    const previous = previousCounts.get(token) ?? 0;
    const next = nextCounts.get(token) ?? 0;

    if (previous > next) {
      removed.push({ token, diff: previous - next });
    }

    if (next > previous) {
      added.push({ token, diff: next - previous });
    }
  });

  if (removed.length !== 1 || added.length !== 1) {
    return null;
  }

  if (removed[0].diff !== added[0].diff) {
    return null;
  }

  if (removed[0].token === added[0].token) {
    return null;
  }

  return {
    from: removed[0].token,
    to: added[0].token,
  };
};

const replacePlaceholderToken = (value: string, fromToken: string, toToken: string): string => {
  if (!fromToken || !toToken || fromToken === toToken) {
    return value;
  }

  const pattern = new RegExp(`\\{${escapeRegExp(fromToken)}\\}`, 'gi');
  return value.replace(pattern, `{${toToken}}`);
};

const toVocabularyWord = (token: string): string => {
  const words = token
    .replace(/_+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((item) => item.length > 0);

  return words.map((item) => toTitleCaseWord(item)).join(' ');
};

const extractUniquePlaceholderTokens = (value: string): string[] => {
  const tokens: string[] = [];
  const seen = new Set<string>();

  Array.from(value.matchAll(PLACEHOLDER_PATTERN)).forEach((match) => {
    const token = normalizePlaceholderToken(match[1] ?? '');
    if (!token || seen.has(token)) {
      return;
    }

    seen.add(token);
    tokens.push(token);
  });

  return tokens;
};

const buildVocabularyFromParagraphs = (paragraphs: string[]): string[] => {
  const paragraphText = paragraphs.join('\n\n');
  const tokens = extractUniquePlaceholderTokens(paragraphText);

  return tokens
    .map((token) => toVocabularyWord(token))
    .filter((item) => item.length > 0);
};

const toPlaceholderFromVocabulary = (word: string): string => {
  const token = normalizePlaceholderToken(word);
  return token ? `{${token}}` : '{word}';
};

const syncWordMappings = (
  vocabulary: string[],
  previousMappings: StoryWordMapping[],
): StoryWordMapping[] => {
  const previousByPlaceholder = new Map<string, StoryWordMapping>();

  previousMappings.forEach((item) => {
    previousByPlaceholder.set(item.placeholder.toLowerCase(), item);
  });

  return vocabulary.map((englishWord) => {
    const placeholder = toPlaceholderFromVocabulary(englishWord);
    const existing = previousByPlaceholder.get(placeholder.toLowerCase());

    return {
      source: existing?.source ?? englishWord,
      english: englishWord,
      placeholder,
    };
  });
};

const syncParagraphEditorState = (
  rawEditor: string,
  previousEditor: string,
  previousMappings: StoryWordMapping[],
): Pick<StoryFormState, 'paragraphEditor' | 'paragraphs' | 'vocabulary' | 'wordMappings'> => {
  const normalizedEditor = normalizePlaceholderBraces(rawEditor);
  const rename = detectSinglePlaceholderRename(previousEditor, normalizedEditor);
  const syncedEditor = rename
    ? replacePlaceholderToken(normalizedEditor, rename.from, rename.to)
    : normalizedEditor;

  const paragraphs = parseParagraphEditor(syncedEditor);
  const vocabulary = buildVocabularyFromParagraphs(paragraphs);

  return {
    paragraphEditor: syncedEditor,
    paragraphs,
    vocabulary,
    wordMappings: syncWordMappings(vocabulary, previousMappings),
  };
};

const mapToStoryRecord = (item: StoryProgressItem): StoryLessonRecord => {
  const lesson = item.learningLesson;
  const content = isRecord(lesson?.content) ? lesson.content : {};

  return {
    id: Number(lesson?.id ?? item.id ?? 0),
    title: lesson?.title ?? 'Không có tiêu đề',
    description: lesson?.description ?? '',
    learningActivityId: Number(lesson?.learningActivityId ?? DEFAULT_STORY_ACTIVITY_ID),
    imageUrl: lesson?.image?.url,
    isCompleted: Boolean(item.isCompleted),
    progressPercent: Number(item.progressPercent ?? 0),
    content: {
      englishTitle: typeof content.englishTitle === 'string' ? content.englishTitle : '',
      paragraphs: toStringArray(content.paragraphs),
      vocabulary: parseVocabularyFromContent(content.vocabulary),
    },
  };
};

const buildDefaultForm = (): StoryFormState => ({
  title: '',
  description: '',
  englishTitle: '',
  paragraphs: [],
  paragraphEditor: '',
  vocabulary: [],
  imageFile: null,
  imagePreview: '',
  wordFileName: '',
  parserWarnings: [],
  wordMappings: [],
});

const mapStoryToForm = (lesson: StoryLessonRecord): StoryFormState => {
  const paragraphEditor = lesson.content.paragraphs.join('\n\n');
  const vocabularyFromParagraphs = buildVocabularyFromParagraphs(lesson.content.paragraphs);
  const vocabulary = vocabularyFromParagraphs.length > 0
    ? vocabularyFromParagraphs
    : lesson.content.vocabulary;

  return {
    title: lesson.title,
    description: lesson.description,
    englishTitle: lesson.content.englishTitle,
    paragraphs: lesson.content.paragraphs,
    paragraphEditor,
    vocabulary,
    imageFile: null,
    imagePreview: lesson.imageUrl ?? '',
    wordFileName: '',
    parserWarnings: [],
    wordMappings: syncWordMappings(vocabulary, []),
  };
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const backendMessage = error.response?.data?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const StoryLessonManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lessons, setLessons] = useState<StoryLessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<StoryLessonRecord | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<StoryLessonRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formState, setFormState] = useState<StoryFormState>(buildDefaultForm());

  const fetchLessons = useCallback(async (targetPage: number) => {
    try {
      setRefreshing(true);

      const response = await adminApi.getStoryLessons(targetPage, size);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được danh sách truyện chêm');
      }

      const pageData = response.data as {
        content?: StoryProgressItem[];
        totalPages?: number;
        totalElements?: number;
      };

      const content = Array.isArray(pageData.content) ? pageData.content : [];
      const mapped = content.map(mapToStoryRecord).filter((item) => item.id > 0);

      setLessons(mapped);
      setTotalPages(Math.max(1, Number(pageData.totalPages ?? 1)));
      setTotalElements(Number(pageData.totalElements ?? mapped.length));
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi hệ thống khi tải truyện chêm') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [size]);

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

  const filteredLessons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return lessons;
    }

    return lessons.filter((lesson) => {
      return (
        lesson.title.toLowerCase().includes(keyword) ||
        lesson.description.toLowerCase().includes(keyword) ||
        lesson.content.vocabulary.join(' ').toLowerCase().includes(keyword)
      );
    });
  }, [lessons, searchTerm]);

  const openCreateModal = () => {
    setEditingLesson(null);
    setFormState(buildDefaultForm());
    setShowFormModal(true);
  };

  const openEditModal = async (lesson: StoryLessonRecord) => {
    setEditingLesson(lesson);
    setShowFormModal(true);
    setFormLoading(true);

    try {
      const response = await adminApi.getStoryLessonDetail(lesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không tải được chi tiết truyện chêm');
      }

      const detail = mapToStoryRecord(response.data as StoryProgressItem);
      setFormState(mapStoryToForm(detail));
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi tải dữ liệu truyện chêm') });
      setFormState(mapStoryToForm(lesson));
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

  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
    }));
  };

  const handleWordFileChange = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const parsed = await parseStoryWordFile(file);
      if (parsed.paragraphs.length === 0) {
        throw new Error('Không đọc được đoạn văn nào từ file Word.');
      }

      if (parsed.vocabulary.length === 0) {
        throw new Error('Không tìm thấy từ in đậm để tạo danh sách từ chêm.');
      }

      const synced = syncParagraphEditorState(
        parsed.paragraphs.join('\n\n'),
        '',
        parsed.replacements,
      );

      setFormState((prev) => ({
        ...prev,
        wordFileName: file.name,
        paragraphs: synced.paragraphs,
        paragraphEditor: synced.paragraphEditor,
        vocabulary: synced.vocabulary,
        parserWarnings: parsed.warnings,
        wordMappings: synced.wordMappings,
      }));

      setNotice({
        type: 'success',
        text: `Đã đọc file Word: ${synced.paragraphs.length} đoạn, ${synced.vocabulary.length} từ chêm.`,
      });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi đọc file Word.') });
    }
  };

  const handleParagraphEditorChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      ...syncParagraphEditorState(value, prev.paragraphEditor, prev.wordMappings),
    }));
  };

  const buildStoryPayload = (): StoryLessonPayload | null => {
    const title = formState.title.trim();
    if (!title) {
      setNotice({ type: 'error', text: 'Tiêu đề truyện chêm là bắt buộc.' });
      return null;
    }

    if (!editingLesson && !formState.wordFileName) {
      setNotice({ type: 'error', text: 'Bạn cần upload file Word (.docx) để tạo nội dung truyện.' });
      return null;
    }

    const paragraphs = parseParagraphEditor(formState.paragraphEditor);
    if (paragraphs.length === 0) {
      setNotice({ type: 'error', text: 'Không có đoạn truyện hợp lệ từ file Word.' });
      return null;
    }

    const vocabularyFromParagraphs = buildVocabularyFromParagraphs(paragraphs);
    const vocabulary = vocabularyFromParagraphs.length > 0
      ? vocabularyFromParagraphs
      : formState.vocabulary;

    if (vocabulary.length === 0) {
      setNotice({ type: 'error', text: 'Không có từ chêm để gửi backend.' });
      return null;
    }

    return {
      title,
      description: formState.description.trim() || undefined,
      englishTitle: formState.englishTitle.trim() || undefined,
      paragraphs,
      vocabulary: vocabulary.map((word) => ({ word })),
    };
  };

  const handleSubmit = async () => {
    const payload = buildStoryPayload();
    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingLesson) {
        const response = await adminApi.updateStoryLesson(editingLesson.id, payload, formState.imageFile);
        if (!response.success) {
          throw new Error(response.message || 'Không thể cập nhật truyện chêm');
        }
        setNotice({ type: 'success', text: 'Đã cập nhật truyện chêm thành công.' });
      } else {
        const response = await adminApi.createStoryLesson(DEFAULT_STORY_ACTIVITY_ID, payload, formState.imageFile);
        if (!response.success) {
          throw new Error(response.message || 'Không thể tạo truyện chêm');
        }
        setNotice({ type: 'success', text: 'Đã tạo truyện chêm thành công.' });
      }

      setShowFormModal(false);
      setEditingLesson(null);
      setFormState(buildDefaultForm());
      await fetchLessons(page);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi lưu truyện chêm') });
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
      const response = await adminApi.deleteStoryLesson(selectedLesson.id);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xoá truyện chêm');
      }

      setNotice({ type: 'success', text: 'Đã xoá truyện chêm thành công.' });
      setShowDeleteModal(false);
      setSelectedLesson(null);

      const shouldGoBack = lessons.length === 1 && page > 0;
      const nextPage = shouldGoBack ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchLessons(page);
      }
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Lỗi khi xoá truyện chêm') });
    } finally {
      setSubmitting(false);
    }
  };

  const showBackendEmptyState = totalElements === 0 && searchTerm.trim().length === 0;

  return (
    <div className="story-management">
      <header className="page-header">
        <div className="header-info">
          <h1 className="page-title">Quản lý Truyện chêm</h1>
          <p className="page-subtitle">Danh sách đang lấy từ endpoint /story-lessons (type TRUYEN_CHEM)</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={() => void fetchLessons(page)} disabled={refreshing || loading}>
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="primary-btn" onClick={openCreateModal}>
            <Zap size={18} />
            <span>Tạo truyện chêm</span>
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
              placeholder="Tìm theo tiêu đề, mô tả hoặc từ vựng..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="summary">
            Tổng: <strong>{totalElements}</strong> bản ghi
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <RefreshCw size={30} className="spinning" />
            <p>Đang tải dữ liệu truyện chêm...</p>
          </div>
        ) : (
          <>
            <div className="story-grid">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => (
                  <article key={lesson.id} className="story-card">
                    <div className="story-image-wrap">
                      {lesson.imageUrl ? (
                        <img src={lesson.imageUrl} alt={lesson.title} />
                      ) : (
                        <div className="story-image-placeholder">
                          <BookOpenCheck size={34} color="rgba(255,255,255,0.24)" />
                        </div>
                      )}
                    </div>

                    <div className="story-body">
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description || 'Không có mô tả'}</p>

                      <div className="story-meta">
                        <span>Activity ID: {lesson.learningActivityId}</span>
                        <span>{lesson.content.paragraphs.length} đoạn</span>
                        <span>{lesson.content.vocabulary.length} từ vựng</span>
                      </div>
                    </div>

                    <div className="story-actions">
                      <button className="action-btn" onClick={() => void openEditModal(lesson)}>
                        <Eye size={16} />
                        <span>Sửa</span>
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={16} />
                        <span>Xoá</span>
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <AlertCircle size={48} color="rgba(255,255,255,0.2)" />
                  {showBackendEmptyState ? (
                    <>
                      <p>Backend trả về rỗng: chưa có lesson truyện chêm nào trong DB.</p>
                      <p className="empty-hint">Hãy bấm "Tạo truyện chêm" để thêm bản ghi đầu tiên.</p>
                    </>
                  ) : (
                    <p>Không tìm thấy truyện chêm phù hợp với từ khoá.</p>
                  )}
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
                  <h3>{editingLesson ? 'Cập nhật truyện chêm' : 'Tạo truyện chêm mới'}</h3>
                  <p>Chỉ cần metadata + file Word: FE sẽ tự tạo paragraphs và vocabulary gửi backend</p>
                </div>
              </div>
              <button className="close-btn" onClick={closeFormModal}>
                <X size={20} />
              </button>
            </div>

            {formLoading ? (
              <div className="modal-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Đang tải dữ liệu chi tiết...</span>
              </div>
            ) : (
              <div className="modal-body scrollable">
                <div className="form-grid">
                  <div className="input-group full">
                    <label>Tiêu đề truyện</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Ví dụ: Sư tử và thỏ"
                    />
                  </div>

                  <div className="input-group full">
                    <label>Mô tả</label>
                    <textarea
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Mô tả ngắn cho lesson"
                      rows={2}
                    />
                  </div>

                  <div className="input-group full">
                    <label>Tiêu đề tiếng Anh (tuỳ chọn)</label>
                    <input
                      type="text"
                      value={formState.englishTitle}
                      onChange={(event) => setFormState((prev) => ({ ...prev, englishTitle: event.target.value }))}
                      placeholder="The Lion and the Rabbit"
                    />
                  </div>

                  <div className="input-group full">
                    <label>File Word nội dung (.docx)</label>
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => void handleWordFileChange(event.target.files?.[0])}
                    />
                    <small>
                      Các cụm chữ in đậm trong file sẽ được nhận diện là từ/cụm từ chêm, tự dịch sang tiếng Anh và đưa vào payload.
                    </small>

                    {formState.wordFileName && (
                      <div className="file-badge">
                        <FileUp size={14} />
                        <span>{formState.wordFileName}</span>
                      </div>
                    )}

                    {formState.parserWarnings.length > 0 && (
                      <div className="warning-list">
                        {formState.parserWarnings.map((warning) => (
                          <span key={warning}>{warning}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="input-group full">
                    <label>Ảnh đại diện (tuỳ chọn)</label>
                    <input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0])} />
                    {formState.imagePreview && (
                      <div className="image-preview-wrap">
                        <img src={formState.imagePreview} alt="story-preview" />
                      </div>
                    )}
                  </div>

                  <div className="input-group full preview-box">
                    <label>Preview dữ liệu FE sẽ gửi backend</label>

                    <div className="preview-stats">
                      <span>{formState.paragraphs.length} đoạn</span>
                      <span>{formState.vocabulary.length} từ chêm</span>
                      <span>Activity ID: {DEFAULT_STORY_ACTIVITY_ID}</span>
                    </div>

                    {formState.wordMappings.length > 0 && (
                      <div className="mapping-list">
                        {formState.wordMappings.map((item) => (
                          <div key={`${item.source}-${item.placeholder}`} className="mapping-item">
                            <span>{item.source}</span>
                            <strong>{item.placeholder}</strong>
                            <em>{item.english}</em>
                          </div>
                        ))}
                      </div>
                    )}

                    {formState.vocabulary.length > 0 && (
                      <div className="chip-list">
                        {formState.vocabulary.map((word) => (
                          <span key={word} className="chip">{word}</span>
                        ))}
                      </div>
                    )}

                    {formState.paragraphs.length > 0 && (
                      <ol className="paragraph-preview">
                        {formState.paragraphs.slice(0, MAX_PARAGRAPH_PREVIEW).map((paragraph, index) => (
                          <li key={`${index}-${paragraph.length}`}>{paragraph}</li>
                        ))}
                      </ol>
                    )}

                    <div className="paragraph-editor">
                      <label>
                        Chỉnh sửa nội dung gửi lên backend (mỗi đoạn cách nhau 1 dòng trống). Khi đổi 1 từ
                        trong {`{}`}, các từ giống nó sẽ tự đồng bộ và danh sách từ vựng tự cập nhật.
                      </label>
                      <textarea
                        rows={8}
                        value={formState.paragraphEditor}
                        onChange={(event) => handleParagraphEditorChange(event.target.value)}
                        placeholder="Nội dung đoạn 1...\n\nNội dung đoạn 2..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="secondary-btn" onClick={closeFormModal} disabled={submitting}>
                Huỷ
              </button>
              <button
                className="primary-btn"
                onClick={() => void handleSubmit()}
                disabled={submitting || formLoading}
              >
                {submitting ? 'Đang lưu...' : editingLesson ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedLesson && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon warning">
                <AlertCircle size={22} color="#ef4444" />
              </div>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>Xoá truyện chêm?</h3>
              <p>
                Bạn có chắc muốn xoá <strong>{selectedLesson.title}</strong>? Hành động này không thể hoàn tác.
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
        .story-management {
          padding: 32px 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .page-title {
          font-size: 1.9rem;
          margin: 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .refresh-btn,
        .primary-btn,
        .secondary-btn,
        .danger-btn,
        .action-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          font-family: inherit;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .primary-btn {
          background: var(--primary);
          color: white;
        }

        .primary-btn:hover {
          background: var(--primary-hover);
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .danger-btn {
          background: var(--danger);
          color: #fff;
        }

        .danger-btn:hover {
          background: var(--danger-hover);
        }

        .notice {
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 0.92rem;
        }

        .notice.success {
          background: rgba(16, 185, 129, 0.16);
          border: 1px solid rgba(16, 185, 129, 0.34);
          color: #6ee7b7;
        }

        .notice.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.34);
          color: #fda4af;
        }

        .table-container {
          background-color: var(--bg-card);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .table-header-tools {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
        }

        .summary {
          color: var(--text-secondary);
          font-size: 0.9rem;
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
          padding: 12px 14px 12px 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          font-family: inherit;
        }

        .search-bar input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .table-loading {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .story-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
          padding: 20px;
        }

        .story-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .story-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 102, 241, 0.56);
        }

        .story-image-wrap {
          height: 140px;
          background: rgba(0, 0, 0, 0.2);
        }

        .story-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .story-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .story-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .story-body h3 {
          margin: 0;
          font-size: 1rem;
        }

        .story-body p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.45;
          min-height: 40px;
        }

        .story-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .story-meta span {
          font-size: 0.75rem;
          background: rgba(148, 163, 184, 0.16);
          color: #cbd5e1;
          padding: 4px 8px;
          border-radius: 999px;
        }

        .story-actions {
          display: flex;
          gap: 8px;
          padding: 0 16px 16px;
        }

        .action-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          font-size: 0.86rem;
          padding: 9px 10px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .action-btn.danger {
          background: rgba(239, 68, 68, 0.18);
          color: #fecaca;
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .empty-state {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-secondary);
          grid-column: 1 / -1;
          text-align: center;
          padding: 0 20px;
        }

        .empty-hint {
          color: #c7d2fe;
          font-size: 0.88rem;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 20px 20px;
        }

        .pagination button {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: 0.5;
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
          z-index: 200;
          padding: 20px;
        }

        .modal-card {
          width: min(520px, 100%);
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
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-title-area {
          display: flex;
          gap: 12px;
        }

        .modal-title-area h3 {
          margin: 0;
          font-size: 1.08rem;
        }

        .modal-title-area p {
          margin: 4px 0 0;
          color: var(--text-secondary);
          font-size: 0.86rem;
        }

        .modal-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
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
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .modal-loading {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text-secondary);
        }

        .modal-body {
          padding: 18px 20px;
        }

        .modal-body.scrollable {
          overflow-y: auto;
        }

        .modal-body h3 {
          margin-top: 0;
        }

        .modal-body p {
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        .modal-footer {
          padding: 14px 20px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group.full {
          grid-column: 1 / -1;
        }

        .input-group label {
          font-size: 0.84rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.94rem;
          padding: 10px 12px;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.7);
        }

        .input-group small {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .file-badge {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          border: 1px solid rgba(99, 102, 241, 0.35);
          background: rgba(99, 102, 241, 0.14);
          color: #c7d2fe;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
        }

        .warning-list {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .warning-list span {
          font-size: 0.79rem;
          color: #fbbf24;
        }

        .image-preview-wrap {
          width: 240px;
          max-width: 100%;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-preview-wrap img {
          width: 100%;
          display: block;
        }

        .preview-box {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.55);
        }

        .preview-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }

        .preview-stats span {
          font-size: 0.78rem;
          background: rgba(148, 163, 184, 0.18);
          color: #cbd5e1;
          border-radius: 999px;
          padding: 4px 8px;
        }

        .mapping-list {
          max-height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
          padding-right: 4px;
        }

        .mapping-item {
          display: grid;
          grid-template-columns: minmax(100px, 1fr) minmax(120px, auto) minmax(100px, 1fr);
          gap: 8px;
          align-items: center;
          font-size: 0.82rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.03);
        }

        .mapping-item span {
          color: #f8fafc;
        }

        .mapping-item strong {
          color: #a5b4fc;
          text-align: center;
        }

        .mapping-item em {
          color: #86efac;
          font-style: normal;
          text-align: right;
        }

        .chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .chip {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.18);
          color: #c7d2fe;
          border: 1px solid rgba(99, 102, 241, 0.35);
        }

        .paragraph-preview {
          margin: 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #cbd5e1;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .paragraph-editor {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .paragraph-editor label {
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
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
          .story-management {
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

          .form-grid {
            grid-template-columns: 1fr;
          }

          .story-grid {
            grid-template-columns: 1fr;
          }

          .mapping-item {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .mapping-item em,
          .mapping-item strong {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default StoryLessonManagement;
