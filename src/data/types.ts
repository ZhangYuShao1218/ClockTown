export type Alignment = 'good' | 'evil' | 'neutral';
export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled' | 'loric';

export interface Role {
  id: string;
  name: string;
  alignment: Alignment;
  type: RoleType;
  ability: string;
  image?: string;
  icon?: string;
  description?: string;
  recommendedPlayers?: string;
  difficulty?: string;
  flavor?: string;
  firstNight?: number;
  otherNight?: number;
  firstNightReminder?: string;
  otherNightReminder?: string;
  /** 說書人提醒標記（token） */
  reminders?: string[];
  /** 是否影響開局配置 */
  setup?: boolean;
  /** 執行期標記：本劇本針對此角色套用了 roleOverrides 局部覆寫（由 applyRoleOverrides 動態產生，非資料來源欄位） */
  isOverridden?: boolean;
}

/** 劇本專屬、不屬於任何單一角色卡的特殊規則（例如「拜訪翡翠城」「神的不在場證明」） */
export interface ScriptSpecialRule {
  title: string;
  description: string;
  /** 關聯角色 id（供 UI 顯示關聯提示，非必填） */
  relatedRoleIds?: string[];
}

export interface Script {
  id: string;
  name: string;
  description: string;
  recommendedPlayers?: string;
  difficulty?: string;
  roles: Role[];
  jinxes?: Array<{ role1: string; role2: string; reason: string }>;
  author?: string;
  playerCount?: string;
  category?: string;
  /** 自訂劇本（上傳 JSON）帶的 logo 圖 URL；內建劇本用 public/drama/Drama_<id>.png。 */
  logo?: string;
  /** 不屬於任何單一角色卡的劇本專屬特殊規則 */
  specialRules?: ScriptSpecialRule[];
  /** 針對本劇本角色能力文字的局部覆寫（不影響 AllRoles 共用資料），key 為角色 id */
  roleOverrides?: Record<string, Partial<Pick<Role, 'ability' | 'flavor' | 'firstNightReminder' | 'otherNightReminder'>>>;
}

export interface SeatStatus {
  isDead?: boolean;
  hasGhostVote?: boolean;
  pendingExecution?: boolean;
}

export interface VotingState {
  phase: 'idle' | 'selecting_nominee' | 'voting' | 'finished';
  nominatorSeat: number | null;
  nomineeSeat: number | null;
  startTime: number | null;
  timePerPlayerMs: number;
  votes: Record<string, boolean>; // map uid to boolean
}
