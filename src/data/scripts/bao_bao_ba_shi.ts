import type { Script } from '../types';
import { AllRoles } from '../roles';

export const BaoBaoBaShi: Script = {
  id: 'bao_bao_ba_shi',
  name: '寶寶巴士 Bao Bao Ba Shi',
  description: `鐘樓劇本博物館收錄（第587期，2025-05-06），專為新手量身打造的入門劇本（Baby In Car v1.1.0）。劇本作者：太一。沒有中毒與醉酒、沒有互動干擾，大量公開聲稱與鼓勵私聊的角色：真心人互通真心、送報童播報新聞、調音師與調香師探路、浪人反殺惡魔、銀匠在最後一天親手處決；邪惡方的玩偶甚至不知道自己是壞人。上車吧，萌新寶寶！`,
  recommendedPlayers: "5 - 15",
  difficulty: "入門",
  author: "太一",
  specialRules: [
    {
      title: '女裁縫替換藝術家',
      description: '如果玩家整體水平較高，建議使用女裁縫替代藝術家。劇本難度會有一定提升，對局會更加平衡。',
      relatedRoleIds: ['seamstress', 'artist'],
    },
    {
      title: '相剋規則：玩偶與告密者',
      description: '玩偶不會獲得不在場角色，遊戲開始時惡魔會替代玩偶獲得 3 個不在場角色。',
      relatedRoleIds: ['wanou', 'snitch'],
    },
  ],
  roles: [
    // 鎮民 14（女裁縫為藝術家的替換選項）
    AllRoles['zhenxinren'],
    AllRoles['tiaoyinshi'],
    AllRoles['shugenja'],
    AllRoles['empath'],
    AllRoles['fortune_teller'],
    AllRoles['oracle'],
    AllRoles['tiaoxiangshi'],
    AllRoles['langren'],
    AllRoles['artist'],
    AllRoles['songbaotong'],
    AllRoles['alsaahir'],
    AllRoles['sage'],
    AllRoles['yinjiang'],
    AllRoles['seamstress'],
    // 外來者 4
    AllRoles['klutz'],
    AllRoles['drunk'],
    AllRoles['snitch'],
    AllRoles['ogre'],
    // 爪牙 4
    AllRoles['scarlet_woman'],
    AllRoles['baron'],
    AllRoles['wanou'],
    AllRoles['goblin'],
    // 惡魔 2
    AllRoles['imp'],
    AllRoles['vortox'],
    // 傳奇 1
    AllRoles['angel'],
  ]
};
