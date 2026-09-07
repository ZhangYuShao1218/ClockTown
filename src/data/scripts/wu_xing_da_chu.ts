import type { Script } from '../types';
import { AllRoles } from '../roles';

export const WuXingDaChu: Script = {
  id: 'wu_xing_da_chu',
  name: '五星大廚 Chefs Deluxe',
  description: `鐘樓劇本博物館收錄（第253期）。劇本作者：Harald。海外官方網站推薦的快速上手劇本——以廚師、雜耍藝人、失憶者等資訊角色搭配洗腦師、鏡像雙子與方古、軍團，情報量充足又不失張力，適合新手快速理解鐘樓的攻防節奏。`,
  recommendedPlayers: "7 - 15",
  difficulty: "入門",
  author: "Harald",
  roles: [
    // 鎮民 13
    AllRoles['chef'],
    AllRoles['pixie'],
    AllRoles['snake_charmer'],
    AllRoles['mathematician'],
    AllRoles['town_crier'],
    AllRoles['philosopher'],
    AllRoles['fisherman'],
    AllRoles['savant'],
    AllRoles['juggler'],
    AllRoles['cannibal'],
    AllRoles['poppy_grower'],
    AllRoles['amnesiac'],
    AllRoles['atheist'],
    // 外來者 4
    AllRoles['drunk'],
    AllRoles['mutant'],
    AllRoles['recluse'],
    AllRoles['puzzlemaster'],
    // 爪牙 4
    AllRoles['cerenovus'],
    AllRoles['marionette'],
    AllRoles['evil_twin'],
    AllRoles['spy'],
    // 惡魔 3
    AllRoles['fang_gu'],
    AllRoles['imp'],
    AllRoles['legion'],
  ]
};
