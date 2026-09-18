import type { Script } from '../types';
import { AllRoles } from '../roles';

export const MiYingXunZong: Script = {
  id: 'mi_ying_xun_zong',
  name: '覓影尋踪 Hide and Seek',
  description: `鐘樓劇本博物館收錄（第79期，2023-06-16）。劇本作者：Narninian & Zaba。海外推薦劇本，亦是 22 世界杯 16 強用劇。以貞潔者、送葬者、傳教士等經典鎮民搭配教父、洗腦師的爪牙陣容，惡魔普卡與亡骨魔帶來延遲致死的節奏，兼顧新手易讀性與高手博弈深度。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Narninian & Zaba",
  roles: [
    // 鎮民 13
    AllRoles['noble'],
    AllRoles['librarian'],
    AllRoles['pixie'],
    AllRoles['preacher'],
    AllRoles['town_crier'],
    AllRoles['oracle'],
    AllRoles['undertaker'],
    AllRoles['dreamer'],
    AllRoles['seamstress'],
    AllRoles['artist'],
    AllRoles['huntsman'],
    AllRoles['ravenkeeper'],
    AllRoles['virgin'],
    // 外來者 4
    AllRoles['damsel'],
    AllRoles['drunk'],
    AllRoles['mutant'],
    AllRoles['goon'],
    // 爪牙 4
    AllRoles['godfather'],
    AllRoles['mezepheles'],
    AllRoles['poisoner'],
    AllRoles['cerenovus'],
    // 惡魔 3
    AllRoles['pukka'],
    AllRoles['vigormortis'],
    AllRoles['imp'],
    // 傳奇 1
    AllRoles['spirit_of_ivory'],
  ]
};
