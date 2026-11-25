import React, { useState, useEffect } from 'react';
import { onValue } from 'firebase/database';
import { nref } from '../../services/firebase';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  recordReplayEvent,
  deleteReplayEvent,
  clearReplayTimeline,
  startRoomReplay,
  setRoomReplayStep,
  stopRoomReplay,
  reorderReplayTimeline,
  type ReplayEvent
} from '../../services/replayService';
import { updateGameTime, saveBattleReport } from '../../services/roomService';
import { AllRoles } from '../../data/roles';
import type { Script } from '../../data/types';
import type { SeatToken } from './SeatTokenModal';
import {
  findRoleByNameOrId,
  generateBattleReportDraft,
  exportBattleReportPlainText,
  type BattleReportNote,
} from '../../lib/battleReportUtils';

interface GameTimelineLoggerProps {
  roomId: string;
  dayNumber: number;
  timePhase: 'day' | 'night';
  seats: number[];
  players: any[];
  grimoireState?: any;
  grimoireTokens?: Record<string, SeatToken[] | undefined> | null;
  script?: Script;
  isReplayActive: boolean;
  replayMode?: any;
}

type TargetType = number | 'good' | 'evil' | 'storyteller';

// 遊戲紀錄清單項目：外層負責排序位移動畫，拖曳只認左側把手，避免跟點擊跳轉/刪除鈕互搶手勢
const SortableTimelineItem: React.FC<{
  id: string;
  isCur: boolean;
  onClick: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}> = ({ id, isCur, onClick, onDelete, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`p-3 rounded-lg border text-sm transition-colors relative group flex gap-2 ${
        isCur
          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
          : 'bg-black/40 border-white/10 hover:bg-black/60 text-stone-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 self-stretch w-5 flex items-center justify-center text-stone-500 hover:text-stone-300 cursor-grab active:cursor-grabbing touch-none"
        title="拖曳調整順序"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0 pr-6">
        {children}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 px-2 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded text-xs font-bold transition-all shadow-sm flex items-center justify-center"
        title="刪除此紀錄"
      >
        ✕
      </button>
    </div>
  );
};

export const GameTimelineLogger: React.FC<GameTimelineLoggerProps> = ({
  roomId,
  dayNumber,
  timePhase,
  seats,
  players,
  grimoireState,
  grimoireTokens,
  script,
  isReplayActive,
  replayMode
}) => {
  const [timeline, setTimeline] = useState<ReplayEvent[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [customNotes, setCustomNotes] = useState<BattleReportNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [reportMenu, setReportMenu] = useState<'none' | 'seat' | 'role'>('none');
  const [reportCopied, setReportCopied] = useState(false);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [dropAfterIndex, setDropAfterIndex] = useState<number | null>(null);

  // 3 Tabs: 'action' ("動作") vs 'situation' ("局勢") vs 'history' ("遊戲紀錄")
  const [activeTab, setActiveTab] = useState<'action' | 'situation' | 'history'>('action');

  // Action Mode Form State (誰, 動作, 對誰, 結果)
  const [actorSeat, setActorSeat] = useState<string>('1');
  const [actionType, setActionType] = useState<string>('查驗');
  const [targetSeats, setTargetSeats] = useState<TargetType[]>([]);
  const [resultText, setResultText] = useState<string>('');

  // Situation Mode Form State (座位, 自訂文字)
  const [selectedSeats, setSelectedSeats] = useState<TargetType[]>([]);
  const [freeformText, setFreeformText] = useState<string>('');
  const [isActorDropdownOpen, setIsActorDropdownOpen] = useState(false);

  // Action Presets: 查驗、醉酒、投毒、殺害、保護、能力、得知、宣稱
  const actionPresets = ['查驗', '醉酒', '投毒', '殺害', '保護', '能力', '得知', '宣稱'];

  // 遊戲紀錄拖曳排序：只認左側把手（PointerSensor 預設就會忽略卡片本身的點擊/按鈕操作）
  const timelineDragSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const handleTimelineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = timeline.findIndex(ev => ev.id === active.id);
    const newIndex = timeline.findIndex(ev => ev.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(timeline, oldIndex, newIndex);
    setTimeline(reordered); // 樂觀更新，避免等 Firebase 回寫才看到排序結果
    reorderReplayTimeline(roomId, reordered.map(ev => ev.id!));
  };

  // Subscribe to timeline
  useEffect(() => {
    if (!roomId) return;
    const timelineRef = nref(`rooms/${roomId}/replay/timeline`);
    const unsubscribe = onValue(timelineRef, (snap) => {
      const data = snap.val() || {};
      const list: ReplayEvent[] = Object.entries(data).map(([key, ev]: [string, any]) => ({
        id: key,
        ...ev
      })).sort((a, b) => a.timestamp - b.timestamp);
      setTimeline(list);
    });
    return () => unsubscribe();
  }, [roomId]);

  // 訂閱自訂戰報補充文字列表
  useEffect(() => {
    if (!roomId) return;
    const reportRef = nref(`rooms/${roomId}/private/battleReport`);
    const unsub = onValue(reportRef, (snap) => {
      const val = snap.val();
      if (val && Array.isArray(val.notes)) {
        setCustomNotes(val.notes);
      } else if (val && typeof val.content === 'string' && val.content.trim()) {
        setCustomNotes([{ id: 'legacy-1', text: val.content, afterIndex: 9999 }]);
      } else {
        setCustomNotes([]);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Set default actorSeat to first available seat if not set
  useEffect(() => {
    if (seats.length > 0 && !seats.map(String).includes(actorSeat) && actorSeat !== 'all' && actorSeat !== 'storyteller') {
      setActorSeat(String(seats[0]));
    }
  }, [seats]);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying || !isReplayActive || timeline.length === 0) return;
    const interval = setInterval(() => {
      const cur = replayMode?.currentStepIndex || 0;
      if (cur >= timeline.length - 1) {
        setIsAutoPlaying(false);
        return;
      }
      setRoomReplayStep(roomId, cur + 1, timeline);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isReplayActive, timeline, replayMode?.currentStepIndex, roomId]);

  // Chinese role name lookup: 座位及角色 (如: 1 號 共情者)
  const getSeatLabel = (seat: number) => {
    const roleId = grimoireState?.[seat]?.roleId;
    const roleObj = roleId ? Object.values(AllRoles).find(r => r.id === roleId) : null;
    const roleName = roleObj?.name || roleId;

    if (roleName) {
      return `${seat} 號 ${roleName}`;
    }
    return `${seat} 號`;
  };

  const handleToggleTargetSeat = (target: TargetType) => {
    setTargetSeats(prev =>
      prev.includes(target) ? prev.filter(s => s !== target) : [...prev, target]
    );
  };

  const handleToggleFreeformSeat = (target: TargetType) => {
    setSelectedSeats(prev =>
      prev.includes(target) ? prev.filter(s => s !== target) : [...prev, target]
    );
  };

  const formatTargetLabel = (targets: TargetType[]) => {
    return targets.map(t => {
      if (t === 'good') return '善';
      if (t === 'evil') return '邪';
      if (t === 'storyteller') return '說';
      return `${t}號`;
    }).join('、');
  };

  // Submit Action Record
  const handleAddStructuredRecord = async () => {
    const actorLabel = actorSeat === 'storyteller' ? '說書人' : actorSeat === 'all' ? '全體玩家' : `${actorSeat} 號`;
    const targetLabel = targetSeats.length > 0 ? formatTargetLabel(targetSeats) : '';
    
    const title = `${actorLabel} ${actionType}${targetLabel ? ` ➔ ${targetLabel}` : ''}`;
    const description = `${title}${resultText ? `：${resultText}` : ''}`;

    const highlighted: number[] = [];
    if (actorSeat !== 'storyteller' && actorSeat !== 'all') {
      highlighted.push(Number(actorSeat));
    }
    targetSeats.forEach(s => {
      if (typeof s === 'number' && !highlighted.includes(s)) {
        highlighted.push(s);
      }
    });

    const numericTargets = targetSeats.filter((s): s is number => typeof s === 'number');

    await recordReplayEvent(roomId, {
      dayNumber,
      timePhase,
      type: 'ACTION_LOG',
      title,
      description,
      actorSeat: actorSeat === 'storyteller' || actorSeat === 'all' ? actorSeat : Number(actorSeat),
      actionType,
      targetSeats: numericTargets,
      resultText,
      highlightedSeats: highlighted
    });

    setTargetSeats([]);
    setResultText('');
  };

  // Submit Freeform Situation Record
  const handleAddFreeformRecord = async () => {
    if (!freeformText.trim()) return;

    const seatPrefix = selectedSeats.length > 0 ? `[${formatTargetLabel(selectedSeats)}] ` : '';
    const title = `${seatPrefix}${freeformText.trim()}`;

    const numericTargets = selectedSeats.filter((s): s is number => typeof s === 'number');

    await recordReplayEvent(roomId, {
      dayNumber,
      timePhase,
      type: 'SITUATION_LOG',
      title: title.slice(0, 30),
      description: title,
      targetSeats: numericTargets,
      highlightedSeats: numericTargets
    });

    setSelectedSeats([]);
    setFreeformText('');
  };

  // Build target seat buttons list (1..N + 善 + 邪 + 說)
  const renderSeatButtons = (
    currentSelected: TargetType[],
    onToggle: (t: TargetType) => void
  ) => {
    return (
      <div className="grid grid-cols-7 gap-1 w-full">
        {seats.map(s => {
          const isTarget = currentSelected.includes(s);
          return (
            <button
              key={`seat-btn-${s}`}
              type="button"
              onClick={() => onToggle(s)}
              className={`h-8 rounded border text-xs font-bold flex items-center justify-center transition-all ${
                isTarget
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-black/60 border-white/15 text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s}
            </button>
          );
        })}

        {/* 善 (善良藍色) */}
        <button
          type="button"
          onClick={() => onToggle('good')}
          className={`h-8 rounded border text-xs font-bold flex items-center justify-center transition-all ${
            currentSelected.includes('good')
              ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]'
              : 'bg-blue-950/50 border-blue-500/50 text-blue-300 hover:bg-blue-900/60 hover:text-white'
          }`}
          title="善良"
        >
          善
        </button>

        {/* 邪 (邪惡紅色) */}
        <button
          type="button"
          onClick={() => onToggle('evil')}
          className={`h-8 rounded border text-xs font-bold flex items-center justify-center transition-all ${
            currentSelected.includes('evil')
              ? 'bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]'
              : 'bg-red-950/50 border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white'
          }`}
          title="邪惡"
        >
          邪
        </button>

        {/* 說 (說書人金黃色) */}
        <button
          type="button"
          onClick={() => onToggle('storyteller')}
          className={`h-8 rounded border text-xs font-bold flex items-center justify-center transition-all ${
            currentSelected.includes('storyteller')
              ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_10px_rgba(234,179,8,0.6)]'
              : 'bg-yellow-950/50 border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/60 hover:text-yellow-200'
          }`}
          title="說書人"
        >
          說
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent text-white">
      
      {/* 1. 原先時間顯示與切換 (100% 完整還原原版尺寸與樣式) */}
      <div className="p-4 bg-white/5 border-b border-white/10 shrink-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tracking-widest text-stone-300 drop-shadow-sm flex items-center mb-5 mt-2">
          第 <span className="font-sans mx-2 text-3xl text-white">{dayNumber}</span> 天 - 
          <span className={`ml-2 ${timePhase === 'night' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}>
            {timePhase === 'night' ? '黑夜' : '白天'}
          </span>
        </div>
        
        <div className="w-full flex gap-4">
          <button 
            onClick={() => {
              if (dayNumber === 1 && timePhase === 'day') return;
              if (timePhase === 'night') updateGameTime(roomId, dayNumber, 'day');
              else updateGameTime(roomId, Math.max(1, dayNumber - 1), 'night');
            }}
            disabled={dayNumber === 1 && timePhase === 'day'}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white font-bold tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm text-base"
          >
            上一個
          </button>
          <button 
            onClick={() => {
              if (timePhase === 'day') updateGameTime(roomId, dayNumber, 'night');
              else updateGameTime(roomId, dayNumber + 1, 'day');
            }}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white font-bold tracking-widest transition-colors shadow-sm text-base"
          >
            下一個
          </button>
        </div>
      </div>

      {/* 復盤導覽已移至座位區中央的懸浮視窗 */}

      {/* 3. 遊戲覆盤專用工作區 (大標題 + 動作 / 局勢 / 遊戲紀錄 三大分頁) */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* 大標題：遊戲覆盤 */}
        <div className="px-4 pt-3 pb-1 shrink-0 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-200 tracking-wider">遊戲覆盤</h3>
          <span className="text-xs text-stone-400 font-mono">已記錄 {timeline.length} 筆</span>
        </div>

        {/* 3 個分頁標籤：動作 / 局勢 / 遊戲紀錄 */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/15">
            <button
              onClick={() => setActiveTab('action')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                activeTab === 'action'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              動作
            </button>
            <button
              onClick={() => setActiveTab('situation')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                activeTab === 'situation'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              局勢
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              遊戲紀錄
            </button>
          </div>
        </div>

        {/* 分頁 1: 動作 */}
        {activeTab === 'action' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
            
            {/* 第 1 列: 誰 */}
            <div className="flex items-center gap-2">
              <label className="text-base font-bold text-stone-200 whitespace-nowrap shrink-0">誰：</label>
              
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setIsActorDropdownOpen(!isActorDropdownOpen)}
                  className="w-full relative bg-slate-900 border border-white/20 text-white rounded-md px-3 py-2 text-base outline-none focus:border-blue-500 shadow-inner font-medium flex justify-between items-center transition-colors hover:bg-slate-800"
                >
                  <span className="truncate flex items-center gap-2">
                    {actorSeat === 'storyteller' ? (
                      <span className="text-amber-400 font-bold">說書人</span>
                    ) : actorSeat === 'all' ? (
                      <span>全體玩家</span>
                    ) : (
                      <span>{getSeatLabel(Number(actorSeat))}</span>
                    )}
                  </span>
                  <svg className={`w-4 h-4 text-stone-400 transition-transform ${isActorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isActorDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsActorDropdownOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-600 rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar py-1">
                      {seats.map(s => (
                        <button
                          key={`actor-opt-${s}`}
                          type="button"
                          onClick={() => {
                            setActorSeat(String(s));
                            setIsActorDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            actorSeat === String(s) ? 'bg-blue-600/30 text-blue-200 font-bold' : 'text-white hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{getSeatLabel(s)}</span>
                          {actorSeat === String(s) && (
                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setActorSeat('all');
                          setIsActorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between border-t border-white/5 ${
                          actorSeat === 'all' ? 'bg-blue-600/30 text-blue-200 font-bold' : 'text-white hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">全體玩家</span>
                        {actorSeat === 'all' && (
                          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActorSeat('storyteller');
                          setIsActorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between border-t border-white/5 ${
                          actorSeat === 'storyteller' ? 'bg-blue-600/30 text-amber-300 font-bold' : 'text-amber-400 hover:bg-slate-800 font-bold'
                        }`}
                      >
                        <span className="truncate">說書人</span>
                        {actorSeat === 'storyteller' && (
                          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 第 2 列: 動作 (標籤 1 列排 5 個) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-base font-bold text-stone-200 whitespace-nowrap shrink-0">動作：</label>
                <input
                  type="text"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  placeholder="輸入或點選下方動作..."
                  className="flex-1 bg-black/80 border border-white/20 hover:border-amber-400/50 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-5 gap-1 pl-14">
                {actionPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setActionType(preset)}
                    className={`py-1 px-1 rounded border text-xs font-medium text-center truncate transition-colors ${
                      actionType === preset
                        ? 'bg-amber-600 border-amber-400 text-white font-bold shadow'
                        : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 第 3 列: 對誰 (標籤 1 列排 7 個) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-base font-bold text-stone-200 whitespace-nowrap shrink-0">對誰：</label>
                  <span className="text-sm text-amber-300 font-mono">
                    {targetSeats.length > 0 ? formatTargetLabel(targetSeats) : '點選多選'}
                  </span>
                </div>
                {targetSeats.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTargetSeats([])}
                    className="px-2 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>✕ 清空已選</span>
                  </button>
                )}
              </div>
              <div className="pl-14">
                {renderSeatButtons(targetSeats, handleToggleTargetSeat)}
              </div>
            </div>

            {/* 第 4 列: 結果 */}
            <div className="flex items-center gap-2">
              <label className="text-base font-bold text-stone-200 whitespace-nowrap shrink-0">結果：</label>
              <input
                type="text"
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="輸入結果描述（例如：是惡魔、死亡、中毒、無事發生）..."
                className="flex-1 bg-black/80 border border-white/20 hover:border-amber-400/50 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 儲存動作按鈕 */}
            <button
              onClick={handleAddStructuredRecord}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-base shadow-md transition-colors mt-2"
            >
              ＋ 新增動作紀錄
            </button>
          </div>
        )}

        {/* 分頁 2: 局勢 */}
        {activeTab === 'situation' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
            {/* 座位 (標籤 1 列排 7 個) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-stone-200">座位</span>
                {selectedSeats.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSeats([])}
                    className="px-2 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>✕ 清空已選</span>
                  </button>
                )}
              </div>
              <div>
                {renderSeatButtons(selectedSeats, handleToggleFreeformSeat)}
              </div>
            </div>

            {/* 自訂局勢文字 */}
            <div>
              <textarea
                rows={3}
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                placeholder="輸入任意局勢備忘或事件紀錄..."
                className="w-full bg-black/80 border border-white/20 hover:border-amber-400/50 rounded-lg p-3 text-base text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* 儲存局勢按鈕 */}
            <button
              onClick={handleAddFreeformRecord}
              disabled={!freeformText.trim()}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-lg text-base shadow-md transition-colors"
            >
              ＋ 新增局勢紀錄
            </button>
          </div>
        )}

        {/* 分頁 3: 遊戲紀錄 (包含歷史清單與最後的「開始覆盤」按鈕) */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Header / Clear */}
            <div className="px-4 py-1.5 flex items-center justify-between text-sm text-stone-400 border-b border-white/10 shrink-0">
              <span className="font-bold text-stone-300">遊戲紀錄 ({timeline.length} 步)</span>
              {timeline.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('確定要清空整場復盤紀錄嗎？')) {
                      clearReplayTimeline(roomId);
                    }
                  }}
                  className="px-2.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>✕ 清空紀錄</span>
                </button>
              )}
            </div>

            {/* Timeline Events Scroll List：可拖曳左側把手調整順序（僅說書人看得到這個分頁） */}
            <div className="flex-1 min-h-[120px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {timeline.length === 0 ? (
                <div className="text-center py-6 text-sm font-medium text-white/50">
                  尚未有任何紀錄
                </div>
              ) : (
                <DndContext
                  sensors={timelineDragSensors}
                  collisionDetection={closestCenter}
                  autoScroll={{ threshold: { x: 0, y: 0.08 } }}
                  onDragEnd={handleTimelineDragEnd}
                >
                  <SortableContext items={timeline.map(ev => ev.id!)} strategy={verticalListSortingStrategy}>
                    {timeline.map((ev, idx) => {
                      const isCur = isReplayActive && replayMode?.currentStepIndex === idx;
                      return (
                        <SortableTimelineItem
                          key={ev.id || idx}
                          id={ev.id!}
                          isCur={isCur}
                          onClick={() => {
                            if (isReplayActive) {
                              setIsAutoPlaying(false);
                              setRoomReplayStep(roomId, idx, timeline);
                            }
                          }}
                          onDelete={() => { if (ev.id) deleteReplayEvent(roomId, ev.id); }}
                        >
                          <span className="font-bold text-amber-400 font-mono text-xs">
                            #{idx + 1} 第 {ev.dayNumber} 天 ({ev.timePhase === 'night' ? '黑夜' : '白天'})
                          </span>
                          <div className="font-bold text-base text-white whitespace-pre-line mt-1">{ev.title}</div>
                          {ev.description && ev.description !== ev.title && (
                            <div className="text-sm text-stone-300 mt-0.5 whitespace-pre-line">{ev.description}</div>
                          )}
                        </SortableTimelineItem>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* 戰報區域（根據遊戲紀錄自動產生不可編輯模板 + 可自由插入/調整位置的自訂文字） */}
            {(() => {
              const templateDraft = generateBattleReportDraft({
                events: timeline,
                players,
                grimoireState,
                grimoireTokens,
                script,
              });
              const templateLines = templateDraft.split('\n');
              const maxIndex = Math.max(-1, templateLines.length - 1);

              const persistNotes = (next: BattleReportNote[]) => {
                setCustomNotes(next);
                saveBattleReport(roomId, next);
              };

              const handleAddNote = () => {
                if (!noteInput.trim()) return;
                const newNote: BattleReportNote = {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  text: noteInput.trim(),
                  afterIndex: maxIndex,
                };
                persistNotes([...customNotes, newNote]);
                setNoteInput('');
              };

              const moveNote = (noteId: string, delta: -1 | 1) => {
                const target = customNotes.find((n) => n.id === noteId);
                if (!target) return;
                const clampedCur = Math.min(Math.max(-1, target.afterIndex), maxIndex);
                const nextIdx = Math.min(Math.max(-1, clampedCur + delta), maxIndex);
                persistNotes(
                  customNotes.map((n) => (n.id === noteId ? { ...n, afterIndex: nextIdx } : n))
                );
              };

              const deleteNote = (noteId: string) => {
                persistNotes(customNotes.filter((n) => n.id !== noteId));
              };

              const handleDropAt = (targetAfterIndex: number) => {
                if (!draggingNoteId) return;
                const clamped = Math.min(Math.max(-1, targetAfterIndex), maxIndex);
                persistNotes(
                  customNotes.map((n) => (n.id === draggingNoteId ? { ...n, afterIndex: clamped } : n))
                );
                setDraggingNoteId(null);
                setDropAfterIndex(null);
              };

              const renderSeatLabel = (seatNum: number, name?: string, key?: number) => (
                <span key={key} className="font-bold">
                  <span className="text-amber-300">{seatNum}號{name ? ' - ' : ''}</span>
                  {name && <span className="text-white">{name}</span>}
                </span>
              );

              const renderYellowSeatTag = (raw: string, key: number) => {
                const m = /^(\d+號(?:\s*-\s*)?)([\s\S]*)$/.exec(raw);
                if (!m) return <span key={key} className="text-amber-300 font-bold">{raw}</span>;
                return (
                  <span key={key} className="font-bold">
                    <span className="text-amber-300">{m[1]}</span>
                    {m[2] && <span className="text-white">{m[2]}</span>}
                  </span>
                );
              };

              const renderColoredLine = (line: string, keyPrefix: string) => {
                const tokens = line.split(/(@\d+|#[^\s，。、：；！？（）()\n]+|\[死亡\]|\[存活\]|\[好人\]|\[邪惡\]|\[說書人\]|\[yellow\][\s\S]*?\[\/yellow\]|\[blue\][\s\S]*?\[\/blue\]|\[red\][\s\S]*?\[\/red\])/g);
                return (
                  <div key={keyPrefix} className="leading-relaxed min-h-[1.25rem]">
                    {tokens.map((tok, i) => {
                      if (!tok) return null;
                      if (/^@\d+$/.test(tok)) {
                        const seatNum = Number(tok.slice(1));
                        const p = players.find((pl: any) => pl.seat === seatNum);
                        return renderSeatLabel(seatNum, p?.name, i);
                      }
                      if (tok.startsWith('#')) {
                        const roleName = tok.slice(1);
                        const role = findRoleByNameOrId(roleName, script);
                        const isEvilRole = role?.type === 'minion' || role?.type === 'demon';
                        const cls = !role ? 'text-emerald-300 font-bold' : isEvilRole ? 'text-red-400 font-bold' : 'text-blue-300 font-bold';
                        return <span key={i} className={cls}>{roleName}</span>;
                      }
                      if (tok === '[死亡]') return <span key={i} className="text-red-400 font-bold">[死亡]</span>;
                      if (tok === '[存活]') return <span key={i} className="text-emerald-300 font-bold">[存活]</span>;
                      if (tok === '[好人]') return <span key={i} className="text-blue-300 font-bold">[好人]</span>;
                      if (tok === '[邪惡]') return <span key={i} className="text-red-400 font-bold">[邪惡]</span>;
                      if (tok === '[說書人]') return <span key={i} className="text-amber-300 font-bold">[說書人]</span>;
                      if (tok.startsWith('[yellow]')) return renderYellowSeatTag(tok.replace(/\[\/?yellow\]/g, ''), i);
                      if (tok.startsWith('[blue]')) return <span key={i} className="text-blue-300 font-bold">{tok.replace(/\[\/?blue\]/g, '')}</span>;
                      if (tok.startsWith('[red]')) return <span key={i} className="text-red-400 font-bold">{tok.replace(/\[\/?red\]/g, '')}</span>;
                      return <span key={i}>{tok}</span>;
                    })}
                  </div>
                );
              };

              const notesAtIndex = (idx: number) =>
                customNotes.filter((n) => Math.min(Math.max(-1, n.afterIndex), maxIndex) === idx);

              const renderNoteBlock = (note: BattleReportNote) => {
                const clampedIdx = Math.min(Math.max(-1, note.afterIndex), maxIndex);
                const isDragging = draggingNoteId === note.id;
                return (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', note.id);
                      setDraggingNoteId(note.id);
                    }}
                    onDragEnd={() => {
                      setDraggingNoteId(null);
                      setDropAfterIndex(null);
                    }}
                    className={`my-1 px-2 py-1 rounded bg-amber-950/35 border border-amber-500/30 flex items-start justify-between gap-1.5 group transition-opacity ${isDragging ? 'opacity-40' : ''}`}
                  >
                    <span
                      className="shrink-0 self-stretch flex items-center text-amber-400/60 group-hover:text-amber-300 cursor-grab active:cursor-grabbing select-none pr-0.5"
                      title="拖曳調整位置"
                    >
                      ⠿
                    </span>
                    <div className="flex-1 min-w-0">
                      {note.text.split('\n').map((l, li) => renderColoredLine(l, `${note.id}-${li}`))}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={clampedIdx <= -1}
                        onClick={() => moveNote(note.id, -1)}
                        className="px-1 py-0.5 rounded bg-black/50 hover:bg-amber-600/40 text-amber-200 text-[10px] disabled:opacity-25"
                        title="上移一層"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={clampedIdx >= maxIndex}
                        onClick={() => moveNote(note.id, 1)}
                        className="px-1 py-0.5 rounded bg-black/50 hover:bg-amber-600/40 text-amber-200 text-[10px] disabled:opacity-25"
                        title="下移一層"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="px-1 py-0.5 rounded bg-black/50 hover:bg-red-800/70 text-red-300 text-[10px]"
                        title="刪除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              };

              const buildCombinedPlainText = () => {
                const out: string[] = [];
                notesAtIndex(-1).forEach((n) => out.push(n.text));
                templateLines.forEach((line, idx) => {
                  out.push(line);
                  notesAtIndex(idx).forEach((n) => out.push(n.text));
                });
                return exportBattleReportPlainText(out.join('\n'), players);
              };

              return (
                <div className="border-t border-white/15 bg-black/40 flex flex-col shrink-0 max-h-[55%] relative">
                  {reportMenu !== 'none' && (
                    <div className="fixed inset-0 z-40" onClick={() => setReportMenu('none')} />
                  )}
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300 tracking-wider">戰報</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(buildCombinedPlainText());
                        setReportCopied(true);
                        setTimeout(() => setReportCopied(false), 1800);
                      }}
                      className="px-2.5 py-0.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors"
                    >
                      {reportCopied ? '✓ 已複製' : '複製戰報'}
                    </button>
                  </div>

                  {/* 唯讀戰報模板 ＋ 可調整位置的自訂補充（支援拖曳或 ▲▼） */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 text-xs text-stone-200 space-y-0.5 custom-scrollbar select-text">
                    {draggingNoteId && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDropAfterIndex(-1); }}
                        onDrop={(e) => { e.preventDefault(); handleDropAt(-1); }}
                        className={`h-3 rounded transition-colors ${dropAfterIndex === -1 ? 'bg-amber-400/40 border border-amber-400' : 'border border-dashed border-white/15'}`}
                      />
                    )}
                    {notesAtIndex(-1).map(renderNoteBlock)}
                    {templateLines.map((line, idx) => (
                      <React.Fragment key={`tpl-${idx}`}>
                        <div
                          onDragOver={(e) => {
                            if (!draggingNoteId) return;
                            e.preventDefault();
                            setDropAfterIndex(idx);
                          }}
                          onDrop={(e) => {
                            if (!draggingNoteId) return;
                            e.preventDefault();
                            handleDropAt(idx);
                          }}
                          className={`rounded transition-colors ${
                            draggingNoteId && dropAfterIndex === idx
                              ? 'border-b-2 border-amber-400 bg-amber-500/10'
                              : ''
                          }`}
                        >
                          {renderColoredLine(line, `tpl-${idx}`)}
                        </div>
                        {notesAtIndex(idx).map(renderNoteBlock)}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* 座位 / 角色快速插入 ＋ 自訂文字輸入框 */}
                  <div className="p-2 border-t border-white/10 bg-black/50 space-y-1.5 relative">
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setReportMenu(reportMenu === 'seat' ? 'none' : 'seat')}
                        className={`px-2.5 py-1 rounded border font-bold transition-colors flex items-center gap-1 ${reportMenu === 'seat' ? 'bg-amber-600/50 border-amber-400 text-amber-100' : 'bg-slate-900 hover:bg-slate-800 border-white/20 text-amber-300'}`}
                      >
                        <span>座位</span>
                        <span className="text-[10px] opacity-60">▾</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportMenu(reportMenu === 'role' ? 'none' : 'role')}
                        className={`px-2.5 py-1 rounded border font-bold transition-colors flex items-center gap-1 ${reportMenu === 'role' ? 'bg-blue-700/70 border-blue-400 text-blue-100' : 'bg-blue-950/70 hover:bg-blue-900/70 border-blue-500/40 text-blue-400'}`}
                      >
                        <span>角色</span>
                        <span className="text-[10px] opacity-60">▾</span>
                      </button>
                      <span className="text-[10px] text-white/40 ml-auto">新增後可按 ▲▼ 調整位置</span>
                    </div>

                    {reportMenu === 'seat' && (
                      <div className="absolute bottom-full left-2 right-2 mb-1 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-2 grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                        {seats.map((s) => {
                          const p = players.find((pl: any) => pl.seat === s);
                          const label = p?.name ? `${s}號 - ${p.name}` : `${s}號`;
                          const tag = `[yellow]${label}[/yellow]`;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setNoteInput((prev) => (prev ? `${prev} ${tag}` : tag));
                                setReportMenu('none');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-600/30 border border-white/10 text-amber-300 font-bold text-xs truncate text-left"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {reportMenu === 'role' && (
                      <div className="absolute bottom-full left-2 right-2 mb-1 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-2 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {(script?.roles || []).map((r) => {
                          const roleColor =
                            r.type === 'townsfolk'
                              ? 'text-blue-400 hover:bg-blue-900/40'
                              : r.type === 'outsider'
                              ? 'text-sky-300 hover:bg-sky-900/40'
                              : r.type === 'minion'
                              ? 'text-rose-300 hover:bg-rose-900/40'
                              : r.type === 'demon'
                              ? 'text-red-500 hover:bg-red-900/40'
                              : 'text-purple-300 hover:bg-purple-900/40';
                          const isEvilRole = r.type === 'minion' || r.type === 'demon';
                          const tag = isEvilRole ? `[red]【${r.name}】[/red]` : `[blue]【${r.name}】[/blue]`;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setNoteInput((prev) => (prev ? `${prev} ${tag}` : tag));
                                setReportMenu('none');
                              }}
                              className={`px-2 py-1 rounded bg-slate-800 border border-white/10 font-bold text-xs truncate text-left ${roleColor}`}
                            >
                              {r.name}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNote();
                          }
                        }}
                        placeholder="輸入自訂戰報補充文字..."
                        className="flex-1 min-w-0 bg-black/70 border border-white/15 focus:border-amber-400 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={!noteInput.trim()}
                        className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-35 text-white rounded-md text-xs font-bold shrink-0 transition-colors"
                      >
                        ＋ 插入
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 開始覆盤按鈕 (放置在遊戲紀錄分頁最後) */}
            <div className="p-4 bg-black/60 border-t border-white/10 shrink-0">
              {!isReplayActive ? (
                <button
                  onClick={() => {
                    if (window.confirm('確定要開始全場復盤嗎？')) {
                      startRoomReplay(roomId);
                    }
                  }}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-base shadow-xl transition-all flex items-center justify-center tracking-wider"
                >
                  開始覆盤
                </button>
              ) : (
                <button
                  onClick={() => stopRoomReplay(roomId)}
                  className="w-full py-3 bg-red-900/80 hover:bg-red-800 border border-red-500/50 text-white font-bold rounded-lg text-base transition-all shadow tracking-wider"
                >
                  結束復盤
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
