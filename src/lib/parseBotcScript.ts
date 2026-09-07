import type { Role, RoleType, Alignment, Script } from '../data/types';
import { AllRoles } from '../data/roles';

/**
 * 把外部的「血染鐘樓劇本 JSON」（botcscripts.com / 集石 / 鐘樓劇本博物館 匯出格式）
 * 轉成本專案的 Script。
 *
 * 支援的條目：
 *  - 字串           → 官方角色 id（"washerwoman"）
 *  - { id:"_meta" } → 劇本資訊（name / author），略過不當角色
 *  - 物件           → 自訂角色定義（id / name / ability / team / image …）
 *
 * 只要條目能對應到本專案既有角色（`src/data/roles`），就整包沿用本專案資料
 * （繁中文案、夜晚順序＝集石全域整數、icon、相剋…）。對應不到的才用條目本身的欄位建立。
 */

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const NORMALISED_ROLES: Record<string, string> = {};
for (const key of Object.keys(AllRoles)) NORMALISED_ROLES[norm(key)] = key;

const TEAM_TO_TYPE: Record<string, RoleType> = {
  townsfolk: 'townsfolk',
  outsider: 'outsider',
  minion: 'minion',
  demon: 'demon',
  traveler: 'traveler',
  traveller: 'traveler',
  fabled: 'fabled',
  loric: 'loric',
};

const teamToAlignment = (type: RoleType): Alignment => {
  if (type === 'townsfolk' || type === 'outsider') return 'good';
  if (type === 'minion' || type === 'demon') return 'evil';
  return 'neutral';
};

/** 用多種 id 變體去比對本專案角色，回傳命中的 AllRoles key（沒有則 null）。 */
const resolveKnownRole = (entry: any): string | null => {
  const candidates = [entry?.GstoneID, entry?.gstoneID, entry?.id, typeof entry === 'string' ? entry : null];
  for (const c of candidates) {
    if (!c || typeof c !== 'string') continue;
    const hit = NORMALISED_ROLES[norm(c)];
    if (hit) return hit;
  }
  return null;
};

const buildCustomRole = (entry: any): Role | null => {
  if (!entry || typeof entry !== 'object' || !entry.id) return null;
  const rawTeam = String(entry.team || entry.roleType || '').toLowerCase();
  const type = TEAM_TO_TYPE[rawTeam] || 'townsfolk';
  const role: Role = {
    id: String(entry.id),
    name: String(entry.name || entry.id),
    alignment: teamToAlignment(type),
    type,
    ability: String(entry.ability || ''),
  };
  const icon = entry.image || entry.icon;
  if (typeof icon === 'string' && icon) role.icon = icon;
  else if (Array.isArray(icon) && typeof icon[0] === 'string') role.icon = icon[0];
  if (entry.flavor) role.flavor = String(entry.flavor);
  // 自訂角色的 firstNight/otherNight 是該劇本 local 值、與本專案的集石全域級距不相容，
  // 直接丟進夜晚順序會排錯位置，因此一律歸零（不出現在順序表）。
  role.firstNight = 0;
  role.otherNight = 0;
  if (typeof entry.firstNightReminder === 'string') role.firstNightReminder = entry.firstNightReminder;
  if (typeof entry.otherNightReminder === 'string') role.otherNightReminder = entry.otherNightReminder;
  if (Array.isArray(entry.reminders)) role.reminders = entry.reminders.filter((x: any) => typeof x === 'string');
  return role;
};

export interface ParseResult {
  script: Script;
  /** 對應不到本專案既有角色、用條目自建的角色 id（夜晚順序會缺）。 */
  unknownRoleIds: string[];
}

export function parseBotcScript(raw: unknown): ParseResult {
  let list: any[];
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === 'object' && Array.isArray((raw as any).roles)) list = (raw as any).roles;
  else throw new Error('不是有效的劇本 JSON（預期為陣列或 { roles: [] }）');

  let name = '自訂劇本';
  let description = '';
  let author: string | undefined;
  const roles: Role[] = [];
  const unknownRoleIds: string[] = [];
  const seen = new Set<string>();

  for (const entry of list) {
    if (entry && typeof entry === 'object' && entry.id === '_meta') {
      if (entry.name) name = String(entry.name);
      if (entry.author) author = String(entry.author);
      if (entry.description) description = String(entry.description);
      continue;
    }
    const known = resolveKnownRole(entry);
    if (known) {
      if (seen.has(known)) continue;
      seen.add(known);
      roles.push(AllRoles[known]);
      continue;
    }
    const custom = buildCustomRole(entry);
    if (custom && !seen.has(custom.id)) {
      seen.add(custom.id);
      roles.push(custom);
      unknownRoleIds.push(custom.id);
    }
  }

  if (roles.length === 0) throw new Error('劇本 JSON 內找不到任何角色');

  const script: Script = {
    id: 'custom',
    name,
    description: description || `上傳的自訂劇本，共 ${roles.length} 個角色。`,
    roles,
  };
  if (author) script.author = author;
  return { script, unknownRoleIds };
}
