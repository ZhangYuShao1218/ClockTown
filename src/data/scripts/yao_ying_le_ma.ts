import type { Script } from '../types';
import { AllRoles } from '../roles';

export const YaoYingLeMa: Script = {
  id: 'yao_ying_le_ma',
  name: '要贏了嗎？ Yao Ying Le Ma',
  description: `鐘樓劇本博物館收錄（第32期，2022-12-05），汀西維爾小型劇本。劇本作者：我相（曾用名：勝負難料）。專為 5-6 人設計：異端分子反轉勝負條件、農夫與守鴉人、獵手、舞蛇人輪番出手，邪惡方只有提線木偶與方古，局勢一路翻轉到最後一刻——到底要贏了嗎？`,
  recommendedPlayers: "5 - 6",
  difficulty: "中等",
  author: "我相",
  roleOverrides: {
    farmer: {
      ability: '如果你在夜晚死亡，一名存活的善良玩家（優先選擇外來者）會變成農夫。',
    },
  },
  roles: [
    // 鎮民 6
    AllRoles['farmer'],
    AllRoles['ravenkeeper'],
    AllRoles['slayer'],
    AllRoles['artist'],
    AllRoles['snake_charmer'],
    AllRoles['cannibal'],
    // 外來者 4
    AllRoles['heretic'],
    AllRoles['puzzlemaster'],
    AllRoles['lunatic'],
    AllRoles['sweetheart'],
    // 爪牙 1
    AllRoles['marionette'],
    // 惡魔 1
    AllRoles['fang_gu'],
  ]
};
