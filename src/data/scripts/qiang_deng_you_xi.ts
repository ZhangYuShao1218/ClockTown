import type { Script } from '../types';
import { AllRoles } from '../roles';

export const QiangDengYouXi: Script = {
  id: 'qiang_deng_you_xi',
  name: '搶凳遊戲 One In One Out',
  description: `鐘樓劇本博物館收錄（第347期，2024-12-02）。劇本作者：Baron von Klutz。海外推薦劇本，16名鎮民組成龐大的善良陣營，配上酒鬼、莽夫、食人魔等外來者製造陣營混淆，惡魔陣容小惡魔、方古、奧赫、卡扎力輪番變換身分，考驗說書人臨場調度與玩家的資訊整合能力。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Baron von Klutz",
  roles: [
    // 鎮民 13
    AllRoles['knight'],
    AllRoles['steward'],
    AllRoles['fortune_teller'],
    AllRoles['snake_charmer'],
    AllRoles['village_idiot'],
    AllRoles['high_priestess'],
    AllRoles['monk'],
    AllRoles['oracle'],
    AllRoles['seamstress'],
    AllRoles['fisherman'],
    AllRoles['amnesiac'],
    AllRoles['cannibal'],
    AllRoles['farmer'],
    // 外來者 4
    AllRoles['drunk'],
    AllRoles['recluse'],
    AllRoles['goon'],
    AllRoles['ogre'],
    // 爪牙 4
    AllRoles['poisoner'],
    AllRoles['spy'],
    AllRoles['harpy'],
    AllRoles['mezepheles'],
    // 惡魔 4
    AllRoles['imp'],
    AllRoles['fang_gu'],
    AllRoles['ojo'],
    AllRoles['kazali'],
    // 傳奇 1
    AllRoles['spirit_of_ivory'],
  ]
};
