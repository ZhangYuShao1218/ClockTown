import type { Script } from '../types';
import { AllRoles } from '../roles';

export const YingSuHuaKai: Script = {
  id: 'ying_su_hua_kai',
  name: '罌粟花開 Poppy Grower',
  description: `鐘樓劇本博物館收錄（第18期，2022-12-03），官方劇本。劇本作者：Dan。罌粟種植者讓爪牙與惡魔彼此不相識，搭配告密者、小精靈與賞金獵人，資訊與陣營判斷都充滿迷霧；惡魔方小惡魔、渦流、軍團三選一，每一局的攻防節奏截然不同。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Dan",
  roles: [
    // 鎮民 13
    AllRoles['librarian'],
    AllRoles['chef'],
    AllRoles['fortune_teller'],
    AllRoles['monk'],
    AllRoles['oracle'],
    AllRoles['town_crier'],
    AllRoles['savant'],
    AllRoles['juggler'],
    AllRoles['farmer'],
    AllRoles['mayor'],
    AllRoles['bounty_hunter'],
    AllRoles['pixie'],
    AllRoles['poppy_grower'],
    // 外來者 4
    AllRoles['drunk'],
    AllRoles['mutant'],
    AllRoles['snitch'],
    AllRoles['lunatic'],
    // 爪牙 4
    AllRoles['baron'],
    AllRoles['evil_twin'],
    AllRoles['cerenovus'],
    AllRoles['marionette'],
    // 惡魔 3
    AllRoles['imp'],
    AllRoles['vortox'],
    AllRoles['legion'],
    // 傳奇 1
    AllRoles['djinn'],
  ]
};
