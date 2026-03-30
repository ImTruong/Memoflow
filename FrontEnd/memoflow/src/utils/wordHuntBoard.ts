import { WordHuntCell, WordHuntPlacedWord, WordHuntVocabularyItem } from '../types/wordHunt';

type Direction = {
  rowStep: number;
  colStep: number;
};

const DIRECTIONS: Direction[] = [
  { rowStep: 0, colStep: 1 },
  { rowStep: 1, colStep: 0 },
  { rowStep: 1, colStep: 1 },
  { rowStep: 1, colStep: -1 },
  { rowStep: 0, colStep: -1 },
  { rowStep: -1, colStep: 0 },
  { rowStep: -1, colStep: -1 },
  { rowStep: -1, colStep: 1 },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export type GeneratedBoard = {
  board: string[][];
  placedWords: WordHuntPlacedWord[];
};

function createEmptyBoard(size: number): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomLetter(): string {
  return ALPHABET[randomInt(ALPHABET.length)];
}

function canPlaceWord(
  board: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): boolean {
  const size = board.length;

  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + i * direction.rowStep;
    const col = startCol + i * direction.colStep;

    if (row < 0 || col < 0 || row >= size || col >= size) {
      return false;
    }

    const existing = board[row][col];
    if (existing && existing !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  board: string[][],
  word: string,
  meaningVi: string,
  startRow: number,
  startCol: number,
  direction: Direction
): WordHuntPlacedWord {
  const cells: WordHuntCell[] = [];

  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + i * direction.rowStep;
    const col = startCol + i * direction.colStep;
    board[row][col] = word[i];
    cells.push({ row, col, letter: word[i] });
  }

  return {
    word,
    meaningVi,
    cells,
  };
}

function fillRemainingCells(board: string[][]): void {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (!board[row][col]) {
        board[row][col] = randomLetter();
      }
    }
  }
}

function normalizeWord(word: string): string {
  return word.trim().toUpperCase().replace(/[^A-Z]/g, '');
}

export function generateWordHuntBoard(words: WordHuntVocabularyItem[], size: number): GeneratedBoard {
  const sanitizedWords = words
    .map((item) => ({ ...item, word: normalizeWord(item.word) }))
    .filter((item) => item.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length);

  if (sanitizedWords.length === 0) {
    return {
      board: createEmptyBoard(size).map((row) => row.map(() => randomLetter())),
      placedWords: [],
    };
  }

  for (let generationAttempt = 0; generationAttempt < 30; generationAttempt += 1) {
    const board = createEmptyBoard(size);
    const placedWords: WordHuntPlacedWord[] = [];
    let allPlaced = true;

    for (const item of sanitizedWords) {
      let placed = false;

      for (let attempt = 0; attempt < 220; attempt += 1) {
        const direction = DIRECTIONS[randomInt(DIRECTIONS.length)];
        const startRow = randomInt(size);
        const startCol = randomInt(size);

        if (!canPlaceWord(board, item.word, startRow, startCol, direction)) {
          continue;
        }

        const placement = placeWord(board, item.word, item.meaningVi, startRow, startCol, direction);
        placedWords.push(placement);
        placed = true;
        break;
      }

      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (!allPlaced) {
      continue;
    }

    fillRemainingCells(board);

    return {
      board,
      placedWords,
    };
  }

  // Fallback for very dense word sets.
  const fallbackBoard = createEmptyBoard(size);
  fillRemainingCells(fallbackBoard);
  return {
    board: fallbackBoard,
    placedWords: [],
  };
}

export function getLineCells(start: WordHuntCell, end: WordHuntCell): WordHuntCell[] {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;

  const isHorizontal = rowDelta === 0;
  const isVertical = colDelta === 0;
  const isDiagonal = Math.abs(rowDelta) === Math.abs(colDelta);

  if (!isHorizontal && !isVertical && !isDiagonal) {
    return [];
  }

  const rowStep = rowDelta === 0 ? 0 : rowDelta > 0 ? 1 : -1;
  const colStep = colDelta === 0 ? 0 : colDelta > 0 ? 1 : -1;
  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));

  const cells: WordHuntCell[] = [];
  for (let i = 0; i <= steps; i += 1) {
    cells.push({
      row: start.row + i * rowStep,
      col: start.col + i * colStep,
      letter: '',
    });
  }

  return cells;
}
