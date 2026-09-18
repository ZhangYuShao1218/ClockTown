import type { Script } from '../types';
import { AllRoles } from '../roles';

export const WuYeLieChe: Script = {
  id: 'wu_ye_lie_che',
  name: '午夜列車 Late Night Drive By',
  description: `鐘樓劇本博物館收錄（第102期，2023-07-25）。劇本作者：Aero。專為 5-6 人小局設計的海外推薦劇本，鎮民陣容小巧但資訊密度高，外來者修補匠、魔像牽動場面節奏，惡魔普卡與小惡魔擇一登場，是人數不足時的絕佳選擇。`,
  recommendedPlayers: "5 - 6",
  difficulty: "入門",
  author: "Aero",
  roles: [
    // 鎮民 6
    AllRoles['snake_charmer'],
    AllRoles['lycanthrope'],
    AllRoles['slayer'],
    AllRoles['fool'],
    AllRoles['alchemist'],
    AllRoles['minstrel'],
    // 外來者 3
    AllRoles['tinker'],
    AllRoles['recluse'],
    AllRoles['golem'],
    // 爪牙 3
    AllRoles['godfather'],
    AllRoles['psychopath'],
    AllRoles['scarlet_woman'],
    // 惡魔 2
    AllRoles['pukka'],
    AllRoles['imp'],
  ]
};
