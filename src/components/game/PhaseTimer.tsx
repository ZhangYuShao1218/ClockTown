import { useState, useEffect, useRef } from 'react';
import {
  setRoomTimer,
  toggleRoomTimer,
  adjustRoomTimer,
  clearRoomTimer,
  stopRoomTimer,
  type TimerState,
} from '../../services/roomService';
import { playTimerEndBell } from '../../lib/soundEffects';
import { HourglassIcon } from '../common/CthulhuIcons';

interface PhaseTimerProps {
  roomId: string;
  timer?: TimerState | null;
  isHost: boolean;
  isReplayActive?: boolean;
}

const QUICK_ADDS = [
  { label: '+30秒', sec: 30 },
  { label: '+1分鐘', sec: 60 },
  { label: '+3分鐘', sec: 180 },
];

/** 解析使用者輸入的時間（支援 "5" 代表 5 分鐘，或 "1:30" 代表 1 分 30 秒） */
function parseTimeInput(raw: string): number | null {
  const clean = raw.trim();
  if (!clean) return null;
  if (clean.includes(':')) {
    const [mStr, sStr] = clean.split(':');
    const m = Number(mStr);
    const s = Number(sStr);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0) return null;
    return Math.round(m * 60 + s);
  }
  const mins = Number(clean);
  if (!Number.isFinite(mins) || mins <= 0) return null;
  return Math.round(mins * 60);
}

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const PhaseTimer = ({ roomId, timer, isHost, isReplayActive = false }: PhaseTimerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [timeInput, setTimeInput] = useState('');
  const prevDisplaySecRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timer?.isRunning) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timer?.isRunning, timer?.startedAt]);

  // 點擊計時器外部自動關閉控制面板
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const displaySec = timer
    ? timer.isRunning && timer.startedAt
      ? Math.max(0, Math.ceil(timer.remainingSec - (now - timer.startedAt) / 1000))
      : timer.remainingSec
    : 0;

  // 計時器從 >0 自然倒數歸零時響鈴，並由說書人端直接停止計時（不循環）
  useEffect(() => {
    if (timer?.isRunning && prevDisplaySecRef.current !== null && prevDisplaySecRef.current > 0 && displaySec === 0) {
      playTimerEndBell();
      if (isHost) {
        stopRoomTimer(roomId, timer);
      }
    }
    prevDisplaySecRef.current = timer ? displaySec : null;
  }, [displaySec, timer, isHost, roomId]);

  if (isReplayActive) return null;
  if (!timer && !isHost) return null;

  const timeText = formatMMSS(displaySec);
  const isUrgent = Boolean(timer && displaySec > 0 && displaySec <= 10);
  const isExpired = Boolean(timer && displaySec === 0);

  const handleApplyInput = (autoStart = true) => {
    const parsed = parseTimeInput(timeInput);
    if (parsed !== null && parsed > 0) {
      setRoomTimer(roomId, parsed, autoStart);
      setTimeInput(formatMMSS(parsed));
    }
  };

  const handleQuickAdd = (sec: number) => {
    const nextSec = displaySec + sec;
    setTimeInput(formatMMSS(nextSec));
    if (!timer) {
      setRoomTimer(roomId, sec, false);
    } else {
      adjustRoomTimer(roomId, sec, timer);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-14 left-1/2 -translate-x-1/2 lg:top-4 z-40 pointer-events-auto flex flex-col items-center">
      {/* 啟動與未啟動維持一致的膠囊尺寸（不閃爍，時間到僅變色） */}
      <button
        type="button"
        onClick={() => { if (isHost) setIsOpen((v) => !v); }}
        className={`px-5 py-1.5 min-w-[164px] rounded-full border backdrop-blur-md shadow-xl flex items-center justify-center gap-2 transition-colors ${
          !timer
            ? 'bg-black/70 border-white/20 text-white/75 hover:border-amber-400/50 hover:text-amber-200'
            : isExpired
            ? 'bg-red-950/90 border-red-500 text-red-200'
            : isUrgent
            ? 'bg-amber-950/90 border-amber-400 text-amber-200'
            : 'bg-black/80 border-amber-500/40 text-amber-100'
        } ${isHost ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'}`}
      >
        <HourglassIcon className="w-5 h-5 shrink-0 text-amber-400/90" />
        <span className="font-mono text-xl font-extrabold tracking-widest tabular-nums text-center">
          {timeText}
        </span>
        {!timer && <span className="text-[11px] text-white/45 font-bold">未啟動</span>}
        {timer && !timer.isRunning && !isExpired && (
          <span className="text-[11px] text-white/50 font-bold">已暫停</span>
        )}
        {isExpired && (
          <span className="text-[11px] text-red-300 font-bold">時間到</span>
        )}
      </button>

      {isHost && isOpen && (
        <div className="relative z-40 mt-2 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl p-3 w-80 backdrop-blur-md space-y-2.5">
          {/* 第一排：時間輸入框 + 快速累加按鈕（不自動開始） */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyInput(false);
                }
              }}
              placeholder="mm:ss"
              className="w-24 bg-black/60 border border-white/20 focus:border-amber-400 rounded-md px-2 py-1.5 text-base font-bold text-center text-white placeholder-white/35 focus:outline-none font-mono tabular-nums"
            />
            {QUICK_ADDS.map((q) => (
              <button
                key={q.sec}
                type="button"
                onClick={() => handleQuickAdd(q.sec)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-amber-600/30 border border-white/15 hover:border-amber-400/50 rounded-md text-xs font-bold text-amber-200 transition-colors whitespace-nowrap"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* 第二排：開始/暫停、重設、關閉 */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!timer && !timeInput.trim()}
              onClick={() => {
                if (timer?.isRunning) {
                  toggleRoomTimer(roomId, timer);
                } else {
                  const parsed = parseTimeInput(timeInput);
                  if (timer && (parsed === null || parsed === timer.durationSec)) {
                    toggleRoomTimer(roomId, timer);
                  } else if (parsed !== null && parsed > 0) {
                    handleApplyInput(true);
                  } else if (timer) {
                    toggleRoomTimer(roomId, timer);
                  }
                }
              }}
              className="flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-500 disabled:opacity-40 text-white rounded-md text-xs font-bold transition-colors"
            >
              {timer?.isRunning ? '暫停' : '開始'}
            </button>
            <button
              type="button"
              disabled={!timer && !parseTimeInput(timeInput)}
              onClick={() => {
                const parsed = parseTimeInput(timeInput);
                const maxSec = timer?.durationSec ?? parsed ?? 0;
                if (maxSec > 0) {
                  setRoomTimer(roomId, maxSec, false);
                  setTimeInput(formatMMSS(maxSec));
                }
              }}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-white/15 text-white/85 rounded-md text-xs font-bold transition-colors"
            >
              重設
            </button>
            <button
              type="button"
              onClick={() => {
                if (timer) clearRoomTimer(roomId);
                setTimeInput('');
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-red-200 rounded-md text-xs font-bold transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
