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
