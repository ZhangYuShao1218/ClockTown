import type { Script } from '../types';
import { AllRoles } from '../roles';

export const GuangYuYing: Script = {
  id: 'guang_yu_ying',
  name: '光與影 Guang Yu Ying',
  description: `鐘樓劇本博物館收錄（第888期，2026-01-28），國內「象牙塔」玩家投稿的原創角色劇本。劇本作者：際塵。工匠、瘸子、遊戲玩家、盲女、鏽劍騎士、彼岸戀人、女王、悲劇演員等大量原創鎮民，搭配烏鴉嘴、巫女等外來者，以及帕克、夏基、百臂巨人等爪牙與典獄長、奸佞兩位惡魔，光明與陰影的界線在每一夜被重新劃定。`,
  recommendedPlayers: "7 - 15",
  difficulty: "專家",
  author: "際塵",
  specialRules: [
    {
      title: '俄羅斯方塊',
      description: '遊戲玩家所得知的俄羅斯方塊類型對照：①上-藍 ②左中-橙 ③中中-綠 ④右中-紅 ⑤左下-紫 ⑥中下-白 ⑦右下-黃',
      relatedRoleIds: ['youxiwanjia'],
      icon: '/drama/special/eluosifangkuai.png',
    },
  ],
  roles: [
    // 鎮民 14
    AllRoles['gongjiang'],
    AllRoles['quezi'],
    AllRoles['youxiwanjia'],
    AllRoles['fortune_teller'],
    AllRoles['shiguan'],
    AllRoles['mangnv'],
    AllRoles['town_crier'],
    AllRoles['gambler'],
    AllRoles['savant'],
    AllRoles['xiujianqishi'],
    AllRoles['bianlianren'],
    AllRoles['alchemist'],
    AllRoles['nvwang'],
    AllRoles['beijuyanyuan'],
    // 外來者 4
    AllRoles['hatter'],
    AllRoles['wuyazui'],
    AllRoles['barber'],
    AllRoles['wunv'],
    // 爪牙 6
    AllRoles['godfather'],
    AllRoles['evil_twin'],
    AllRoles['pake'],
    AllRoles['xiaji'],
    AllRoles['baibijuren'],
    AllRoles['wizard'],
    // 惡魔 2
    AllRoles['dianyuzhang'],
    AllRoles['jianning'],
  ]
};
