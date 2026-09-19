import type { Script } from '../types';
import { AllRoles } from '../roles';

export const XunWuQiLv: Script = {
  id: 'xun_wu_qi_lv',
  name: '尋巫奇旅 Xun Wu Qi Lv',
  description: `鐘樓劇本博物館收錄（第529期，2025-03-20），BOTC 世界杯優選劇本。劇本作者：Crispy Duck。以圖書管理員、貴族、守夜人等鎮民建構資訊網，外來者心上人、帽匠、政客暗藏陣營翻轉，爪牙限（夏安）配合惡魔小惡魔、卡扎力、普卡輪番作亂，節奏緊湊、變數豐富。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Crispy Duck",
  specialRules: [
    {
      title: '拜訪翡翠城',
      description: '翡翠城裡的巫師能力有調整，同時如果巫師重新入場，也會有人再次得知巫師在場。每個白天，如果得知巫師在場的玩家依然存活，他可以找說書人猜測一次巫師在本局遊戲下的願望是什麼：他會得知他的猜測有多準確（或巫師尚未許願）。',
      relatedRoleIds: ['wizard'],
    },
  ],
  roleOverrides: {
    wizard: {
      ability: '始終會有一名善良玩家知道巫師在場。每局遊戲限一次，你可以向說書人許願。如果願望被實現，可能會伴隨著代價和線索。',
    },
  },
  roles: [
    // 鎮民 13
    AllRoles['librarian'],
    AllRoles['noble'],
    AllRoles['high_priestess'],
    AllRoles['nightwatchman'],
    AllRoles['savant'],
    AllRoles['artist'],
    AllRoles['amnesiac'],
    AllRoles['cannibal'],
    AllRoles['ravenkeeper'],
    AllRoles['farmer'],
    AllRoles['dreamer'],
    AllRoles['balloonist'],
    AllRoles['shugenja'],
    // 外來者 4
    AllRoles['mutant'],
    AllRoles['sweetheart'],
    AllRoles['hatter'],
    AllRoles['politician'],
    // 爪牙 4
    AllRoles['xaan'],
    AllRoles['scarlet_woman'],
    AllRoles['boomdandy'],
    AllRoles['wizard'],
    // 惡魔 3
    AllRoles['imp'],
    AllRoles['kazali'],
    AllRoles['pukka'],
    // 傳奇 1
    AllRoles['bootlegger'],
  ]
};
