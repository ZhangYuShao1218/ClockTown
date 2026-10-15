import type { Script } from '../types';
import { AllRoles } from '../roles';

export const CaiFengYuBaoLuan: Script = {
  id: 'cai_feng_yu_bao_luan',
  name: '裁縫與暴亂 Seamstress & Riot',
  description: `鐘樓劇本博物館收錄（第28期，2022-12-05），特殊玩法快開劇本。劇本作者：Sui。整局只有兩種角色：所有善良玩家都是女裁縫、所有邪惡玩家都是暴亂。女裁縫們靠一次性的陣營比對拼湊真相，暴亂則在三個白天內以提名製造混亂，搭配騙人精讓資訊多一分不確定，適合短時間內快速開一局。`,
  difficulty: "入門",
  author: "Sui",
  specialRules: [
    {
      title: '全員女裁縫與暴亂',
      description: '所有善良陣營玩家都是女裁縫，所有邪惡陣營玩家都是暴亂。',
      relatedRoleIds: ['seamstress', 'riot'],
    },
  ],
  roleOverrides: {
    seamstress: {
      ability: '每局遊戲限一次，在夜晚時，你可以選擇除你以外的兩名玩家：你會得知他們是否為同一陣營。[所有善良陣營都是女裁縫]',
    },
    riot: {
      ability: '被提名的玩家死亡，但他可以立刻再次發起提名（第三天白天他必須這麼做）。在第三個白天結束時，邪惡陣營獲勝。[所有邪惡陣營都是暴亂]',
    },
  },
  roles: [
    // 鎮民 1
    AllRoles['seamstress'],
    // 惡魔 1
    AllRoles['riot'],
    // 傳奇 1
    AllRoles['fibbin'],
  ]
};
