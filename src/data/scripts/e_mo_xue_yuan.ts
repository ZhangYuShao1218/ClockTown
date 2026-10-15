import type { Script } from '../types';
import { AllRoles } from '../roles';

export const EMoXueYuan: Script = {
  id: 'e_mo_xue_yuan',
  name: '惡魔學院 E Mo Xue Yuan',
  description: `鐘樓劇本博物館收錄（第669期，2025-08-04），《沒有贊助杯》活動劇本。劇本作者：「謎題管理局」小熊。惡魔在學院中完成任務累積進修點，再從詭謀參議院、暴虐鬥技場、千變穹頂閣等學院習得額外能力，四項任務全數完成即可選擇黑冕拜謁堂直接畢業。鎮民方以學者、七色鹿、龍庭侍衛、巴隆-撒麥迪、陰陽先生等原創角色對抗霧影、學院長、肅清使、死神等爪牙。`,
  recommendedPlayers: "7 - 15",
  difficulty: "專家",
  author: "「謎題管理局」小熊",
  specialRules: [
    {
      title: '惡魔學院',
      description: '說書人需要在遊戲開始前，決定使用「刺客」還是「死神」並告知玩家（不會同時在場）。每個夜晚，惡魔可以消耗一個進修點來將一個未選擇過的學院中的一個能力變為自己能力的一部分（可以疊加和傳遞）。下個黎明時，所有玩家會得知惡魔選擇的學院的格言。',
      relatedRoleIds: ['assassin', 'sishen', 'xueyuanzhang', 'suqingshi'],
      icon: '/drama/special/emoxueyuan.png',
    },
    {
      title: '小惡魔自習室',
      description: '小惡魔在場時，完成以下任務會獲得進修點，每個任務每局遊戲限完成一次。\n①成為惡魔。\n②一名曾經的爪牙成為惡魔。\n③一名外來者被處決。\n④大於等於一半玩家死亡。',
      relatedRoleIds: ['imp'],
      icon: '/drama/special/xiaoemo_zixishi.png',
    },
    {
      title: '亡骨魔補習班',
      description: '亡骨魔在場時，完成以下任務會獲得進修點，每個任務每局遊戲限完成一次。\n①成為惡魔。\n②一名爪牙死亡並保留能力。\n③瘋狂自己是一名外來者。\n④大於等於一半玩家死亡。',
      relatedRoleIds: ['vigormortis'],
      icon: '/drama/special/wangumo_buxiban.png',
    },
    {
      title: '詭謀參議院',
      description: '毒藥兩滴，可葬王朝；黑白顛倒，亦覆乾坤。\n①諾-達鯴：與你鄰近的兩名鎮民中毒。\n②渦流：鎮民玩家的能力會產生錯誤的資訊。',
      icon: '/drama/special/guimou_canyiyuan.png',
    },
    {
      title: '暴虐鬥技場',
      description: '力量即真理，鮮血鑄王座。\n①浪劫：每個夜晚*，選擇一名玩家：如果他上個白天被邪惡玩家提名過，他死亡。\n②燭陰：如果惡魔殺死了一名爪牙或外來者，那麼可以再選擇一個鎮民角色，如果他在場：他死亡。',
      icon: '/drama/special/baonue_doujichang.png',
    },
    {
      title: '千變穹頂閣',
      description: '形無常駐，念即疆域。\n①姑獲鳥：惡魔擁有上個死於處決的爪牙的能力。\n②麻臉巫婆：每局遊戲限一次，在夜晚時*，選擇一名玩家和一個非惡魔角色：如果該角色不在場，他變為那個角色。',
      icon: '/drama/special/qianbian_qiongdingge.png',
    },
    {
      title: '黑冕拜謁堂',
      description: '烏金噬星芒，骸骨塑冕章。僅完成四個任務後可以選擇。\n畢業快樂：下個黃昏結束時，邪惡陣營獲勝。',
      icon: '/drama/special/heimian_baiyetang.png',
    },
  ],
  roles: [
    // 鎮民 13
    AllRoles['xuezhe'],
    AllRoles['qiselu'],
    AllRoles['dreamer'],
    AllRoles['savant'],
    AllRoles['zhifu'],
    AllRoles['longtingshiwei'],
    AllRoles['artist'],
    AllRoles['monk'],
    AllRoles['luomuren'],
    AllRoles['balong_samaidi'],
    AllRoles['yinyangxiansheng'],
    AllRoles['gambler'],
    AllRoles['chambermaid'],
    // 外來者 4
    AllRoles['acrobat'],
    AllRoles['moonchild'],
    AllRoles['snitch'],
    AllRoles['xiaoyaogu'],
    // 爪牙 5
    AllRoles['wuying'],
    AllRoles['xueyuanzhang'],
    AllRoles['suqingshi'],
    AllRoles['sishen'],
    AllRoles['assassin'],
    // 惡魔 2
    AllRoles['imp'],
    AllRoles['vigormortis'],
  ]
};
