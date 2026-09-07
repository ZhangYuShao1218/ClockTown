import type { Role, RoleType, Alignment, Script } from '../data/types';

/**
 * 把外部的「血染鐘樓劇本 JSON」（botcscripts.com / 集石 / 鐘樓劇本博物館 匯出格式）
 * 轉成本專案的 Script，**完全採用 JSON 提供的資料**（角色能力、夜晚順序、圖示、名稱都以
 * JSON 為準；就算本地有同名角色也不取代、也不修改本地資料，只在本局使用）。
 *
 * - 所有簡體中文文字會轉成繁體中文（opencc-js，動態載入，只有上傳時才下載）。
 * - 支援的條目：字串（僅角色 id，會被當成無能力自訂角色）、`{ id:"_meta" }`（劇本資訊）、
 *   物件（完整角色定義）。
 */

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

type S2T = (s: string) => string;

/** 動態載入 opencc-js 的簡→繁轉換器；載入失敗時退回原字串。 */
async function loadConverter(): Promise<S2T> {
  try {
    const OpenCC = await import('opencc-js/cn2t');
    const convert = OpenCC.Converter({ from: 'cn', to: 'tw' });
    return (s) => (typeof s === 'string' && s ? convert(s) : s);
  } catch {
    return (s) => s;
  }
}

const toNum = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function buildRole(entry: any, t: S2T): Role | null {
  const rawId =
    typeof entry === 'string'
      ? entry
      : String(entry?.id ?? entry?.GstoneID ?? '').trim();
  if (!rawId) return null;

  const src = typeof entry === 'string' ? {} : entry;
  const rawTeam = String(src.team || src.roleType || 'townsfolk').toLowerCase();
  const type = TEAM_TO_TYPE[rawTeam] || 'townsfolk';

  const role: Role = {
    id: rawId,
    name: t(String(src.name || rawId)),
    alignment: teamToAlignment(type),
    type,
    ability: t(String(src.ability || '')),
    firstNight: toNum(src.firstNight),
    otherNight: toNum(src.otherNight),
  };

  const icon = src.image || src.icon;
  if (typeof icon === 'string' && icon) role.icon = icon;
  else if (Array.isArray(icon) && typeof icon[0] === 'string') role.icon = icon[0];

  if (src.flavor) role.flavor = t(String(src.flavor));
  if (src.firstNightReminder) role.firstNightReminder = t(String(src.firstNightReminder));
  if (src.otherNightReminder) role.otherNightReminder = t(String(src.otherNightReminder));
  if (Array.isArray(src.reminders)) {
    const rem = src.reminders.filter((x: any) => typeof x === 'string' && x).map((x: string) => t(x));
    if (rem.length) role.reminders = rem;
  }
  if (src.setup === 1 || src.setup === true) role.setup = true;

  return role;
}

export async function parseBotcScript(raw: unknown): Promise<Script> {
  let list: any[];
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === 'object' && Array.isArray((raw as any).roles)) list = (raw as any).roles;
  else throw new Error('不是有效的劇本 JSON（預期為陣列或 { roles: [] }）');

  const t = await loadConverter();

  let name = '自訂劇本';
  let description = '';
  let author: string | undefined;
  let logo: string | undefined;
  const roles: Role[] = [];
  const seen = new Set<string>();

  for (const entry of list) {
    if (entry && typeof entry === 'object' && entry.id === '_meta') {
      if (entry.name) name = t(String(entry.name));
      if (entry.author) author = t(String(entry.author));
      if (entry.description) description = t(String(entry.description));
      if (typeof entry.logo === 'string' && entry.logo) logo = entry.logo;
      continue;
    }
    const role = buildRole(entry, t);
    if (role && !seen.has(role.id)) {
      seen.add(role.id);
      roles.push(role);
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
  if (logo) script.logo = logo;
  return script;
}
