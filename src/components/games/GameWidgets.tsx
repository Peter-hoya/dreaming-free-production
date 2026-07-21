"use client";

import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Clock,
  FlagCheckered,
  Trophy,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";

import type { GameSlug, Locale } from "@/data/site";
import { ArcadeShooter } from "@/components/games/ArcadeShooter";

type Direction = "up" | "down" | "left" | "right";
type Game2048Status = "playing" | "won" | "lost";
type MemoryStatus = "ready" | "playing" | "won";

interface GameWidgetProps {
  slug: GameSlug;
  locale: Locale;
}

interface SlideResult {
  values: number[];
  gained: number;
}

interface BoardMoveResult {
  board: number[];
  gained: number;
  moved: boolean;
}

interface MemoryCard {
  id: string;
  symbol: string;
  matched: boolean;
}

interface MemoryBest {
  moves: number;
  seconds: number;
}

const BOARD_SIZE = 4;
const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;
const HIGH_SCORE_KEY = "moatools:merge-2048:high-score";
const MEMORY_BEST_KEY = "moatools:memory-match:best";
const MEMORY_SYMBOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const copy = {
  ko: {
    score: "점수",
    best: "최고 점수",
    restart: "다시 시작",
    keepPlaying: "계속하기",
    playAgain: "한 판 더",
    won2048: "2048을 만들었습니다",
    lost2048: "움직일 수 있는 칸이 없습니다",
    instructions2048: "방향키, 화면 버튼 또는 스와이프로 같은 숫자를 합치세요.",
    board2048: "2048 숫자 합치기 게임판",
    controls2048: "2048 이동 버튼",
    moveUp: "위로 이동",
    moveDown: "아래로 이동",
    moveLeft: "왼쪽으로 이동",
    moveRight: "오른쪽으로 이동",
    emptyCell: (position: number) => `${position}번 칸, 빈칸`,
    numberCell: (position: number, value: number) => `${position}번 칸, 숫자 ${value}`,
    moves: "이동 횟수",
    time: "시간",
    pairs: "찾은 짝",
    bestResult: "최고 기록",
    instructionsMemory: "카드 두 장을 열어 같은 글자를 찾으세요.",
    boardMemory: "기억력 카드 맞추기 게임판",
    memoryWon: "모든 짝을 찾았습니다",
    noBest: "첫 기록을 만들어 보세요",
    hiddenCard: (position: number) => `${position}번 닫힌 카드`,
    openCard: (symbol: string) => `${symbol} 카드가 열림`,
    matchedCard: (symbol: string) => `${symbol} 카드 짝 맞춤`,
    seconds: (value: number) => `${value}초`,
    movesCount: (value: number) => `${value}회`,
    pairCount: (matched: number, total: number) => `${matched}/${total}`,
    resultSummary: (moves: number, seconds: number) => `${moves}회, ${seconds}초`,
  },
  en: {
    score: "Score",
    best: "Best score",
    restart: "Restart",
    keepPlaying: "Keep playing",
    playAgain: "Play again",
    won2048: "You made 2048",
    lost2048: "No moves left",
    instructions2048: "Use arrow keys, the controls, or a swipe to merge matching numbers.",
    board2048: "2048 merge game board",
    controls2048: "2048 movement controls",
    moveUp: "Move up",
    moveDown: "Move down",
    moveLeft: "Move left",
    moveRight: "Move right",
    emptyCell: (position: number) => `Cell ${position}, empty`,
    numberCell: (position: number, value: number) => `Cell ${position}, number ${value}`,
    moves: "Moves",
    time: "Time",
    pairs: "Pairs",
    bestResult: "Best result",
    instructionsMemory: "Turn over two cards and find every matching letter.",
    boardMemory: "Memory match card board",
    memoryWon: "You found every pair",
    noBest: "Set your first record",
    hiddenCard: (position: number) => `Hidden card ${position}`,
    openCard: (symbol: string) => `Card ${symbol} is face up`,
    matchedCard: (symbol: string) => `Matched card ${symbol}`,
    seconds: (value: number) => `${value}s`,
    movesCount: (value: number) => `${value}`,
    pairCount: (matched: number, total: number) => `${matched}/${total}`,
    resultSummary: (moves: number, seconds: number) => `${moves} moves, ${seconds}s`,
  },
} as const;

function deterministicOpeningBoard() {
  const board = Array<number>(BOARD_CELLS).fill(0);
  board[5] = 2;
  board[10] = 2;
  return board;
}

function addRandomTile(board: number[]) {
  const emptyIndexes = board.flatMap((value, index) => (value === 0 ? [index] : []));

  if (emptyIndexes.length === 0) {
    return board;
  }

  const next = [...board];
  const index = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  next[index] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function randomOpeningBoard() {
  return addRandomTile(addRandomTile(Array<number>(BOARD_CELLS).fill(0)));
}

function slideLine(line: number[]): SlideResult {
  const compact = line.filter((value) => value !== 0);
  const values: number[] = [];
  let gained = 0;

  for (let index = 0; index < compact.length; index += 1) {
    if (compact[index] === compact[index + 1]) {
      const merged = compact[index] * 2;
      values.push(merged);
      gained += merged;
      index += 1;
    } else {
      values.push(compact[index]);
    }
  }

  while (values.length < BOARD_SIZE) {
    values.push(0);
  }

  return { values, gained };
}

function moveBoard(board: number[], direction: Direction): BoardMoveResult {
  const next = Array<number>(BOARD_CELLS).fill(0);
  let gained = 0;

  for (let outer = 0; outer < BOARD_SIZE; outer += 1) {
    const line: number[] = [];

    for (let inner = 0; inner < BOARD_SIZE; inner += 1) {
      const index =
        direction === "left" || direction === "right"
          ? outer * BOARD_SIZE + inner
          : inner * BOARD_SIZE + outer;
      line.push(board[index]);
    }

    const reversed = direction === "right" || direction === "down";
    const source = reversed ? [...line].reverse() : line;
    const result = slideLine(source);
    const movedLine = reversed ? [...result.values].reverse() : result.values;
    gained += result.gained;

    for (let inner = 0; inner < BOARD_SIZE; inner += 1) {
      const index =
        direction === "left" || direction === "right"
          ? outer * BOARD_SIZE + inner
          : inner * BOARD_SIZE + outer;
      next[index] = movedLine[inner];
    }
  }

  return {
    board: next,
    gained,
    moved: next.some((value, index) => value !== board[index]),
  };
}

function canMove(board: number[]) {
  if (board.some((value) => value === 0)) {
    return true;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const index = row * BOARD_SIZE + column;
      const right = column < BOARD_SIZE - 1 ? board[index + 1] : undefined;
      const below = row < BOARD_SIZE - 1 ? board[index + BOARD_SIZE] : undefined;

      if (board[index] === right || board[index] === below) {
        return true;
      }
    }
  }

  return false;
}

function tileClasses(value: number) {
  const base =
    "merge-tile flex aspect-square min-w-0 items-center justify-center rounded-[18px] font-black tabular-nums transition-colors duration-150";
  const tone = value === 0 ? "empty" : value >= 2048 ? "2048" : String(value);
  return `${base} merge-tile--${tone}`;
}

function tileTextClasses(value: number) {
  if (value >= 1024) return "text-[clamp(1.15rem,6vw,2.25rem)]";
  if (value >= 128) return "text-[clamp(1.35rem,7vw,2.75rem)]";
  return "text-[clamp(1.65rem,8vw,3.25rem)]";
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-3 shadow-[var(--shadow-soft)] sm:px-4">
      <div className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-lg font-black tabular-nums text-[var(--ink)] sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function RestartButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <ArrowCounterClockwise aria-hidden="true" size={18} weight="bold" />
      {label}
    </button>
  );
}

function Merge2048({ locale }: { locale: Locale }) {
  const strings = copy[locale];
  const [board, setBoard] = useState<number[]>(deterministicOpeningBoard);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<Game2048Status>("playing");
  const [continuedAfterWin, setContinuedAfterWin] = useState(false);
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const highScoreRef = useRef(highScore);
  const statusRef = useRef<Game2048Status>(status);
  const continuedRef = useRef(continuedAfterWin);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const loadStoredScore = window.setTimeout(() => {
      try {
        const stored = Number.parseInt(window.localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10);
        if (Number.isFinite(stored) && stored > 0) {
          highScoreRef.current = stored;
          setHighScore(stored);
        }
      } catch {
        // The game remains fully usable when storage is blocked.
      }

    }, 0);

    return () => window.clearTimeout(loadStoredScore);
  }, []);

  const persistHighScore = useCallback((value: number) => {
    if (value <= highScoreRef.current) return;

    highScoreRef.current = value;
    setHighScore(value);
    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
    } catch {
      // Ignore private mode and storage quota errors.
    }
  }, []);

  const performMove = useCallback(
    (direction: Direction) => {
      if (statusRef.current !== "playing") return;

      const result = moveBoard(boardRef.current, direction);
      if (!result.moved) return;

      const nextBoard = addRandomTile(result.board);
      const nextScore = scoreRef.current + result.gained;
      boardRef.current = nextBoard;
      scoreRef.current = nextScore;
      setBoard(nextBoard);
      setScore(nextScore);
      persistHighScore(nextScore);

      if (!continuedRef.current && nextBoard.some((value) => value >= 2048)) {
        statusRef.current = "won";
        setStatus("won");
      } else if (!canMove(nextBoard)) {
        statusRef.current = "lost";
        setStatus("lost");
      }
    },
    [persistHighScore],
  );

  const restart = useCallback(() => {
    const nextBoard = randomOpeningBoard();
    boardRef.current = nextBoard;
    scoreRef.current = 0;
    statusRef.current = "playing";
    continuedRef.current = false;
    setBoard(nextBoard);
    setScore(0);
    setStatus("playing");
    setContinuedAfterWin(false);
  }, []);

  const keepPlaying = useCallback(() => {
    continuedRef.current = true;
    setContinuedAfterWin(true);

    if (canMove(boardRef.current)) {
      statusRef.current = "playing";
      setStatus("playing");
    } else {
      statusRef.current = "lost";
      setStatus("lost");
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Partial<Record<string, Direction>> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const direction = directions[event.key];

    if (direction) {
      event.preventDefault();
      performMove(direction);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 28) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      performMove(deltaX > 0 ? "right" : "left");
    } else {
      performMove(deltaY > 0 ? "down" : "up");
    }
  };

  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  return (
    <section
      className="game-shell w-full"
      onKeyDown={handleKeyDown}
      aria-label={strings.board2048}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <StatCard
          icon={<FlagCheckered aria-hidden="true" size={15} weight="bold" />}
          label={strings.score}
          value={score.toLocaleString(numberLocale)}
        />
        <StatCard
          icon={<Trophy aria-hidden="true" size={15} weight="bold" />}
          label={strings.best}
          value={highScore.toLocaleString(numberLocale)}
        />
      </div>

      <p id="merge-2048-instructions" className="mx-auto my-4 max-w-lg text-center text-sm leading-6 text-[var(--muted)]">
        {strings.instructions2048}
      </p>

      <div
        className="relative mx-auto grid aspect-square w-full max-w-[460px] touch-none grid-cols-4 gap-2 rounded-[26px] bg-[#18211d] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:gap-3 sm:p-3"
        role="grid"
        tabIndex={0}
        aria-label={strings.board2048}
        aria-describedby="merge-2048-instructions"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: BOARD_SIZE }, (_, rowIndex) => (
          <div className="contents" role="row" key={rowIndex}>
            {board
              .slice(rowIndex * BOARD_SIZE, (rowIndex + 1) * BOARD_SIZE)
              .map((value, columnIndex) => {
                const index = rowIndex * BOARD_SIZE + columnIndex;
                return (
                  <div
                    key={index}
                    role="gridcell"
                    aria-rowindex={rowIndex + 1}
                    aria-colindex={columnIndex + 1}
                    aria-label={value === 0
                      ? strings.emptyCell(index + 1)
                      : strings.numberCell(index + 1, value)}
                    className={tileClasses(value)}
                  >
                    {value !== 0 && <span className={tileTextClasses(value)}>{value}</span>}
                  </div>
                );
              })}
          </div>
        ))}

        {status !== "playing" && (
          <div
            className="absolute inset-2 z-10 flex flex-col items-center justify-center rounded-[20px] bg-[#101714]/92 px-6 text-center text-[#f0f3ed] backdrop-blur-sm sm:inset-3"
            role="status"
            aria-live="assertive"
          >
            {status === "won" ? (
              <Trophy aria-hidden="true" className="mb-3 text-[var(--accent)]" size={36} weight="fill" />
            ) : (
              <FlagCheckered aria-hidden="true" className="mb-3 text-[var(--accent)]" size={36} weight="fill" />
            )}
            <p className="text-xl font-black sm:text-2xl">
              {status === "won" ? strings.won2048 : strings.lost2048}
            </p>
            <p className="mt-2 text-sm text-[#f0f3ed]/70">
              {strings.score}: {score.toLocaleString(numberLocale)}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {status === "won" && (
                <button
                  type="button"
                  onClick={keepPlaying}
                  className="min-h-11 rounded-[14px] bg-[var(--accent)] px-5 text-sm font-black text-[var(--accent-contrast)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f3ed]"
                >
                  {strings.keepPlaying}
                </button>
              )}
              <button
                type="button"
                onClick={restart}
                className="min-h-11 rounded-[14px] border border-[#f0f3ed]/25 px-5 text-sm font-bold text-[#f0f3ed] transition hover:bg-[#f0f3ed]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f3ed]"
              >
                {strings.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-4">
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label={strings.controls2048}
        >
          <span aria-hidden="true" />
          <DirectionButton label={strings.moveUp} onClick={() => performMove("up")}>
            <ArrowUp aria-hidden="true" size={22} weight="bold" />
          </DirectionButton>
          <span aria-hidden="true" />
          <DirectionButton label={strings.moveLeft} onClick={() => performMove("left")}>
            <ArrowLeft aria-hidden="true" size={22} weight="bold" />
          </DirectionButton>
          <DirectionButton label={strings.moveDown} onClick={() => performMove("down")}>
            <ArrowDown aria-hidden="true" size={22} weight="bold" />
          </DirectionButton>
          <DirectionButton label={strings.moveRight} onClick={() => performMove("right")}>
            <ArrowRight aria-hidden="true" size={22} weight="bold" />
          </DirectionButton>
        </div>
        <RestartButton label={strings.restart} onClick={restart} />
      </div>
    </section>
  );
}

function DirectionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--bg-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-0"
    >
      {children}
    </button>
  );
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createMemoryDeck(): MemoryCard[] {
  return shuffle(deterministicMemoryDeck());
}

function deterministicMemoryDeck(): MemoryCard[] {
  return MEMORY_SYMBOLS.flatMap((symbol) => [0, 1].map((copyIndex) => ({
      id: `${symbol}-${copyIndex}`,
      symbol,
      matched: false,
    })));
}

function isValidBest(value: unknown): value is MemoryBest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MemoryBest>;
  return (
    typeof candidate.moves === "number" &&
    Number.isFinite(candidate.moves) &&
    candidate.moves > 0 &&
    typeof candidate.seconds === "number" &&
    Number.isFinite(candidate.seconds) &&
    candidate.seconds >= 0
  );
}

function isBetterResult(candidate: MemoryBest, current: MemoryBest | null) {
  if (!current) return true;
  return (
    candidate.moves < current.moves ||
    (candidate.moves === current.moves && candidate.seconds < current.seconds)
  );
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function memoryCardClasses(symbol: string) {
  return `memory-symbol memory-symbol--${symbol.toLowerCase()}`;
}

function MemoryMatch({ locale }: { locale: Locale }) {
  const strings = copy[locale];
  const [cards, setCards] = useState<MemoryCard[]>(deterministicMemoryDeck);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<MemoryBest | null>(null);
  const [status, setStatus] = useState<MemoryStatus>("ready");
  const [locked, setLocked] = useState(false);
  const cardsRef = useRef(cards);
  const openIndexesRef = useRef<number[]>([]);
  const movesRef = useRef(0);
  const bestRef = useRef<MemoryBest | null>(null);
  const statusRef = useRef<MemoryStatus>("ready");
  const lockedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const resolveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadStoredBest = window.setTimeout(() => {
      const shuffledCards = createMemoryDeck();
      cardsRef.current = shuffledCards;
      setCards(shuffledCards);

      try {
        const raw = window.localStorage.getItem(MEMORY_BEST_KEY);
        if (!raw) return;
        const stored: unknown = JSON.parse(raw);
        if (isValidBest(stored)) {
          bestRef.current = stored;
          setBest(stored);
        }
      } catch {
        // The game remains usable if the stored value is malformed or unavailable.
      }

    }, 0);

    return () => window.clearTimeout(loadStoredBest);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;

    const updateElapsed = () => {
      const startedAt = startedAtRef.current;
      if (startedAt !== null) {
        setElapsed(Math.floor((window.performance.now() - startedAt) / 1000));
      }
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 250);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(
    () => () => {
      if (resolveTimeoutRef.current) {
        clearTimeout(resolveTimeoutRef.current);
      }
    },
    [],
  );

  const saveBest = useCallback((result: MemoryBest) => {
    if (!isBetterResult(result, bestRef.current)) return;

    bestRef.current = result;
    setBest(result);
    try {
      window.localStorage.setItem(MEMORY_BEST_KEY, JSON.stringify(result));
    } catch {
      // Ignore storage errors; the current result remains visible.
    }
  }, []);

  const restart = useCallback(() => {
    if (resolveTimeoutRef.current) {
      clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }

    const nextCards = createMemoryDeck();
    cardsRef.current = nextCards;
    openIndexesRef.current = [];
    movesRef.current = 0;
    statusRef.current = "ready";
    lockedRef.current = false;
    startedAtRef.current = null;
    setCards(nextCards);
    setOpenIndexes([]);
    setMoves(0);
    setElapsed(0);
    setStatus("ready");
    setLocked(false);
  }, []);

  const handleCardClick = (index: number) => {
    const currentCard = cardsRef.current[index];
    if (
      !currentCard ||
      currentCard.matched ||
      lockedRef.current ||
      statusRef.current === "won" ||
      openIndexesRef.current.includes(index)
    ) {
      return;
    }

    if (statusRef.current === "ready") {
      startedAtRef.current = window.performance.now();
      statusRef.current = "playing";
      setStatus("playing");
    }

    if (openIndexesRef.current.length === 0) {
      openIndexesRef.current = [index];
      setOpenIndexes([index]);
      return;
    }

    const firstIndex = openIndexesRef.current[0];
    const pair = [firstIndex, index];
    const nextMoves = movesRef.current + 1;
    openIndexesRef.current = pair;
    movesRef.current = nextMoves;
    lockedRef.current = true;
    setOpenIndexes(pair);
    setMoves(nextMoves);
    setLocked(true);

    const isMatch = cardsRef.current[firstIndex].symbol === currentCard.symbol;
    resolveTimeoutRef.current = setTimeout(() => {
      if (isMatch) {
        const matchedIds = new Set([cardsRef.current[firstIndex].id, currentCard.id]);
        const nextCards = cardsRef.current.map((card) =>
          matchedIds.has(card.id) ? { ...card, matched: true } : card,
        );
        cardsRef.current = nextCards;
        setCards(nextCards);

        if (nextCards.every((card) => card.matched)) {
          const startedAt = startedAtRef.current ?? window.performance.now();
          const finalSeconds = Math.floor((window.performance.now() - startedAt) / 1000);
          const result = { moves: nextMoves, seconds: finalSeconds };
          statusRef.current = "won";
          setElapsed(finalSeconds);
          setStatus("won");
          saveBest(result);
        }
      }

      openIndexesRef.current = [];
      lockedRef.current = false;
      resolveTimeoutRef.current = null;
      setOpenIndexes([]);
      setLocked(false);
    }, isMatch ? 360 : 650);
  };

  const matchedPairs = cards.filter((card) => card.matched).length / 2;
  const bestText = best ? strings.resultSummary(best.moves, best.seconds) : strings.noBest;

  return (
    <section className="game-shell w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          icon={<FlagCheckered aria-hidden="true" size={15} weight="bold" />}
          label={strings.moves}
          value={strings.movesCount(moves)}
        />
        <StatCard
          icon={<Clock aria-hidden="true" size={15} weight="bold" />}
          label={strings.time}
          value={formatClock(elapsed)}
        />
        <StatCard
          icon={<Trophy aria-hidden="true" size={15} weight="bold" />}
          label={strings.pairs}
          value={strings.pairCount(matchedPairs, MEMORY_SYMBOLS.length)}
        />
      </div>

      <p id="memory-match-instructions" className="mx-auto my-4 max-w-lg text-center text-sm leading-6 text-[var(--muted)]">
        {strings.instructionsMemory}
      </p>

      <div
        className="relative mx-auto grid aspect-square w-full max-w-[500px] grid-cols-4 gap-2 rounded-[26px] bg-[#18211d] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:gap-3 sm:p-3"
        role="group"
        aria-label={strings.boardMemory}
        aria-describedby="memory-match-instructions"
      >
        {cards.map((card, index) => {
          const isOpen = card.matched || openIndexes.includes(index);
          const label = card.matched
            ? strings.matchedCard(card.symbol)
            : isOpen
              ? strings.openCard(card.symbol)
              : strings.hiddenCard(index + 1);

          return (
            <button
              key={card.id}
              type="button"
              aria-label={label}
              aria-pressed={isOpen}
              disabled={card.matched || locked || status === "won" || openIndexes.includes(index)}
              onClick={() => handleCardClick(index)}
              className={`flex aspect-square min-w-0 items-center justify-center rounded-[18px] border text-[clamp(1.55rem,8vw,3.25rem)] font-black transition duration-200 focus-visible:z-[1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-default ${
                isOpen
                  ? `${memoryCardClasses(card.symbol)} border-transparent shadow-[0_10px_24px_rgba(24,33,29,0.18)]`
                  : "border-[#f0f3ed]/10 bg-[#29352f] text-[#f0f3ed]/45 hover:-translate-y-0.5 hover:bg-[#34443c]"
              }`}
            >
              <span aria-hidden="true">{isOpen ? card.symbol : "?"}</span>
            </button>
          );
        })}

        {status === "won" && (
          <div
            className="absolute inset-2 z-10 flex flex-col items-center justify-center rounded-[20px] bg-[#101714]/92 px-6 text-center text-[#f0f3ed] backdrop-blur-sm sm:inset-3"
            role="status"
            aria-live="assertive"
          >
            <Trophy aria-hidden="true" className="mb-3 text-[var(--accent)]" size={36} weight="fill" />
            <p className="text-xl font-black sm:text-2xl">{strings.memoryWon}</p>
            <p className="mt-2 text-sm text-[#f0f3ed]/70">
              {strings.resultSummary(moves, elapsed)}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-5 min-h-11 rounded-[14px] bg-[var(--accent)] px-5 text-sm font-black text-[var(--accent-contrast)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f3ed]"
            >
              {strings.playAgain}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-3 sm:flex-row sm:px-4">
        <div className="min-w-0 text-center sm:text-left" aria-live="polite">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {strings.bestResult}
          </p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums text-[var(--ink)]">{bestText}</p>
        </div>
        <RestartButton label={strings.restart} onClick={restart} />
      </div>
    </section>
  );
}

export function GameWidget({ slug, locale }: GameWidgetProps) {
  if (slug === "merge-2048") {
    return <Merge2048 locale={locale} />;
  }

  if (slug === "memory-match") {
    return <MemoryMatch locale={locale} />;
  }

  if (slug === "arcade-shooter") {
    return <ArcadeShooter locale={locale} />;
  }

  return null;
}
