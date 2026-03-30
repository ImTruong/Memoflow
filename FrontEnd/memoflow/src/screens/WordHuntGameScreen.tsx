import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { WordHuntCell, WordHuntProgress } from '../types/wordHunt';
import { fetchVietnameseMeaning, isEnglishWord } from '../api/wordHuntApi';
import { generateWordHuntBoard } from '../utils/wordHuntBoard';

const { width } = Dimensions.get('window');

const ORANGE = '#F97316';
const BOARD_MARGIN_HORIZONTAL = 14;
const BOARD_PADDING = 6;
const CELL_GAP = 4;
const MIN_CELL_SIZE = 23;
const MAX_CELL_SIZE = 36;
const BOARD_BORDER_WIDTH = 2;

type FinishPayload = {
  progressId: number;
  isCompleted: boolean;
  progressPercent: number;
  score: number;
  completedAt?: string;
  hintsUsedToday: number;
};

type FoundPopup = {
  word: string;
  meaning: string;
};

type WordHuntGameScreenProps = {
  progress: WordHuntProgress;
  onBack: () => void;
  onFinish: (payload: FinishPayload) => void;
};

const toCellKey = (row: number, col: number): string => `${row}-${col}`;

const DIRECTION_STEPS: Array<{ rowStep: number; colStep: number }> = [
  { rowStep: 0, colStep: 1 },
  { rowStep: 1, colStep: 1 },
  { rowStep: 1, colStep: 0 },
  { rowStep: 1, colStep: -1 },
  { rowStep: 0, colStep: -1 },
  { rowStep: -1, colStep: -1 },
  { rowStep: -1, colStep: 0 },
  { rowStep: -1, colStep: 1 },
];

const getSnappedLineCells = (start: WordHuntCell, end: WordHuntCell, boardSize: number): WordHuntCell[] => {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;

  if (rowDelta === 0 && colDelta === 0) {
    return [start];
  }

  const angle = Math.atan2(rowDelta, colDelta);
  const directionIndex = Math.round(angle / (Math.PI / 4));
  const normalizedIndex = ((directionIndex % 8) + 8) % 8;
  const direction = DIRECTION_STEPS[normalizedIndex];

  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
  const cells: WordHuntCell[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const row = start.row + i * direction.rowStep;
    const col = start.col + i * direction.colStep;

    if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) {
      break;
    }

    cells.push({ row, col, letter: '' });
  }

  return cells;
};

const formatTime = (seconds: number): string => {
  const minute = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const second = Math.max(0, seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minute}:${second}`;
};

export const WordHuntGameScreen: React.FC<WordHuntGameScreenProps> = ({ progress, onBack, onFinish }) => {
  const content = progress.learningLesson.content;
  const boardSize = useMemo(() => {
    const raw = Number(content.boardSize) || 10;
    return Math.max(8, Math.min(10, raw));
  }, [content.boardSize]);

  const lessonWords = useMemo(
    () => content.words.slice(0, content.targetWordCount).map((item) => ({ ...item, word: item.word.toUpperCase() })),
    [content.words, content.targetWordCount]
  );

  const [boardData, setBoardData] = useState(() => generateWordHuntBoard(lessonWords, boardSize));
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCellKinds, setFoundCellKinds] = useState<Record<string, 'normal' | 'hint'>>({});
  const [selectedCells, setSelectedCells] = useState<WordHuntCell[]>([]);
  const [dragStart, setDragStart] = useState<WordHuntCell | null>(null);
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSeconds);
  const [hintsUsed, setHintsUsed] = useState(progress.hintsUsedToday ?? 0);
  const [activeHintWord, setActiveHintWord] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [foundPopup, setFoundPopup] = useState<FoundPopup | null>(null);
  const [pendingWin, setPendingWin] = useState(false);
  const [isCheckingWord, setIsCheckingWord] = useState(false);

  const boardMaxWidth = Math.min(width - BOARD_MARGIN_HORIZONTAL * 2, 420);
  const rawCellSize = Math.floor(
    (boardMaxWidth - BOARD_PADDING * 2 - CELL_GAP * (boardSize - 1)) / boardSize
  );
  const cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, rawCellSize));
  const boardPixelSize = BOARD_PADDING * 2 + boardSize * cellSize + CELL_GAP * (boardSize - 1);
  const boardGridSize = boardSize * cellSize + CELL_GAP * (boardSize - 1);
  const letterFontSize = Math.max(14, Math.min(22, Math.floor(cellSize * 0.52)));
  const step = cellSize + CELL_GAP;

  const wordMeaningMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of lessonWords) {
      map[item.word] = item.meaningVi;
    }

    return map;
  }, [lessonWords]);

  const placedWordsMap = useMemo(() => {
    const map: Record<string, { meaningVi: string }> = {};
    for (const placed of boardData.placedWords) {
      map[placed.word] = { meaningVi: placed.meaningVi };
    }
    return map;
  }, [boardData.placedWords]);

  const targetWords = useMemo(
    () => lessonWords.filter((item) => placedWordsMap[item.word]),
    [lessonWords, placedWordsMap]
  );
  const targetWordCount = targetWords.length;
  const foundCount = foundWords.size;

  const isGameEnded = showWinModal || showLoseModal;

  const currentHintMeaning = activeHintWord ? wordMeaningMap[activeHintWord] : null;

  const clearErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTransientError = useCallback((message: string) => {
    setErrorMessage(message);
    if (clearErrorTimeoutRef.current) {
      clearTimeout(clearErrorTimeoutRef.current);
    }
    clearErrorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 1800);
  }, []);

  const getCellFromLocalPoint = useCallback(
    (localX: number, localY: number): WordHuntCell | null => {
      if (localX < -step / 2 || localY < -step / 2 || localX > boardGridSize + step / 2 || localY > boardGridSize + step / 2) {
        return null;
      }

      const col = Math.max(0, Math.min(boardSize - 1, Math.round(localX / step)));
      const row = Math.max(0, Math.min(boardSize - 1, Math.round(localY / step)));

      if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
        return null;
      }

      return {
        row,
        col,
        letter: boardData.board[row][col],
      };
    },
    [boardData.board, boardGridSize, boardSize, step]
  );

  const mapLineWithLetters = useCallback(
    (line: WordHuntCell[]): WordHuntCell[] =>
      line.map((cell) => ({
        ...cell,
        letter: boardData.board[cell.row][cell.col],
      })),
    [boardData.board]
  );

  const evaluateSelection = useCallback(
    async (lineCells: WordHuntCell[]) => {
      if (lineCells.length < 2 || isCheckingWord) {
        return;
      }

      const selectedWord = lineCells.map((cell) => cell.letter).join('');
      const reversedWord = selectedWord.split('').reverse().join('');

      const matched = targetWords.find((item) => {
        if (foundWords.has(item.word)) return false;
        return item.word === selectedWord || item.word === reversedWord;
      });

      if (!matched) {
        setIsCheckingWord(true);
        const english = await isEnglishWord(selectedWord.toLowerCase());
        setIsCheckingWord(false);

        if (english) {
          showTransientError(`"${selectedWord}" la tu tieng Anh nhung khong nam trong danh sach.`);
        } else {
          showTransientError('Tu duoc chon khong chinh xac');
        }
        return;
      }

      const hintMatched = activeHintWord === matched.word;
      setFoundWords((prev) => new Set(prev).add(matched.word));
      setFoundCellKinds((prev) => {
        const next = { ...prev };
        for (const cell of lineCells) {
          next[toCellKey(cell.row, cell.col)] = hintMatched ? 'hint' : 'normal';
        }
        return next;
      });

      if (hintMatched) {
        setActiveHintWord(null);
      }

      const fallbackMeaning = wordMeaningMap[matched.word] || placedWordsMap[matched.word]?.meaningVi || '';
      const apiMeaning = fallbackMeaning ? null : await fetchVietnameseMeaning(matched.word);
      const meaning = fallbackMeaning || apiMeaning || 'Tu vung tieng Anh';

      setFoundPopup({
        word: matched.word,
        meaning,
      });

      const nextCount = foundWords.size + 1;
      if (nextCount >= targetWordCount) {
        setPendingWin(true);
      }
    },
    [
      activeHintWord,
      foundWords,
      isCheckingWord,
      placedWordsMap,
      showTransientError,
      targetWordCount,
      targetWords,
      wordMeaningMap,
    ]
  );

  const handleRestart = useCallback(() => {
    const regenerated = generateWordHuntBoard(lessonWords, boardSize);
    setBoardData(regenerated);
    setFoundWords(new Set());
    setFoundCellKinds({});
    setSelectedCells([]);
    setDragStart(null);
    setTimeLeft(content.timeLimitSeconds);
    setActiveHintWord(null);
    setShowLoseModal(false);
    setShowWinModal(false);
    setFoundPopup(null);
    setPendingWin(false);
    setErrorMessage(null);
  }, [boardSize, content.timeLimitSeconds, lessonWords]);

  const finishGame = useCallback(
    (isCompleted: boolean) => {
      const progressPercent = targetWordCount === 0 ? 0 : Math.round((foundWords.size / targetWordCount) * 100);
      const payload: FinishPayload = {
        progressId: progress.id,
        isCompleted,
        progressPercent: isCompleted ? 100 : Math.max(progress.progressPercent, progressPercent),
        score: foundWords.size,
        hintsUsedToday: hintsUsed,
        completedAt: isCompleted ? new Date().toISOString() : progress.completedAt,
      };

      onFinish(payload);
    },
    [foundWords.size, hintsUsed, onFinish, progress.completedAt, progress.id, progress.progressPercent, targetWordCount]
  );

  const panResponder = useMemo<PanResponderInstance>(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isGameEnded,
        onMoveShouldSetPanResponder: () => !isGameEnded,
        onPanResponderGrant: (event) => {
          const cell = getCellFromLocalPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
          if (!cell) return;
          setDragStart(cell);
          setSelectedCells([cell]);
        },
        onPanResponderMove: (event) => {
          if (!dragStart) return;
          const targetCell = getCellFromLocalPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
          if (!targetCell) return;

          const line = getSnappedLineCells(dragStart, targetCell, boardSize);
          if (line.length === 0) {
            setSelectedCells([dragStart]);
            return;
          }

          setSelectedCells(mapLineWithLetters(line));
        },
        onPanResponderRelease: async () => {
          if (selectedCells.length > 1) {
            await evaluateSelection(selectedCells);
          }
          setDragStart(null);
          setSelectedCells([]);
        },
        onPanResponderTerminate: () => {
          setDragStart(null);
          setSelectedCells([]);
        },
      }),
    [boardSize, dragStart, evaluateSelection, getCellFromLocalPoint, isGameEnded, mapLineWithLetters, selectedCells]
  );

  useEffect(() => {
    if (isGameEnded || showHintConfirm || showExitConfirm || foundPopup) {
      return;
    }

    if (timeLeft <= 0) {
      setShowLoseModal(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [foundPopup, isGameEnded, showExitConfirm, showHintConfirm, timeLeft]);

  useEffect(() => {
    return () => {
      if (clearErrorTimeoutRef.current) {
        clearTimeout(clearErrorTimeoutRef.current);
      }
    };
  }, []);

  const hintRemaining = Math.max(content.maxHintsPerDay - hintsUsed, 0);

  const requestHint = () => {
    if (hintRemaining <= 0 || isGameEnded) {
      showTransientError('Ban da het luot goi y hom nay');
      return;
    }

    setShowHintConfirm(true);
  };

  const confirmHint = () => {
    const remainingWords = targetWords
      .map((item) => item.word)
      .filter((word) => !foundWords.has(word));

    if (remainingWords.length === 0) {
      setShowHintConfirm(false);
      return;
    }

    const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    setActiveHintWord(randomWord);
    setHintsUsed((prev) => prev + 1);
    setShowHintConfirm(false);
  };

  const closeFoundPopup = () => {
    setFoundPopup(null);
    if (pendingWin) {
      setPendingWin(false);
      setShowWinModal(true);
      finishGame(true);
    }
  };

  const progressBars = useMemo(() => {
    const bars: boolean[] = [];
    for (let i = 0; i < targetWordCount; i += 1) {
      bars.push(i < foundCount);
    }
    return bars;
  }, [foundCount, targetWordCount]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowExitConfirm(true)}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Word Hunt</Text>
          <Text style={styles.headerSubtitle}>CATEGORY: {progress.learningLesson.title.toUpperCase()}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.timeCard}>
          <View style={styles.timeLabelWrap}>
            <Ionicons name="timer-outline" size={14} color={ORANGE} />
            <Text style={styles.timeLabel}>Time</Text>
          </View>
          <Text style={styles.timeValue}>{formatTime(timeLeft)}</Text>
        </View>

        <TouchableOpacity style={styles.hintButton} onPress={requestHint}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#FFFFFF" />
          <Text style={styles.hintButtonText}>HINT</Text>
        </TouchableOpacity>
      </View>

      {currentHintMeaning && (
        <View style={styles.activeHintBanner}>
          <View style={styles.activeHintIcon}>
            <Ionicons name="bulb-outline" size={14} color="#CA8A04" />
          </View>
          <View>
            <Text style={styles.activeHintTitle}>ACTIVE HINT</Text>
            <Text style={styles.activeHintText}>Goi y: {currentHintMeaning}</Text>
          </View>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#E11D48" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage(null)}>
            <Ionicons name="close" size={16} color="#FB7185" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.boardWrapper}>
        <View style={[styles.boardCard, { width: boardPixelSize, height: boardPixelSize, padding: BOARD_PADDING }]}> 
          <View
            style={styles.boardGridLayer}
          >
            {boardData.board.map((row, rowIndex) => (
              <View
                key={`row-${rowIndex}`}
                style={[styles.boardRow, { marginBottom: rowIndex === boardData.board.length - 1 ? 0 : CELL_GAP }]}
              >
                {row.map((letter, colIndex) => {
                  const key = toCellKey(rowIndex, colIndex);
                  const isSelected = selectedCells.some((cell) => cell.row === rowIndex && cell.col === colIndex);
                  const foundKind = foundCellKinds[key];

                  let backgroundColor = '#E9EEF5';
                  let textColor = '#1F2937';

                  if (foundKind === 'normal') {
                    backgroundColor = '#F97316';
                    textColor = '#FFFFFF';
                  }

                  if (foundKind === 'hint') {
                    backgroundColor = '#22C55E';
                    textColor = '#FFFFFF';
                  }

                  if (isSelected && !foundKind) {
                    backgroundColor = '#FDBA74';
                    textColor = '#7C2D12';
                  }

                  return (
                    <View
                      key={key}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor,
                          marginRight: colIndex === row.length - 1 ? 0 : CELL_GAP,
                        },
                      ]}
                    >
                      <Text style={[styles.cellText, { color: textColor, fontSize: letterFontSize }]}>{letter}</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.gestureOverlay} {...panResponder.panHandlers} />
          </View>
        </View>
      </View>

      <View style={styles.wordProgressCard}>
        <Text style={styles.wordProgressTitle}>WORDSTOFIND({foundCount}/{targetWordCount})</Text>
        <View style={styles.progressBarRow}>
          {progressBars.map((filled, index) => (
            <View key={`progress-${index}`} style={[styles.progressPiece, filled && styles.progressPieceFilled]} />
          ))}
        </View>
      </View>

      <Modal transparent visible={showHintConfirm} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconOrange}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={ORANGE} />
            </View>
            <Text style={styles.modalTitle}>Use a Hint?</Text>
            <Text style={styles.modalDescription}>
              Ban co chac chan muon su dung goi y khong? Luu y: moi ngay chi duoc su dung toi da 3 lan ({hintRemaining}/3).
            </Text>

            <TouchableOpacity style={styles.confirmPrimaryBtn} onPress={confirmHint}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.confirmPrimaryText}>Yes, Use Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmGhostBtn} onPress={() => setShowHintConfirm(false)}>
              <Text style={styles.confirmGhostText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!foundPopup} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardSmall}>
            <View style={styles.modalTopIconGreen}>
              <Ionicons name="checkmark" size={28} color="#22C55E" />
            </View>
            <Text style={styles.wordFoundLabel}>CORRECT!</Text>
            <Text style={styles.wordFoundWord}>{foundPopup?.word}</Text>
            <Text style={styles.wordFoundMeaning}>{foundPopup?.meaning}</Text>

            <TouchableOpacity style={styles.confirmPrimaryBtn} onPress={closeFoundPopup}>
              <Text style={styles.confirmPrimaryText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showExitConfirm} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconBlue}>
              <Ionicons name="pause-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.modalTitle}>Ban co chac muon roi di?</Text>
            <Text style={styles.modalDescription}>Tien trinh tran dau hien tai se khong duoc luu.</Text>

            <TouchableOpacity style={styles.confirmPrimaryBtn} onPress={() => setShowExitConfirm(false)}>
              <Text style={styles.confirmPrimaryText}>TIEP TUC CHOI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmGhostBtn}
              onPress={() => {
                const progressPercent =
                  targetWordCount === 0 ? 0 : Math.round((foundWords.size / targetWordCount) * 100);

                onFinish({
                  progressId: progress.id,
                  isCompleted: false,
                  progressPercent: Math.max(progress.progressPercent, progressPercent),
                  score: foundWords.size,
                  hintsUsedToday: hintsUsed,
                  completedAt: progress.completedAt,
                });
                setShowExitConfirm(false);
                onBack();
              }}
            >
              <Text style={styles.confirmGhostText}>ROI GAME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showLoseModal} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconOrange}>
              <Ionicons name="timer-outline" size={24} color={ORANGE} />
            </View>
            <Text style={styles.modalTitle}>Het gio roi!</Text>
            <Text style={styles.modalDescription}>Ban da tim duoc {foundCount}/{targetWordCount} tu. Thu lai de pha dao diem so nhe.</Text>

            <TouchableOpacity
              style={styles.confirmPrimaryBtn}
              onPress={() => {
                finishGame(false);
                handleRestart();
              }}
            >
              <Text style={styles.confirmPrimaryText}>CHOI LAI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmGhostBtn}
              onPress={() => {
                finishGame(false);
                setShowLoseModal(false);
                onBack();
              }}
            >
              <Text style={styles.confirmGhostText}>VE DANH SACH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showWinModal} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconGreen}>
              <Ionicons name="trophy-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>Ban da chien thang!</Text>
            <Text style={styles.modalDescription}>
              Chuc mung! Ban da tim du {targetWordCount}/{targetWordCount} tu va mo khoa man tiep theo.
            </Text>

            <TouchableOpacity
              style={styles.confirmPrimaryBtn}
              onPress={() => {
                setShowWinModal(false);
                onBack();
              }}
            >
              <Text style={styles.confirmPrimaryText}>TIEP TUC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: ORANGE,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 2,
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  infoRow: {
    marginHorizontal: 12,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
  },
  timeValue: {
    color: ORANGE,
    fontSize: 22,
    fontWeight: '700',
  },
  hintButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  activeHintBanner: {
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    backgroundColor: '#FEFCE8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeHintIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHintTitle: {
    fontSize: 10,
    color: '#A16207',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  activeHintText: {
    marginTop: 2,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },
  errorBanner: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '600',
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  boardCard: {
    borderRadius: 16,
    borderWidth: BOARD_BORDER_WIDTH,
    borderColor: '#CFD8E3',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  boardRow: {
    flexDirection: 'row',
  },
  boardGridLayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gestureOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  cell: {
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontWeight: '700',
  },
  wordProgressCard: {
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  wordProgressTitle: {
    color: '#6B7280',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '700',
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressPiece: {
    flex: 1,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },
  progressPieceFilled: {
    backgroundColor: ORANGE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCardSmall: {
    width: '80%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTopIconOrange: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF1E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTopIconGreen: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTopIconBlue: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalDescription: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 14,
  },
  confirmPrimaryBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: ORANGE,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  confirmPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  confirmGhostBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmGhostText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
  wordFoundLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wordFoundWord: {
    marginTop: 6,
    fontSize: 34,
    color: '#111827',
    fontWeight: '800',
  },
  wordFoundMeaning: {
    marginTop: 4,
    marginBottom: 10,
    color: ORANGE,
    fontSize: 18,
    fontWeight: '700',
  },
});
