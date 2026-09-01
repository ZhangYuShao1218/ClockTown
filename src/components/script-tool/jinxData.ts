export interface JinxRule {
  role1: string;
  role2: string;
  reason: string;
}

export const OfficialJinxes: JinxRule[] = [
  {
    role1: 'chambermaid',
    role2: 'mathematician',
    reason: '侍女無法得知數學家是否因為自身能力而在夜晚醒來。'
  },
  {
    role1: 'cannibal',
    role2: 'butler',
    reason: '如果食人族獲得管家的能力，食人族可以在沒有主人的情況下自由投票。'
  },
  {
    role1: 'cannibal',
    role2: 'juggler',
    reason: '如果雜耍藝人在白天被處決，且食人族在下一個白天猜測了角色，食人族會在當晚得知正確猜測的數量。'
  },
  {
    role1: 'cannibal',
    role2: 'zealot',
    reason: '如果狂熱者被處決，食人族不會獲得狂熱者的能力。'
  },
  {
    role1: 'cerenovus',
    role2: 'goblin',
    reason: '若塞拉諾芙斯使地精陷入瘋狂，則地精不能聲稱自己是地精。'
  },
  {
    role1: 'chambermaid',
    role2: 'al-hadikhia',
    reason: '侍女得知哈迪奇亞是否醒來，但不知道被哈迪奇亞喚醒的玩家是否算作因自身能力醒來。'
  },
  {
    role1: 'drunk',
    role2: 'boffin',
    reason: '酒鬼不會因為博學者而獲得額外的能力。'
  },
  {
    role1: 'godfather',
    role2: 'heretic',
    reason: '若教父與異端分子同時在場，可能不會有額外的外來者加入遊戲。'
  },
  {
    role1: 'marionette',
    role2: 'balloonist',
    reason: '傀儡不會因為氣球駕駛員而增加外來者。'
  },
  {
    role1: 'marionette',
    role2: 'damsel',
    reason: '傀儡不知道貴家女在場。'
  },
  {
    role1: 'marionette',
    role2: 'huntsman',
    reason: '傀儡不會因為獵手而增加貴家女。'
  },
  {
    role1: 'marionette',
    role2: 'snitch',
    reason: '傀儡不會在首夜得知偽裝。'
  },
  {
    role1: 'pit-hag',
    role2: 'damsel',
    reason: '如果麻臉巫婆創造了貴家女，說書人會告知爪牙們有貴家女在場。'
  },
  {
    role1: 'pit-hag',
    role2: 'heretic',
    reason: '麻臉巫婆無法創造異端分子。'
  },
  {
    role1: 'scarlet_woman',
    role2: 'fang_gu',
    reason: '如果方咕跳轉至外來者且死亡，緋紅之婦不會變成方咕。'
  },
  {
    role1: 'spy',
    role2: 'damsel',
    reason: '間諜無法猜測誰是貴家女。'
  },
  {
    role1: 'spy',
    role2: 'magician',
    reason: '間諜註冊為善良角色時，魔術師能力對其有效。'
  },
  {
    role1: 'widow',
    role2: 'damsel',
    reason: '寡婦無法猜測誰是貴家女。'
  },
  {
    role1: 'widow',
    role2: 'magician',
    reason: '寡婦在查看魔法書時，魔術師不會被特別標註。'
  },
  {
    role1: 'alchemist',
    role2: 'spy',
    reason: '鍊金術士不能擁有間諜的能力。'
  },
  {
    role1: 'alchemist',
    role2: 'widow',
    reason: '鍊金術士不能擁有寡婦的能力。'
  },
  {
    role1: 'boffin',
    role2: 'heretic',
    reason: '博學者不能賦予惡魔異端分子的能力。'
  },
  {
    role1: 'golem',
    role2: 'fool',
    reason: '如果魔像提名弄臣，弄臣依然可能失去免死能力。'
  },
  {
    role1: 'hatter',
    role2: 'pit-hag',
    reason: '瘋帽匠死亡時，麻臉巫婆無法將惡魔變更為場上已有的惡魔。'
  },
  {
    role1: 'kazali',
    role2: 'soldier',
    reason: '卡札里不能將士兵選為爪牙。'
  },
  {
    role1: 'lil_monsta',
    role2: 'poppy_grower',
    reason: '若小怪獸與罌粟種植者同時在場，爪牙在首夜各自獨立被喚醒照顧小怪獸。'
  },
  {
    role1: 'yaggababble',
    role2: 'exorcist',
    reason: '如果雅嘎巴布被驅魔人選中，他在當天依然可以說出秘密詞彙，但當晚不會殺人。'
  }
];
