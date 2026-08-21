export type Alignment = 'good' | 'evil';
export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled';

export interface Role {
  id: string;
  name: string;
  alignment: Alignment;
  type: RoleType;
  ability: string;
  image?: string;
  icon?: string;
  description?: string;
  abilityHTML?: string;
}

// ================= Townsfolk (鎮民) =================
export const Washerwoman: Role = {
  id: 'washerwoman',
  name: '洗衣婦',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/washerwoman.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個鎮民角色：這兩名玩家之一是該角色。',
  abilityHTML: '在你的首個夜晚，你會得知<span style=\"color: #F87171; font-weight: bold;\">兩名玩家和一個</span><span style=\"color: #60A5FA; font-weight: bold;\">鎮民角色：這兩名玩家之一是該角色。</span>'
};

export const Librarian: Role = {
  id: 'librarian',
  name: '圖書管理員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/librarian.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個外來者角色：這兩名玩家之一是該角色（或者你會得知沒有外來者在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span style=\"color: #F87171; font-weight: bold;\">兩名玩家和一個</span><span style=\"color: #60A5FA; font-weight: bold;\">外來者角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span style=\"color: #60A5FA; font-weight: bold;\">外來者在場）。</span>'
};

export const Investigator: Role = {
  id: 'investigator',
  name: '調查員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/investigator.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有爪牙在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span style=\"color: #F87171; font-weight: bold;\">兩名玩家和一個</span><span style=\"color: #F87171; font-weight: bold;\">爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span style=\"color: #F87171; font-weight: bold;\">爪牙在場）。</span>'
};

export const Chef: Role = {
  id: 'chef',
  name: '廚師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/chef.png',
  ability: '在你的首個夜晚，你會得知場上鄰座的邪惡玩家有多少對。',
  abilityHTML: '在你的首個夜晚，你會得知場上<span style=\"color: #60A5FA; font-weight: bold;\">鄰座的</span><span style=\"color: #F87171; font-weight: bold;\">邪惡玩家有多少對。</span>'
};

export const Empath: Role = {
  id: 'empath',
  name: '共情者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/empath.png',
  ability: '每個夜晚，你會得知與你鄰近的兩名存活的玩家中邪惡玩家的數量。',
  abilityHTML: '每個夜晚，你會得知與你<span style=\"color: #60A5FA; font-weight: bold;\">鄰近的兩名</span><span style=\"color: #60A5FA; font-weight: bold;\">存活的玩家中</span><span style=\"color: #F87171; font-weight: bold;\">邪惡玩家的數量。</span>'
};

export const FortuneTeller: Role = {
  id: 'fortune_teller',
  name: '占卜師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/fortuneteller.png',
  ability: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有惡魔。會有一名善良玩家始終被你的能力當作惡魔。',
  abilityHTML: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有<span style=\"color: #F87171; font-weight: bold;\">惡魔。會有一名</span><span style=\"color: #60A5FA; font-weight: bold;\">善良玩家始終被你的能力當作</span><span style=\"color: #F87171; font-weight: bold;\">惡魔。</span>'
};

export const Undertaker: Role = {
  id: 'undertaker',
  name: '送葬者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/undertaker.png',
  ability: '每個夜晚*，你會得知今天白天死於處決的玩家的角色。',
  abilityHTML: '每個夜晚*，你會得知今天<span style=\"color: #F87171; font-weight: bold;\">白天死於處決的玩家的角色。</span>'
};

export const Monk: Role = {
  id: 'monk',
  name: '僧侶',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/monk.png',
  ability: '每個夜晚*，你要選擇除你以外的一名玩家：當晚惡魔的負面能力對他無效。',
  abilityHTML: '每個夜晚*，你要選擇除你以外的一名玩家：當晚<span style=\"color: #F87171; font-weight: bold;\">惡魔的負面能力對他無效。</span>'
};

export const Ravenkeeper: Role = {
  id: 'ravenkeeper',
  name: '守鴉人',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/ravenkeeper.png',
  ability: '如果你在夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會得知他的角色。',
  abilityHTML: '如果你在<span style=\"color: #F87171; font-weight: bold;\">夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會</span><span style=\"color: #60A5FA; font-weight: bold;\">得知他的角色。</span>'
};

export const Virgin: Role = {
  id: 'virgin',
  name: '貞潔者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/virgin.png',
  ability: '當你首次被提名時，如果提名你的玩家是鎮民，他立刻被處決。',
  abilityHTML: '當你<span style=\"color: #F87171; font-weight: bold;\">首次被提名時，如果提名你的玩家是</span><span style=\"color: #60A5FA; font-weight: bold;\">鎮民，他立刻被</span><span style=\"color: #F87171; font-weight: bold;\">處決。</span>'
};

export const Slayer: Role = {
  id: 'slayer',
  name: '獵手',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/slayer.png',
  ability: '一局遊戲僅限一次。在白天任意時間，你可以選擇公開對場上存活的任意一名玩家發動技能；如果該名玩家為惡魔，則該玩家死亡（善良陣營獲勝）；否則無事發生。'
};

export const Soldier: Role = {
  id: 'soldier',
  name: '士兵',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/soldier.png',
  ability: '惡魔的負面能力對你無效。',
  abilityHTML: '<span style=\"color: #F87171; font-weight: bold;\">惡魔的負面能力對你無效。</span>'
};

export const Mayor: Role = {
  id: 'mayor',
  name: '鎮長',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/mayor.png',
  ability: '如果在白天僅有三名存活玩家，且你沒有被處決時，善良陣營獲得勝利。如果你在夜晚被擊殺，有 50% 的機率另一名玩家會代替你死去。'
};


// ================= Outsiders (外來者) =================
export const Butler: Role = {
  id: 'butler',
  name: '管家',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/butler.png',
  ability: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有他投票時你才能投票。',
  abilityHTML: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有<span style=\"color: #60A5FA; font-weight: bold;\">他投票時你才能投票。</span>'
};

export const Drunk: Role = {
  id: 'drunk',
  name: '酒鬼',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/drunk.png',
  ability: '你不知道你是酒鬼。你以為你是一個鎮民角色，但其實你不是。',
  abilityHTML: '你不知道你是酒鬼。你以為你是一個<span style=\"color: #60A5FA; font-weight: bold;\">鎮民角色，但其實你不是。</span>'
};

export const Recluse: Role = {
  id: 'recluse',
  name: '陌客',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/recluse.png',
  ability: '你可能會被當作邪惡陣營、爪牙角色或惡魔角色，即使你已死亡。',
  abilityHTML: '你可能會被當作<span style=\"color: #F87171; font-weight: bold;\">邪惡陣營、</span><span style=\"color: #F87171; font-weight: bold;\">爪牙角色或</span><span style=\"color: #F87171; font-weight: bold;\">惡魔角色，即使你已</span><span style=\"color: #F87171; font-weight: bold;\">死亡。</span>'
};

export const Saint: Role = {
  id: 'saint',
  name: '聖徒',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/saint.png',
  ability: '如果你死於處決，你的陣營落敗。',
  abilityHTML: '如果你死於處決，你的陣營<span style=\"color: #F87171; font-weight: bold;\">落敗。</span>'
};


// ================= Minions (爪牙) =================
export const Poisoner: Role = {
  id: 'poisoner',
  name: '投毒者',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/poisoner.png',
  ability: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天中毒。',
  abilityHTML: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天<span style=\"color: #F87171; font-weight: bold;\">中毒。</span>'
};

export const Spy: Role = {
  id: 'spy',
  name: '間諜',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/spy.png',
  ability: '每個夜晚，你能查看魔典。你可能會被當作善良陣營、鎮民角色或外來者角色，即使你已死亡。',
  abilityHTML: '每個夜晚，你能查看魔典。你可能會被當作<span style=\"color: #60A5FA; font-weight: bold;\">善良陣營、</span><span style=\"color: #60A5FA; font-weight: bold;\">鎮民角色或</span><span style=\"color: #60A5FA; font-weight: bold;\">外來者角色，即使你已</span><span style=\"color: #F87171; font-weight: bold;\">死亡。</span>'
};

export const ScarletWoman: Role = {
  id: 'scarlet_woman',
  name: '紅唇女郎',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/scarletwoman.png',
  ability: '如果大於等於五名玩家存活時（旅行者不計算在內）惡魔死亡，你變成那個惡魔。',
  abilityHTML: '如果大於等於五名玩家<span style=\"color: #60A5FA; font-weight: bold;\">存活時（旅行者不計算在內）</span><span style=\"color: #F87171; font-weight: bold;\">惡魔死亡，你變成那個</span><span style=\"color: #F87171; font-weight: bold;\">惡魔。</span>'
};

export const Baron: Role = {
  id: 'baron',
  name: '男爵',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/baron.png',
  ability: '會有額外的外來者在場。[+2外來者]',
  abilityHTML: '會有額外的外來者在場。<span style=\"color: #60A5FA; font-weight: bold;\">[+2外來者]</span>'
};


// ================= Demon (惡魔) =================
export const Imp: Role = {
  id: 'imp',
  name: '小惡魔',
  alignment: 'evil',
  type: 'demon',
  icon: '/icons/imp.png',
  ability: '每個夜晚*，你要選擇一名玩家：他死亡。如果你以這種方式自殺，一名爪牙會變成小惡魔。',
  abilityHTML: '每個夜晚*，你要選擇一名玩家：他<span style=\"color: #F87171; font-weight: bold;\">死亡。如果你以這種方式自殺，一名</span><span style=\"color: #F87171; font-weight: bold;\">爪牙會變成</span><span style=\"color: #F87171; font-weight: bold;\">小惡魔。</span>'
};

export const Sentinel: Role = {
  id: 'sentinel',
  name: '哨兵',
  alignment: 'good',
  type: 'fabled',
  icon: '/icons/sentinel.png',
  ability: '外來者數量可能 +1 或 -1'
};

export const Angel: Role = {
  id: 'angel',
  name: '天使',
  alignment: 'good',
  type: 'fabled',
  icon: '/icons/angel.png',
  ability: '對新玩家的死亡負最大責任的人，可能會遭遇一些不好的事情。'
};

export const AllRoles: Record<string, Role> = {
  washerwoman: Washerwoman,
  librarian: Librarian,
  investigator: Investigator,
  chef: Chef,
  empath: Empath,
  fortune_teller: FortuneTeller,
  undertaker: Undertaker,
  monk: Monk,
  ravenkeeper: Ravenkeeper,
  virgin: Virgin,
  slayer: Slayer,
  soldier: Soldier,
  mayor: Mayor,
  butler: Butler,
  drunk: Drunk,
  recluse: Recluse,
  saint: Saint,
  poisoner: Poisoner,
  spy: Spy,
  scarlet_woman: ScarletWoman,
  baron: Baron,
  imp: Imp,
  sentinel: Sentinel,
  angel: Angel
};
