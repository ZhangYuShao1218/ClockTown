import type { Script } from '../data/types';

/**
 * 將 script.roleOverrides 合併進 script.roles，回傳套用後的新 Script。
 * 被覆寫的角色會標記 isOverridden，供 UI 顯示「限定」徽章。
 */
export function applyRoleOverrides(script: Script): Script {
  if (!script.roleOverrides) return script;
  const overrides = script.roleOverrides;
  return {
    ...script,
    roles: script.roles.map(role => {
      const override = overrides[role.id];
      if (!override) return role;
      return { ...role, ...override, isOverridden: true };
    }),
  };
}
