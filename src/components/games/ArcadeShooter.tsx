"use client";

import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Heart,
  Pause,
  Play,
  RocketLaunch,
  Trophy,
  Waves,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Locale = "ko" | "en";
type GamePhase = "ready" | "playing" | "paused" | "gameover";
type EnemyKind = "scout" | "drifter" | "tank";

interface ArcadeShooterProps {
  locale: Locale;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  previousY: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  phase: number;
  hp: number;
  maxHp: number;
  kind: EnemyKind;
}

interface GameRuntime {
  phase: GamePhase;
  score: number;
  lives: number;
  wave: number;
  elapsed: number;
  playerX: number;
  bullets: Bullet[];
  enemies: Enemy[];
  spawnClock: number;
  spawnedThisWave: number;
  waveTarget: number;
  waveBreak: number | null;
  fireCooldown: number;
  nextEntityId: number;
  seed: number;
}

interface InputState {
  left: boolean;
  right: boolean;
  fire: boolean;
}

interface UiSnapshot {
  score: number;
  lives: number;
  wave: number;
  best: number;
}

interface StepEvents {
  gameOver: boolean;
  lifeLost: boolean;
  scoreChanged: boolean;
  waveStarted: boolean;
}

interface Palette {
  background: string;
  backgroundDeep: string;
  grid: string;
  star: string;
  text: string;
  muted: string;
  accent: string;
  accentBright: string;
  accentSoft: string;
  enemyDark: string;
}

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 560;
const PLAYER_Y = WORLD_HEIGHT - 54;
const PLAYER_HALF_WIDTH = 27;
const PLAYER_HALF_HEIGHT = 19;
const BULLET_SPEED = 810;
const PLAYER_SPEED = 470;
const HIGH_SCORE_KEY = "moatools:arcade-shooter:high-score";

const LIGHT_PALETTE: Palette = {
  background: "#f8f3ed",
  backgroundDeep: "#e9ddd2",
  grid: "rgba(82, 65, 53, 0.09)",
  star: "rgba(83, 64, 52, 0.32)",
  text: "#26211d",
  muted: "#7d6d62",
  accent: "#b84a30",
  accentBright: "#ef8a6c",
  accentSoft: "#f7c4b5",
  enemyDark: "#60352c",
};

const DARK_PALETTE: Palette = {
  background: "#1b1816",
  backgroundDeep: "#29221e",
  grid: "rgba(247, 235, 224, 0.08)",
  star: "rgba(247, 235, 224, 0.34)",
  text: "#f6eee7",
  muted: "#b9a89c",
  accent: "#ed8061",
  accentBright: "#f2a089",
  accentSoft: "#7d4436",
  enemyDark: "#4a2d27",
};

const STAR_FIELD = Array.from({ length: 48 }, (_, index) => ({
  x: (index * 137 + 41) % WORLD_WIDTH,
  y: (index * 83 + 29) % WORLD_HEIGHT,
  radius: 0.7 + ((index * 11) % 9) / 9,
  speed: 3 + (index % 5) * 2,
}));

const copy = {
  ko: {
    title: "코랄 스카이 슈터",
    eyebrow: "빠른 손놀림이 필요한 아케이드 슈팅",
    instructions:
      "좌우로 움직여 목표를 맞히고, 적이 방어선을 넘지 못하게 막으세요. 웨이브가 올라갈수록 적이 더 빠르고 단단해집니다.",
    keyboard: "키보드: A와 D 또는 방향키로 이동, Space로 발사, P로 일시정지",
    score: "점수",
    best: "최고 점수",
    lives: "생명",
    wave: "웨이브",
    start: "게임 시작",
    pause: "일시정지",
    resume: "계속하기",
    restart: "다시 시작",
    playAgain: "한 판 더",
    ready: "준비됨",
    playing: "진행 중",
    paused: "일시정지됨",
    gameover: "게임 종료",
    readyTitle: "방어선을 지켜 주세요",
    readyBody: "움직이며 Space 또는 발사 버튼을 길게 누르세요.",
    pausedTitle: "잠시 쉬는 중",
    pausedBody: "준비되면 계속하기를 누르세요.",
    gameoverTitle: "방어선이 무너졌습니다",
    gameoverBody: (score: number) => `이번 점수는 ${score.toLocaleString("ko-KR")}점입니다.`,
    canvasLabel: "코랄 스카이 슈터 게임 화면",
    controlsLabel: "코랄 스카이 슈터 터치 조작",
    moveLeft: "왼쪽으로 이동",
    moveRight: "오른쪽으로 이동",
    fire: "발사",
    waveStarted: (wave: number) => `${wave} 웨이브가 시작되었습니다.`,
    lifeLost: (lives: number) => `생명을 잃었습니다. ${lives}개 남았습니다.`,
    gameOverStatus: (score: number) => `게임이 끝났습니다. 최종 점수는 ${score}점입니다.`,
    startedStatus: "게임이 시작되었습니다.",
    pausedStatus: "게임이 일시정지되었습니다.",
    resumedStatus: "게임을 계속합니다.",
    highScoreStatus: (score: number) => `새 최고 점수 ${score}점입니다.`,
    canvasFallback: "이 게임을 이용하려면 Canvas를 지원하는 브라우저가 필요합니다.",
  },
  en: {
    title: "Coral Sky Shooter",
    eyebrow: "A quick and focused arcade shooter",
    instructions:
      "Move across the defense line, hit every target, and stop enemies from getting through. Each wave brings faster and tougher opponents.",
    keyboard: "Keyboard: move with A and D or the arrow keys, fire with Space, pause with P",
    score: "Score",
    best: "Best score",
    lives: "Lives",
    wave: "Wave",
    start: "Start game",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    playAgain: "Play again",
    ready: "Ready",
    playing: "Playing",
    paused: "Paused",
    gameover: "Game over",
    readyTitle: "Hold the defense line",
    readyBody: "Move while holding Space or the fire button.",
    pausedTitle: "Taking a short break",
    pausedBody: "Choose Resume when you are ready.",
    gameoverTitle: "The defense line fell",
    gameoverBody: (score: number) => `Your score is ${score.toLocaleString("en-US")}.`,
    canvasLabel: "Coral Sky Shooter arcade game",
    controlsLabel: "Coral Sky Shooter touch controls",
    moveLeft: "Move left",
    moveRight: "Move right",
    fire: "Fire",
    waveStarted: (wave: number) => `Wave ${wave} has started.`,
    lifeLost: (lives: number) => `A life was lost. ${lives} remain.`,
    gameOverStatus: (score: number) => `Game over. Your final score is ${score}.`,
    startedStatus: "The game has started.",
    pausedStatus: "The game is paused.",
    resumedStatus: "The game has resumed.",
    highScoreStatus: (score: number) => `New best score: ${score}.`,
    canvasFallback: "A browser with Canvas support is required to play this game.",
  },
} as const;

function makeRuntime(seed = 1): GameRuntime {
  return {
    phase: "ready",
    score: 0,
    lives: 3,
    wave: 1,
    elapsed: 0,
    playerX: WORLD_WIDTH / 2,
    bullets: [],
    enemies: [],
    spawnClock: 0.65,
    spawnedThisWave: 0,
    waveTarget: 10,
    waveBreak: null,
    fireCooldown: 0,
    nextEntityId: 1,
    seed,
  };
}

function nextRandom(runtime: GameRuntime) {
  runtime.seed = (Math.imul(runtime.seed, 1664525) + 1013904223) >>> 0;
  return runtime.seed / 4294967296;
}

function createPlaySeed() {
  try {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] || 1;
  } catch {
    const fallback = (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0;
    return fallback || 1;
  }
}

function waveEnemyTarget(wave: number) {
  return 8 + wave * 2;
}

function spawnInterval(wave: number) {
  return Math.max(0.28, 0.82 - wave * 0.045);
}

function spawnEnemy(runtime: GameRuntime) {
  const typeRoll = nextRandom(runtime);
  const tankChance = Math.min(0.28, Math.max(0, runtime.wave - 2) * 0.035);
  const drifterChance = Math.min(0.42, 0.2 + runtime.wave * 0.022);
  const kind: EnemyKind =
    typeRoll < tankChance ? "tank" : typeRoll < tankChance + drifterChance ? "drifter" : "scout";
  const radius = kind === "tank" ? 25 : kind === "drifter" ? 19 : 16;
  const hp = kind === "tank" ? 2 + Math.floor(runtime.wave / 6) : 1;
  const margin = radius + 20;
  const speedBase = 56 + runtime.wave * 6.4;
  const speedMultiplier = kind === "tank" ? 0.72 : kind === "drifter" ? 0.92 : 1.12;

  runtime.enemies.push({
    id: runtime.nextEntityId,
    x: margin + nextRandom(runtime) * (WORLD_WIDTH - margin * 2),
    y: -radius - 8,
    radius,
    speed: speedBase * speedMultiplier,
    drift: kind === "drifter" ? 55 + nextRandom(runtime) * 45 : kind === "scout" ? 14 : 4,
    phase: nextRandom(runtime) * Math.PI * 2,
    hp,
    maxHp: hp,
    kind,
  });
  runtime.nextEntityId += 1;
  runtime.spawnedThisWave += 1;
}

function verticalShotHitsCircle(bullet: Bullet, enemy: Enemy) {
  const tolerance = enemy.radius + 4;
  if (Math.abs(bullet.x - enemy.x) > tolerance) return false;

  const top = Math.min(bullet.previousY, bullet.y) - 9;
  const bottom = Math.max(bullet.previousY, bullet.y) + 2;
  return enemy.y + enemy.radius >= top && enemy.y - enemy.radius <= bottom;
}

function circleHitsPlayer(enemy: Enemy, playerX: number) {
  const nearestX = Math.max(
    playerX - PLAYER_HALF_WIDTH,
    Math.min(enemy.x, playerX + PLAYER_HALF_WIDTH),
  );
  const nearestY = Math.max(
    PLAYER_Y - PLAYER_HALF_HEIGHT,
    Math.min(enemy.y, PLAYER_Y + PLAYER_HALF_HEIGHT),
  );
  const dx = enemy.x - nearestX;
  const dy = enemy.y - nearestY;
  return dx * dx + dy * dy <= enemy.radius * enemy.radius;
}

function fireBullet(runtime: GameRuntime) {
  if (runtime.fireCooldown > 0) return;

  runtime.bullets.push({
    id: runtime.nextEntityId,
    x: runtime.playerX,
    y: PLAYER_Y - 27,
    previousY: PLAYER_Y - 27,
  });
  runtime.nextEntityId += 1;
  runtime.fireCooldown = 0.16;
}

function stepGame(runtime: GameRuntime, input: InputState, delta: number): StepEvents {
  const events: StepEvents = {
    gameOver: false,
    lifeLost: false,
    scoreChanged: false,
    waveStarted: false,
  };

  runtime.elapsed += delta;
  runtime.fireCooldown = Math.max(0, runtime.fireCooldown - delta);

  const direction = Number(input.right) - Number(input.left);
  runtime.playerX = Math.max(
    PLAYER_HALF_WIDTH + 10,
    Math.min(WORLD_WIDTH - PLAYER_HALF_WIDTH - 10, runtime.playerX + direction * PLAYER_SPEED * delta),
  );

  if (input.fire) fireBullet(runtime);

  for (const bullet of runtime.bullets) {
    bullet.previousY = bullet.y;
    bullet.y -= BULLET_SPEED * delta;
  }

  for (const enemy of runtime.enemies) {
    enemy.y += enemy.speed * delta;
    enemy.x += Math.sin(runtime.elapsed * 2.05 + enemy.phase) * enemy.drift * delta;
    enemy.x = Math.max(enemy.radius, Math.min(WORLD_WIDTH - enemy.radius, enemy.x));
  }

  const usedBullets = new Set<number>();
  const defeatedEnemies = new Set<number>();

  for (const bullet of runtime.bullets) {
    let target: Enemy | null = null;

    for (const enemy of runtime.enemies) {
      if (defeatedEnemies.has(enemy.id) || !verticalShotHitsCircle(bullet, enemy)) continue;
      if (!target || enemy.y > target.y) target = enemy;
    }

    if (!target) continue;
    usedBullets.add(bullet.id);
    target.hp -= 1;

    if (target.hp <= 0) {
      defeatedEnemies.add(target.id);
      const typeBonus = target.kind === "tank" ? 34 : target.kind === "drifter" ? 21 : 14;
      runtime.score += typeBonus + runtime.wave * 2;
      events.scoreChanged = true;
    }
  }

  runtime.bullets = runtime.bullets.filter(
    (bullet) => bullet.y > -20 && !usedBullets.has(bullet.id),
  );

  let breaches = 0;
  runtime.enemies = runtime.enemies.filter((enemy) => {
    if (defeatedEnemies.has(enemy.id)) return false;
    if (circleHitsPlayer(enemy, runtime.playerX) || enemy.y - enemy.radius > WORLD_HEIGHT) {
      breaches += 1;
      return false;
    }
    return true;
  });

  if (breaches > 0) {
    runtime.lives = Math.max(0, runtime.lives - breaches);
    events.lifeLost = true;
    if (runtime.lives === 0) {
      runtime.phase = "gameover";
      runtime.enemies = [];
      runtime.bullets = [];
      events.gameOver = true;
      return events;
    }
  }

  if (runtime.spawnedThisWave < runtime.waveTarget) {
    runtime.spawnClock -= delta;
    if (runtime.spawnClock <= 0) {
      spawnEnemy(runtime);
      runtime.spawnClock = spawnInterval(runtime.wave) * (0.82 + nextRandom(runtime) * 0.36);
    }
  } else if (runtime.enemies.length === 0) {
    if (runtime.waveBreak === null) runtime.waveBreak = 1.15;
    runtime.waveBreak -= delta;

    if (runtime.waveBreak <= 0) {
      runtime.wave += 1;
      runtime.spawnedThisWave = 0;
      runtime.waveTarget = waveEnemyTarget(runtime.wave);
      runtime.spawnClock = 0.5;
      runtime.waveBreak = null;
      events.waveStarted = true;
    }
  }

  return events;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function drawEnemy(context: CanvasRenderingContext2D, enemy: Enemy, palette: Palette) {
  context.save();
  context.translate(enemy.x, enemy.y);

  context.fillStyle =
    enemy.kind === "tank"
      ? palette.enemyDark
      : enemy.kind === "drifter"
        ? palette.accent
        : palette.accentBright;
  context.strokeStyle = palette.text;
  context.lineWidth = 2.5;

  if (enemy.kind === "drifter") {
    context.rotate(Math.sin(enemy.phase + enemy.y * 0.02) * 0.16);
    drawRoundedRect(
      context,
      -enemy.radius,
      -enemy.radius * 0.72,
      enemy.radius * 2,
      enemy.radius * 1.44,
      7,
    );
    context.fill();
    context.stroke();
  } else {
    context.beginPath();
    context.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  context.fillStyle = palette.background;
  context.beginPath();
  context.arc(-enemy.radius * 0.32, -2, Math.max(2.5, enemy.radius * 0.12), 0, Math.PI * 2);
  context.arc(enemy.radius * 0.32, -2, Math.max(2.5, enemy.radius * 0.12), 0, Math.PI * 2);
  context.fill();

  if (enemy.maxHp > 1) {
    const barWidth = enemy.radius * 1.7;
    context.fillStyle = palette.grid;
    context.fillRect(-barWidth / 2, enemy.radius + 8, barWidth, 4);
    context.fillStyle = palette.accentBright;
    context.fillRect(-barWidth / 2, enemy.radius + 8, barWidth * (enemy.hp / enemy.maxHp), 4);
  }

  context.restore();
}

function drawPlayer(context: CanvasRenderingContext2D, runtime: GameRuntime, palette: Palette) {
  const bob = Math.sin(runtime.elapsed * 7) * 1.5;
  context.save();
  context.translate(runtime.playerX, PLAYER_Y + bob);

  context.fillStyle = palette.accentSoft;
  context.beginPath();
  context.moveTo(-12, 17);
  context.lineTo(0, 31 + Math.sin(runtime.elapsed * 12) * 4);
  context.lineTo(12, 17);
  context.closePath();
  context.fill();

  context.fillStyle = palette.accent;
  context.strokeStyle = palette.text;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, -28);
  context.lineTo(28, 18);
  context.lineTo(9, 13);
  context.lineTo(0, 20);
  context.lineTo(-9, 13);
  context.lineTo(-28, 18);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = palette.background;
  context.beginPath();
  context.arc(0, -4, 6, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawGame(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  runtime: GameRuntime,
  palette: Palette,
) {
  const scaleX = canvas.width / WORLD_WIDTH;
  const scaleY = canvas.height / WORLD_HEIGHT;
  context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  context.fillStyle = palette.background;
  context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  context.fillStyle = palette.backgroundDeep;
  context.fillRect(0, WORLD_HEIGHT * 0.78, WORLD_WIDTH, WORLD_HEIGHT * 0.22);

  context.strokeStyle = palette.grid;
  context.lineWidth = 1;
  for (let x = 0; x <= WORLD_WIDTH; x += 75) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, WORLD_HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += 70) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WORLD_WIDTH, y);
    context.stroke();
  }

  context.fillStyle = palette.star;
  for (const star of STAR_FIELD) {
    const y = (star.y + runtime.elapsed * star.speed) % WORLD_HEIGHT;
    context.beginPath();
    context.arc(star.x, y, star.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = palette.accent;
  context.lineWidth = 2;
  context.setLineDash([10, 10]);
  context.beginPath();
  context.moveTo(0, PLAYER_Y + 33);
  context.lineTo(WORLD_WIDTH, PLAYER_Y + 33);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = palette.accent;
  for (const bullet of runtime.bullets) {
    drawRoundedRect(context, bullet.x - 3, bullet.y - 12, 6, 17, 3);
    context.fill();
  }

  for (const enemy of runtime.enemies) drawEnemy(context, enemy, palette);
  drawPlayer(context, runtime, palette);

  if (runtime.waveBreak !== null && runtime.phase === "playing") {
    context.fillStyle = palette.text;
    context.font = "700 21px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(`WAVE ${runtime.wave + 1}`, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  }
}

function safeReadHighScore() {
  try {
    const value = Number.parseInt(window.localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function safeWriteHighScore(value: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    return;
  }
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-3 shadow-[var(--shadow-soft)] sm:px-4">
      <div className="flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)] sm:text-xs">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <strong className="mt-1 block text-lg font-black tabular-nums text-[var(--ink)] sm:text-xl">
        {value}
      </strong>
    </div>
  );
}

export function ArcadeShooter({ locale }: ArcadeShooterProps) {
  const t = copy[locale];
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime>(makeRuntime());
  const inputRef = useRef<InputState>({ left: false, right: false, fire: false });
  const mountedRef = useRef(false);
  const bestRef = useRef(0);
  const newBestAnnouncedRef = useRef(false);
  const paletteRef = useRef<Palette>(LIGHT_PALETTE);
  const lastUiSyncRef = useRef(0);
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [liveMessage, setLiveMessage] = useState<string>(t.readyTitle);
  const [snapshot, setSnapshot] = useState<UiSnapshot>({
    score: 0,
    lives: 3,
    wave: 1,
    best: 0,
  });

  const syncSnapshot = useCallback((runtime: GameRuntime) => {
    if (!mountedRef.current) return;
    setSnapshot({
      score: runtime.score,
      lives: runtime.lives,
      wave: runtime.wave,
      best: bestRef.current,
    });
  }, []);

  const resetInputs = useCallback(() => {
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.fire = false;
  }, []);

  const focusGame = useCallback(() => {
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const startNewGame = useCallback(() => {
    const runtime = makeRuntime(createPlaySeed());
    runtime.phase = "playing";
    runtime.waveTarget = waveEnemyTarget(1);
    runtimeRef.current = runtime;
    newBestAnnouncedRef.current = false;
    resetInputs();
    setPhase("playing");
    setLiveMessage(t.startedStatus);
    syncSnapshot(runtime);
    focusGame();
  }, [focusGame, resetInputs, syncSnapshot, t.startedStatus]);

  const togglePause = useCallback(() => {
    const runtime = runtimeRef.current;

    if (runtime.phase === "ready" || runtime.phase === "gameover") {
      startNewGame();
      return;
    }

    if (runtime.phase === "playing") {
      runtime.phase = "paused";
      resetInputs();
      setPhase("paused");
      setLiveMessage(t.pausedStatus);
    } else {
      runtime.phase = "playing";
      setPhase("playing");
      setLiveMessage(t.resumedStatus);
      focusGame();
    }
  }, [focusGame, resetInputs, startNewGame, t.pausedStatus, t.resumedStatus]);

  const setPointerInput = useCallback(
    (key: keyof InputState, value: boolean, event?: ReactPointerEvent<HTMLButtonElement>) => {
      if (event) {
        event.preventDefault();
        if (value) event.currentTarget.setPointerCapture(event.pointerId);
      }
      inputRef.current[key] = value;
      if (value) focusGame();
    },
    [focusGame],
  );

  useEffect(() => {
    mountedRef.current = true;
    const storageFrame = window.requestAnimationFrame(() => {
      if (!mountedRef.current) return;
      const storedBest = safeReadHighScore();
      bestRef.current = storedBest;
      setSnapshot((current) => ({ ...current, best: storedBest }));
    });

    return () => {
      mountedRef.current = false;
      window.cancelAnimationFrame(storageFrame);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updatePalette = () => {
      paletteRef.current = mediaQuery.matches ? DARK_PALETTE : LIGHT_PALETTE;
    };
    updatePalette();

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();
    mediaQuery.addEventListener("change", updatePalette);

    let animationFrame = 0;
    let idleTimer = 0;
    let lastFrameTime = performance.now();

    const frame = (time: number) => {
      if (!mountedRef.current) return;
      const runtime = runtimeRef.current;
      const delta = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.034);
      lastFrameTime = time;

      if (runtime.phase === "playing") {
        const events = stepGame(runtime, inputRef.current, delta);

        if (runtime.score > bestRef.current) {
          bestRef.current = runtime.score;
          safeWriteHighScore(runtime.score);
          if (events.scoreChanged && !newBestAnnouncedRef.current) {
            newBestAnnouncedRef.current = true;
            setLiveMessage(t.highScoreStatus(runtime.score));
          }
        }

        if (events.gameOver) {
          resetInputs();
          setPhase("gameover");
          setLiveMessage(t.gameOverStatus(runtime.score));
          syncSnapshot(runtime);
        } else {
          if (events.waveStarted) setLiveMessage(t.waveStarted(runtime.wave));
          if (events.lifeLost) setLiveMessage(t.lifeLost(runtime.lives));
          if (events.scoreChanged || events.waveStarted || events.lifeLost || time - lastUiSyncRef.current > 160) {
            lastUiSyncRef.current = time;
            syncSnapshot(runtime);
          }
        }
      }

      drawGame(context, canvas, runtime, paletteRef.current);
      if (runtime.phase === "playing") {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        idleTimer = window.setTimeout(() => {
          animationFrame = window.requestAnimationFrame(frame);
        }, 250);
      }
    };

    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(idleTimer);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", updatePalette);
    };
  }, [resetInputs, syncSnapshot, t]);

  useEffect(() => {
    const keyForEvent = (event: KeyboardEvent) => event.key.toLowerCase();
    const isGameFocused = () => {
      const root = rootRef.current;
      return Boolean(root && root.contains(document.activeElement));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isGameFocused()) return;
      const key = keyForEvent(event);

      if (key === "p" && !event.repeat) {
        event.preventDefault();
        togglePause();
        return;
      }

      if (runtimeRef.current.phase !== "playing") return;

      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        inputRef.current.left = true;
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        inputRef.current.right = true;
      } else if (key === " " || key === "spacebar") {
        event.preventDefault();
        inputRef.current.fire = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isGameFocused()) return;
      const key = keyForEvent(event);
      if (key === "arrowleft" || key === "a") inputRef.current.left = false;
      if (key === "arrowright" || key === "d") inputRef.current.right = false;
      if (key === " " || key === "spacebar") inputRef.current.fire = false;
    };

    const onWindowBlur = () => resetInputs();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
      resetInputs();
    };
  }, [resetInputs, togglePause]);

  const phaseLabels: Record<GamePhase, string> = {
    ready: t.ready,
    playing: t.playing,
    paused: t.paused,
    gameover: t.gameover,
  };
  const primaryLabel =
    phase === "ready"
      ? t.start
      : phase === "playing"
        ? t.pause
        : phase === "paused"
          ? t.resume
          : t.playAgain;
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";
  const overlayVisible = phase !== "playing";
  const overlayTitle =
    phase === "ready" ? t.readyTitle : phase === "paused" ? t.pausedTitle : t.gameoverTitle;
  const overlayBody =
    phase === "ready"
      ? t.readyBody
      : phase === "paused"
        ? t.pausedBody
        : t.gameoverBody(snapshot.score);

  return (
    <section
      ref={rootRef}
      data-game-protected-zone="true"
      data-ad-placement="outside-only"
      aria-labelledby="arcade-shooter-title"
      className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]"
    >
      <div className="border-b border-[var(--line)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
              <RocketLaunch size={17} weight="fill" aria-hidden="true" />
              <span>{t.eyebrow}</span>
            </p>
            <h2
              id="arcade-shooter-title"
              className="text-[clamp(1.7rem,5vw,2.7rem)] font-black leading-[1.05] tracking-[-0.035em] text-[var(--ink)]"
              style={{ wordBreak: locale === "ko" ? "keep-all" : "normal", overflowWrap: "break-word" }}
            >
              {t.title}
            </h2>
            <p
              className="mt-3 max-w-[68ch] text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7"
              style={{ wordBreak: locale === "ko" ? "keep-all" : "normal", overflowWrap: "break-word" }}
            >
              {t.instructions}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)]">
              <span
                className={`h-2 w-2 rounded-full ${phase === "playing" ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`}
                aria-hidden="true"
              />
              {phaseLabels[phase]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-[var(--line)] bg-[var(--bg-soft)] p-3 sm:grid-cols-4 sm:gap-3 sm:p-4 lg:px-8">
        <StatItem
          icon={<Crosshair size={15} weight="bold" aria-hidden="true" />}
          label={t.score}
          value={snapshot.score.toLocaleString(numberLocale)}
        />
        <StatItem
          icon={<Trophy size={15} weight="bold" aria-hidden="true" />}
          label={t.best}
          value={snapshot.best.toLocaleString(numberLocale)}
        />
        <StatItem
          icon={<Heart size={15} weight="fill" aria-hidden="true" />}
          label={t.lives}
          value={String(snapshot.lives)}
        />
        <StatItem
          icon={<Waves size={15} weight="bold" aria-hidden="true" />}
          label={t.wave}
          value={String(snapshot.wave)}
        />
      </div>

      <div className="p-3 sm:p-4 lg:p-6">
        <div className="relative overflow-hidden rounded-[22px] border border-[var(--control-line)] bg-[#1b1816] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <canvas
            ref={canvasRef}
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT}
            tabIndex={0}
            role="img"
            aria-label={t.canvasLabel}
            className="block aspect-[45/28] h-auto w-full outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_28%,transparent)]"
          >
            {t.canvasFallback}
          </canvas>

          {overlayVisible ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(27,24,22,0.74)] p-5 backdrop-blur-[2px]">
              <div className="max-w-md text-center text-[#f8f3ed]">
                <p
                  className="text-[clamp(1.3rem,5vw,2.2rem)] font-black leading-tight tracking-[-0.025em]"
                  style={{ wordBreak: locale === "ko" ? "keep-all" : "normal", overflowWrap: "break-word" }}
                >
                  {overlayTitle}
                </p>
                <p
                  className="mx-auto mt-2 max-w-[38ch] text-sm leading-6 text-[#d8c8bc] sm:text-base"
                  style={{ wordBreak: locale === "ko" ? "keep-all" : "normal", overflowWrap: "break-word" }}
                >
                  {overlayBody}
                </p>
                <button
                  type="button"
                  onClick={phase === "paused" ? togglePause : startNewGame}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#ed8061] px-5 py-2.5 text-sm font-black text-[#211915] shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f7c4b5] active:translate-y-0"
                >
                  <Play size={18} weight="fill" aria-hidden="true" />
                  {primaryLabel}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-4 py-2.5 text-sm font-black text-[var(--accent-contrast)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_28%,transparent)] active:translate-y-0"
              aria-label={primaryLabel}
            >
              {phase === "playing" ? (
                <Pause size={18} weight="fill" aria-hidden="true" />
              ) : (
                <Play size={18} weight="fill" aria-hidden="true" />
              )}
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={startNewGame}
              disabled={phase === "ready"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[var(--control-line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-black text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-45"
              aria-label={t.restart}
            >
              <ArrowCounterClockwise size={18} weight="bold" aria-hidden="true" />
              {t.restart}
            </button>
          </div>

          <p
            className="max-w-xl text-xs leading-5 text-[var(--muted)] sm:text-right"
            style={{ wordBreak: locale === "ko" ? "keep-all" : "normal", overflowWrap: "break-word" }}
          >
            {t.keyboard}
          </p>
        </div>

        <div
          role="group"
          aria-label={t.controlsLabel}
          className="mt-4 grid grid-cols-[1fr_1.35fr_1fr] gap-2 rounded-[20px] border border-[var(--line)] bg-[var(--bg-soft)] p-2 sm:mx-auto sm:max-w-xl sm:gap-3 sm:p-3"
          style={{ touchAction: "none" }}
        >
          <button
            type="button"
            aria-label={t.moveLeft}
            onPointerDown={(event) => setPointerInput("left", true, event)}
            onPointerUp={(event) => setPointerInput("left", false, event)}
            onPointerCancel={(event) => setPointerInput("left", false, event)}
            onLostPointerCapture={() => setPointerInput("left", false)}
            disabled={phase !== "playing"}
            className="flex min-h-14 select-none items-center justify-center rounded-[14px] border border-[var(--control-line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)] active:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-16"
          >
            <ArrowLeft size={26} weight="bold" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={t.fire}
            onPointerDown={(event) => setPointerInput("fire", true, event)}
            onPointerUp={(event) => setPointerInput("fire", false, event)}
            onPointerCancel={(event) => setPointerInput("fire", false, event)}
            onLostPointerCapture={() => setPointerInput("fire", false)}
            disabled={phase !== "playing"}
            className="flex min-h-14 select-none items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-3 text-sm font-black text-[var(--accent-contrast)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_28%,transparent)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-16 sm:text-base"
          >
            <Crosshair size={23} weight="bold" aria-hidden="true" />
            {t.fire}
          </button>
          <button
            type="button"
            aria-label={t.moveRight}
            onPointerDown={(event) => setPointerInput("right", true, event)}
            onPointerUp={(event) => setPointerInput("right", false, event)}
            onPointerCancel={(event) => setPointerInput("right", false, event)}
            onLostPointerCapture={() => setPointerInput("right", false)}
            disabled={phase !== "playing"}
            className="flex min-h-14 select-none items-center justify-center rounded-[14px] border border-[var(--control-line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)] active:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-16"
          >
            <ArrowRight size={26} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </p>
    </section>
  );
}
