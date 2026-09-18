import type { Script } from '../types';
import { AllRoles } from '../roles';

export const WangHaiMiYuan: Script = {
  id: 'wang_hai_mi_yuan',
  name: '亡骸密院 Wang Hai Mi Yuan',
  description: `鐘樓劇本博物館收錄（第535期，2025-03-24），BOTC 世界杯優選劇本。劇本作者：Ember。哲學家、戲法師、鎮長等高階鎮民角色齊聚，外來者落難少女牽動局勢，爪牙洗腦師、召喚師、男爵、灵言師、紅唇女郎五路並進，惡魔涡流讓鎮民資訊全面失真，是一套資訊戰與心理戰兼具的進階劇本。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Ember",
  roles: [
    // 鎮民 13
    AllRoles['librarian'],
    AllRoles['shugenja'],
    AllRoles['fortune_teller'],
    AllRoles['monk'],
    AllRoles['town_crier'],
    AllRoles['oracle'],
    AllRoles['huntsman'],
    AllRoles['philosopher'],
    AllRoles['savant'],
    AllRoles['alsaahir'],
    AllRoles['fisherman'],
    AllRoles['soldier'],
    AllRoles['mayor'],
    // 外來者 4
    AllRoles['recluse'],
    AllRoles['mutant'],
    AllRoles['drunk'],
    AllRoles['damsel'],
    // 爪牙 5
    AllRoles['cerenovus'],
    AllRoles['summoner'],
    AllRoles['baron'],
    AllRoles['mezepheles'],
    AllRoles['scarlet_woman'],
    // 惡魔 3
    AllRoles['imp'],
    AllRoles['vortox'],
    AllRoles['vigormortis'],
    // 傳奇 1
    AllRoles['bootlegger'],
  ]
};
