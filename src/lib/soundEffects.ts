/**
 * 鐘樓氛圍音效模組
 * 優先嘗試播放 public/sounds/ 下的真實音效檔：
 * - /sounds/night-bell.mp3（進入夜晚）
 * - /sounds/dawn-rooster.mp3（黎明雞鳴）
 * - /sounds/timer-end.mp3（計時結束鐘聲）
 * 若專案尚未放入對應 mp3，則退回較柔和的 Web Audio 合成音效。
 */

const SOUND_MUTE_KEY = "botc_sound_muted";

let sharedAudioCtx: AudioContext | null = null;
const activeAudios = new Set<HTMLAudioElement>();
const missingAudioUrls = new Set<string>();
let playGeneration = 0;
let lastTriggerAt = 0;
let lastTriggerType = "";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/** 立即停止當前正在播放的所有音效（直接關閉 AudioContext 與暫停所有 Audio） */
export function stopCurrentSound(): void {
  playGeneration++;

  activeAudios.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    } catch {
      // 忽略
    }
  });
  activeAudios.clear();

  if (sharedAudioCtx) {
    const ctxToClose = sharedAudioCtx;
    sharedAudioCtx = null;
    try {
      ctxToClose.close().catch(() => {});
    } catch {
      // 忽略
    }
  }
}

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_MUTE_KEY, muted ? "1" : "0");
  } catch {
    // 忽略 storage 寫入失敗
  }
  if (muted) {
    stopCurrentSound();
  }
}

async function tryPlayAudioFile(url: string, gen: number, volume = 0.65): Promise<boolean> {
  if (missingAudioUrls.has(url)) return false;
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    activeAudios.add(audio);
    await audio.play();
    if (gen !== playGeneration || isSoundMuted()) {
      audio.pause();
      audio.currentTime = 0;
      activeAudios.delete(audio);
      return true;
    }
    audio.onended = () => {
      activeAudios.delete(audio);
    };
    return true;
  } catch {
    missingAudioUrls.add(url);
    return false;
  }
}

/** 柔和的教堂／鐘樓鐘聲合成（低通濾波去除刺耳高頻） */
function synthSoftBell(baseFreq: number, strikes: number, intervalSec: number, vol = 0.45): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.setValueAtTime(1200, ctx.currentTime);
  masterFilter.connect(ctx.destination);

  const strike = (startTime: number, ampScale: number) => {
    const partials = [
      { mult: 1.0, amp: 0.55, decay: 3.0 },
      { mult: 2.0, amp: 0.25, decay: 2.0 },
      { mult: 2.4, amp: 0.12, decay: 1.4 },
    ];
    partials.forEach(({ mult, amp, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * mult, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(amp * vol * ampScale, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
      osc.connect(gain);
      gain.connect(masterFilter);
      osc.start(startTime);
      osc.stop(startTime + decay + 0.05);
    });
  };

  const now = ctx.currentTime;
  for (let i = 0; i < strikes; i++) {
    strike(now + i * intervalSec, Math.pow(0.78, i));
  }
}

/** 柔和的黎明晨光和弦 */
function synthSoftDawnChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [293.66, 369.99, 440.0, 587.33];
  const now = ctx.currentTime;
  notes.forEach((freq, idx) => {
    const start = now + idx * 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 2.25);
  });
}

function isDuplicateTrigger(type: string): boolean {
  const now = Date.now();
  if (lastTriggerType === type && now - lastTriggerAt < 200) {
    return true;
  }
  lastTriggerType = type;
  lastTriggerAt = now;
  return false;
}

/** 進入夜晚：鐘樓敲鐘（單響，若上一個音效未播完會直接取消） */
export async function playNightBell(): Promise<void> {
  if (isDuplicateTrigger("night")) return;
  stopCurrentSound();
  if (isSoundMuted()) return;
  const gen = playGeneration;
  const ok = await tryPlayAudioFile("/sounds/night-bell.mp3", gen, 0.7);
  if (!ok && gen === playGeneration && !isSoundMuted()) {
    try {
      synthSoftBell(130.81, 1, 1.0, 0.45);
    } catch {
      // 忽略自動播放限制
    }
  }
}

/** 進入白天：黎明雞鳴（若上一個音效未播完會直接取消） */
export async function playDawnRooster(): Promise<void> {
  if (isDuplicateTrigger("dawn")) return;
  stopCurrentSound();
  if (isSoundMuted()) return;
  const gen = playGeneration;
  const ok = await tryPlayAudioFile("/sounds/dawn-rooster.mp3", gen, 0.65);
  if (!ok && gen === playGeneration && !isSoundMuted()) {
    try {
      synthSoftDawnChime();
    } catch {
      // 忽略自動播放限制
    }
  }
}

/** 計時結束：鐘聲提醒 */
export async function playTimerEndBell(): Promise<void> {
  if (isDuplicateTrigger("timer")) return;
  stopCurrentSound();
  if (isSoundMuted()) return;
  const gen = playGeneration;
  const ok = await tryPlayAudioFile("/sounds/timer-end.mp3", gen, 0.75);
  if (!ok && gen === playGeneration && !isSoundMuted()) {
    try {
      synthSoftBell(220.0, 2, 0.75, 0.5);
    } catch {
      // 忽略自動播放限制
    }
  }
}
