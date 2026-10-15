import type { Role, RoleType } from '../data/types';

/** 陣營配置欄位順序：與 public/distribution [鎮民, 外來者, 爪牙, 惡魔, 旅行者] 對齊 */
const DIST_TYPES: RoleType[] = ['townsfolk', 'outsider', 'minion', 'demon', 'traveler'];
export const DIST_LABELS = ['鎮民', '外來者', '爪牙', '惡魔', '旅行者'];

type GrimoireState = Record<string, { roleId?: string | null } | null | undefined>;

export interface BoardDistribution {
  /** [鎮民, 外來者, 爪牙, 惡魔, 旅行者] */
  counts: number[];
  /** 尚未放置角色的座位數 */
  emptySeats: number;
}

export interface DistributionComparison {
  board: number[];
  expected: number[];
  emptySeats: number;
  /** 任一方有旅行者時才顯示旅行者欄 */
  showTraveler: boolean;
  matches: boolean;
}

/** 統計魔典座位 1..seatCount 上實際擺放的角色類型數量 */
export const countBoardDistribution = (
  grimoire: GrimoireState,
  seatCount: number,
  findRole: (roleId: string) => Role | undefined,
): BoardDistribution => {
  const counts = [0, 0, 0, 0, 0];
  let emptySeats = 0;
  for (let seat = 1; seat <= seatCount; seat++) {
    const roleId = grimoire[seat]?.roleId;
    const idx = roleId ? DIST_TYPES.indexOf(findRole(roleId)?.type as RoleType) : -1;
    if (idx >= 0) counts[idx]++;
    else emptySeats++;
  }
  return { counts, emptySeats };
};

/** 比較版面角色配置與資訊配置（distribution） */
export const compareDistribution = (board: BoardDistribution, expected: number[]): DistributionComparison => {
  const exp = DIST_TYPES.map((_, i) => expected[i] ?? 0);
  return {
    board: board.counts,
    expected: exp,
    emptySeats: board.emptySeats,
    showTraveler: board.counts[4] > 0 || exp[4] > 0,
    matches: board.emptySeats === 0 && exp.every((n, i) => n === board.counts[i]),
  };
};
