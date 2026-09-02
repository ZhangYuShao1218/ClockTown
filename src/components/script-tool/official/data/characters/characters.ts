/**
 * 團隊顏色 / 名稱定義，以及「官方核心角色中文文案」。
 *
 * ⚠️ 單一資料源：角色的中文文案（名稱 / 能力 / 說書人提醒 / 標記）
 * 一律取自主專案 `src/data/roles/*`（AllRoles），不再於此另外維護一份。
 * roles.json（英文結構資料：夜晚順序、圖片、edition）仍由 canonicalCharacters 使用，
 * 兩者透過 normalizeCharacterId 對齊。
 */
import { TEAM_COLORS, TEAM_NAMES } from '../../theme/colors';
import { AllRoles } from '../../../../../data/roles';

// 匯出團隊顏色和名稱（從統一配置匯入）
export { TEAM_COLORS, TEAM_NAMES };

export interface ZhCoreCharacter {
  id: string;
  name: string;
  ability: string;
  team: string;
  firstNight: number;
  otherNight: number;
  firstNightReminder: string;
  otherNightReminder: string;
  reminders: string[];
  setup: boolean;
}

/**
 * 官方 / 核心角色中文文案（id 為中文規範，如 fortune_teller）。
 * 從 `src/data/roles/*` 衍生 —— 修改角色文案請改那裡。
 */
export const ZH_CORE_CHARACTERS: Record<string, ZhCoreCharacter> = Object.fromEntries(
  Object.values(AllRoles).map((r) => [
    r.id,
    {
      id: r.id,
      name: r.name,
      ability: r.ability,
      team: r.type,
      firstNight: r.firstNight ?? 0,
      otherNight: r.otherNight ?? 0,
      firstNightReminder: r.firstNightReminder ?? '',
      otherNightReminder: r.otherNightReminder ?? '',
      reminders: r.reminders ?? [],
      setup: r.setup ?? false,
    },
  ]),
);
