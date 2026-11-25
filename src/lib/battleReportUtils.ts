import { AllRoles } from '../data/roles';
import type { Role, Script } from '../data/types';
import type { ReplayEvent } from '../services/replayService';
import type { SeatToken } from '../components/game/SeatTokenModal';

export interface ReportPlayerInfo {
  uid?: string;
  name?: string;
  seat?: number | null;
}

export interface BattleReportNote {
  id: string;
  text: string;
  /** 插入在哪一行模板文字之後（-1 代表最頂端） */
  afterIndex: number;
}

/**
 * 依劇本與全域角色表查找角色
 */
export function findRoleByNameOrId(query: string, script?: Script): Role | undefined {
  const clean = query.trim();
  if (!clean) return undefined;
  const scriptMatch = script?.roles.find((r) => r.name === clean || r.id === clean);
  if (scriptMatch) return scriptMatch;
  if (AllRoles[clean]) return AllRoles[clean];
  return Object.values(AllRoles).find((r) => r.name === clean);
}

/**
 * 從魔典座位標記中找出代表「真角色」的角色標記（例如酒鬼、提線木偶或角色圖示標記）
 */
function findTrueRoleFromTokens(tokens: SeatToken[] | undefined, script?: Script): Role | undefined {
  if (!Array.isArray(tokens) || tokens.length === 0) return undefined;
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.roleId) {
      const r = findRoleByNameOrId(tok.roleId, script);
      if (r) return r;
    }
    const label = (tok.text || tok.content || '').trim();
    if (!label) continue;
    if (label === '是酒鬼') {
      return findRoleByNameOrId('drunk', script) || findRoleByNameOrId('酒鬼', script);
    }
    const matched = findRoleByNameOrId(label, script);
    if (matched) return matched;
  }
  return undefined;
}

/**
 * 依時間軸復盤紀錄、當前魔典與魔典角色標記產生不可編輯的文字戰報模板
 */
export function generateBattleReportDraft(params: {
  events: ReplayEvent[];
  players: ReportPlayerInfo[];
  grimoireState?: Record<string, { roleId?: string }> | null;
  grimoireTokens?: Record<string, SeatToken[] | undefined> | null;
  script?: Script;
}): string {
  const { events, players, grimoireState, grimoireTokens, script } = params;
  const lines: string[] = [];

  lines.push(`【${script?.name || '血染鐘樓'} — 對局文字戰報】`);
  lines.push('');

  // 1. 開頭：座位與角色總覽（含標示真角色，如 3號 - 廚師 (酒鬼)）
  const seated = players
    .filter((p) => typeof p.seat === 'number' && p.seat > 0)
    .sort((a, b) => (a.seat ?? 0) - (b.seat ?? 0));

  if (seated.length > 0) {
    lines.push('▎ 玩家陣容');
    seated.forEach((p) => {
      const seat = p.seat as number;
      const roleId = grimoireState?.[seat]?.roleId || grimoireState?.[String(seat)]?.roleId;
      const role = roleId ? findRoleByNameOrId(roleId, script) : undefined;
      const tokens = grimoireTokens?.[seat] || grimoireTokens?.[String(seat)];
      const trueRole = findTrueRoleFromTokens(tokens, script);

      if (role) {
        const trueRoleSuffix = trueRole && trueRole.id !== role.id ? ` (#${trueRole.name})` : '';
        lines.push(`[yellow]${seat}號[/yellow] - #${role.name}${trueRoleSuffix}`);
      } else {
        const trueRoleSuffix = trueRole ? ` (#${trueRole.name})` : '';
        lines.push(`[yellow]${seat}號[/yellow] - 未分配角色${trueRoleSuffix}`);
      }
    });
    lines.push('');
  }

  const visibleEvents = events.filter((ev) => ev.type !== 'PHASE_CHANGE');

  // 2. 按「第 N 天 + 晝夜」分組時間軸事件（不含時間推進事件）
  if (visibleEvents.length === 0) {
    lines.push('▎ 對局經過');
    lines.push('（尚無時間軸紀錄）');
    return lines.join('\n');
  }

  lines.push('▎ 對局經過');
  let lastGroupKey = '';

  const formatTarget = (target: number | string): string => {
    if (target === 'good') return '[好人]';
    if (target === 'evil') return '[邪惡]';
    if (target === 'storyteller') return '[說書人]';
    return `@${target}`;
  };

  visibleEvents.forEach((ev) => {
    const phaseLabel = ev.timePhase === 'night' ? '黑夜' : '白天';
    const groupKey = `第 ${ev.dayNumber} 天 ${phaseLabel}`;
    if (groupKey !== lastGroupKey) {
      if (lastGroupKey !== '') {
        lines.push('');
      }
      lines.push(`▸ ${groupKey}`);
      lastGroupKey = groupKey;
    }

    if (ev.type === 'DEATH_TOGGLE') {
      const isRevive = ev.description?.includes('存活');
      const seatTag = ev.actorSeat !== null && ev.actorSeat !== undefined ? `@${ev.actorSeat}` : '[說書人]';
      lines.push(`  • ${isRevive ? '[存活]' : '[死亡]'} : ${seatTag}`);
      return;
    }

    if (ev.type === 'SITUATION_LOG') {
      const tags = (ev.targetSeats || []).map((t) => formatTarget(t)).join('、');
      const prefix = tags ? `${tags} ` : '';
      lines.push(`  • ${prefix}${ev.description || '（無描述）'}`);
      return;
    }

    const actorStr =
      ev.actorSeat === null || ev.actorSeat === undefined || ev.actorSeat === 'storyteller'
        ? '[說書人]'
        : `@${ev.actorSeat}`;
    const targetsStr =
      ev.targetSeats && ev.targetSeats.length > 0
        ? ` → ${ev.targetSeats.map((t) => formatTarget(t)).join('、')}`
        : '';

    if (ev.type === 'ACTION_LOG' && ev.actionType) {
      const res = ev.resultText ? `：${ev.resultText}` : '';
      lines.push(`  • [${ev.actionType}] ${actorStr}${targetsStr}${res}`);
      return;
    }

    const descStr = ev.description ? `：${ev.description}` : '';
    lines.push(`  • ${actorStr}${targetsStr}${descStr}`);
  });

  return lines.join('\n');
}

/**
 * 將含有 @座位、#角色、[yellow]/[blue]/[red] 標記的戰報轉為適合貼到 Discord/社群的乾淨純文字
 */
export function exportBattleReportPlainText(
  rawText: string,
  players: ReportPlayerInfo[]
): string {
  return rawText
    .replace(/@(\d+)/g, (_, numStr) => {
      const seatNum = Number(numStr);
      const p = players.find((pl) => pl.seat === seatNum);
      return p?.name ? `${seatNum}號 - ${p.name}` : `${seatNum}號`;
    })
    .replace(/#([^\s，。、：；！？（）()\n]+)/g, '$1')
    .replace(/\[\/?(yellow|blue|red)\]/g, '');
}
