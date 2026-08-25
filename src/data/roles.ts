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
  flavor?: string;
}

// ================= Townsfolk (鎮民) =================
export const Washerwoman: Role = {
  flavor: '水流洗淨了鎮民的衣裳，卻洗不淨暗處的血跡。你的雙眼，總能看透那被隱藏的真實身分。',
  id: 'washerwoman',
  name: '洗衣婦',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/washerwoman.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個鎮民角色：這兩名玩家之一是該角色。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-good">鎮民角色：這兩名玩家之一是該角色。</span>'
};

export const Librarian: Role = {
  flavor: '在泛黃的書卷中，記錄著被遺忘的詛咒。你熟知鎮上每一個外來者的秘密，即便他們自己也一無所知。',
  id: 'librarian',
  name: '圖書管理員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/librarian.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個外來者角色：這兩名玩家之一是該角色（或者你會得知沒有外來者在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-good">外來者角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span class="highlight-good">外來者在場）。</span>'
};

export const Investigator: Role = {
  flavor: '每一個細微的線索，都指向潛藏的邪惡。爪牙的陰影在你的追蹤下無所遁形。',
  id: 'investigator',
  name: '調查員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/investigator.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有爪牙在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-evil">爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span class="highlight-evil">爪牙在場）。</span>'
};

export const Chef: Role = {
  flavor: '爐火的溫度與廚房的氣味，讓你對周圍的邪惡有著敏銳的直覺。相鄰的黑暗，總會露出馬腳。',
  id: 'chef',
  name: '廚師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/chef.png',
  ability: '在你的首個夜晚，你會得知場上鄰座的邪惡玩家有多少對。',
  abilityHTML: '在你的首個夜晚，你會得知場上<span class="highlight-good">鄰座的</span><span class="highlight-evil">邪惡玩家有多少對。</span>'
};

export const Empath: Role = {
  flavor: '你的心跳能與周遭的靈魂共鳴。鄰座的邪惡氣息，是你在黑夜中揮之不去的夢魘。',
  id: 'empath',
  name: '共情者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/empath.png',
  ability: '每個夜晚，你會得知與你鄰近的兩名存活的玩家中邪惡玩家的數量。',
  abilityHTML: '每個夜晚，你會得知與你<span class="highlight-good">鄰近的兩名</span><span class="highlight-good">存活的玩家中</span><span class="highlight-evil">邪惡玩家的數量。</span>'
};

export const FortuneTeller: Role = {
  flavor: '星辰與水晶球映照出血紅的未來。你的占卜能準確地指出惡魔的所在，即便偶爾會被命運開個玩笑。',
  id: 'fortune_teller',
  name: '占卜師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/fortuneteller.png',
  ability: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有惡魔。會有一名善良玩家始終被你的能力當作惡魔。',
  abilityHTML: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有<span class="highlight-evil">惡魔。會有一名</span><span class="highlight-good">善良玩家始終被你的能力當作</span><span class="highlight-evil">惡魔。</span>'
};

export const Undertaker: Role = {
  flavor: '死人不說謊。當鎮民將他們吊死，你負責為他們收屍，同時也揭開了他們生前最後的秘密。',
  id: 'undertaker',
  name: '送葬者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/undertaker.png',
  ability: '每個夜晚*，你會得知今天白天死於處決的玩家的角色。',
  abilityHTML: '每個夜晚*，你會得知今天<span class="highlight-evil">白天死於處決的玩家的角色。</span>'
};

export const Monk: Role = {
  flavor: '你的信仰與祈禱化作堅不可摧的護盾。今夜，你的庇護將讓惡魔的利爪無功而返。',
  id: 'monk',
  name: '僧侶',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/monk.png',
  ability: '每個夜晚*，你要選擇除你以外的一名玩家：當晚惡魔的負面能力對他無效。',
  abilityHTML: '每個夜晚*，你要選擇除你以外的一名玩家：當晚<span class="highlight-evil">惡魔的負面能力對他無效。</span>'
};

export const Ravenkeeper: Role = {
  flavor: '群鴉是你的眼線，死亡是你的代價。當你倒下的那一刻，真相將向你徹底敞開。',
  id: 'ravenkeeper',
  name: '守鴉人',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/ravenkeeper.png',
  ability: '如果你在夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會得知他的角色。',
  abilityHTML: '如果你在<span class="highlight-evil">夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會</span><span class="highlight-good">得知他的角色。</span>'
};

export const Virgin: Role = {
  flavor: '純潔是你的武器，也是致命的陷阱。那些敢於質疑你的人，必將遭到公開的制裁。',
  id: 'virgin',
  name: '貞潔者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/virgin.png',
  ability: '當你首次被提名時，如果提名你的玩家是鎮民，他立刻被處決。',
  abilityHTML: '當你<span class="highlight-evil">首次被提名時，如果提名你的玩家是</span><span class="highlight-good">鎮民，他立刻被</span><span class="highlight-evil">處決。</span>'
};

export const Slayer: Role = {
  flavor: '你的槍管裡只剩下一發子彈，但這就夠了。等待時機，給予惡魔致命的一擊吧。',
  id: 'slayer',
  name: '獵手',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/slayer.png',
  ability: '一局遊戲僅限一次。在白天任意時間，你可以選擇公開對場上存活的任意一名玩家發動技能；如果該名玩家為惡魔，則該玩家死亡（善良陣營獲勝）；否則無事發生。'
};

export const Soldier: Role = {
  flavor: '身經百戰的你，有著無法被撼動的意志。惡魔的爪牙在你面前，不過是徒勞的掙扎。',
  id: 'soldier',
  name: '士兵',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/soldier.png',
  ability: '惡魔的負面能力對你無效。',
  abilityHTML: '<span class="highlight-evil">惡魔的負面能力對你無效。</span>'
};

export const Mayor: Role = {
  flavor: '你掌握著這座城鎮的權力。當末日降臨，只要你還活著，善良陣營就仍有一絲希望。',
  id: 'mayor',
  name: '鎮長',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/icons/mayor.png',
  ability: '如果在白天僅有三名存活玩家，且你沒有被處決時，善良陣營獲得勝利。如果你在夜晚被擊殺，有 50% 的機率另一名玩家會代替你死去。'
};


// ================= Outsiders (外來者) =================
export const Butler: Role = {
  flavor: '你習慣了服從與跟隨。主人的意志就是你的意志，即便在生死的投票面前也是如此。',
  id: 'butler',
  name: '管家',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/butler.png',
  ability: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有他投票時你才能投票。',
  abilityHTML: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有<span class="highlight-good">他投票時你才能投票。</span>'
};

export const Drunk: Role = {
  flavor: '一杯接一杯，世界在你眼中扭曲變形。你以為自己是英雄，但你只是個一無所知的醉漢。',
  id: 'drunk',
  name: '酒鬼',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/drunk.png',
  ability: '你不知道你是酒鬼。你以為你是一個鎮民角色，但其實你不是。',
  abilityHTML: '你不知道你是酒鬼。你以為你是一個<span class="highlight-good">鎮民角色，但其實你不是。</span>'
};

export const Recluse: Role = {
  flavor: '你選擇遠離人群，卻被當作黑暗的同黨。即使你心向光明，靈魂卻始終散發著邪惡的氣息。',
  id: 'recluse',
  name: '陌客',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/recluse.png',
  ability: '你可能會被當作邪惡陣營、爪牙角色或惡魔角色，即使你已死亡。',
  abilityHTML: '你可能會被當作<span class="highlight-evil">邪惡陣營、</span><span class="highlight-evil">爪牙角色或</span><span class="highlight-evil">惡魔角色，即使你已</span><span class="highlight-evil">死亡。</span>'
};

export const Saint: Role = {
  flavor: '他們將你視作聖人，然而這卻是悲劇的開始。如果你被處決，整個城鎮將為你的死陪葬。',
  id: 'saint',
  name: '聖徒',
  alignment: 'good',
  type: 'outsider',
  icon: '/icons/saint.png',
  ability: '如果你死於處決，你的陣營落敗。',
  abilityHTML: '如果你死於處決，你的陣營<span class="highlight-evil">落敗。</span>'
};


// ================= Minions (爪牙) =================
export const Poisoner: Role = {
  flavor: '幾滴無色無味的毒藥，就能讓最聰明的人陷入瘋狂。今夜，你又要讓誰的感官錯亂呢？',
  id: 'poisoner',
  name: '投毒者',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/poisoner.png',
  ability: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天中毒。',
  abilityHTML: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天<span class="highlight-evil">中毒。</span>'
};

export const Spy: Role = {
  flavor: '你潛伏在光明之中，翻閱著魔法書的每一頁。沒有任何秘密能逃過你的雙眼。',
  id: 'spy',
  name: '間諜',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/spy.png',
  ability: '每個夜晚，你能查看魔典。你可能會被當作善良陣營、鎮民角色或外來者角色，即使你已死亡。',
  abilityHTML: '每個夜晚，你能查看魔典。你可能會被當作<span class="highlight-good">善良陣營、</span><span class="highlight-good">鎮民角色或</span><span class="highlight-good">外來者角色，即使你已</span><span class="highlight-evil">死亡。</span>'
};

export const ScarletWoman: Role = {
  flavor: '你是暗影中的繼承者。當王座崩塌，你將披上血色的長袍，成為新的夢魘。',
  id: 'scarlet_woman',
  name: '紅唇女郎',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/scarletwoman.png',
  ability: '如果大於等於五名玩家存活時（旅行者不計算在內）惡魔死亡，你變成那個惡魔。',
  abilityHTML: '如果大於等於五名玩家<span class="highlight-good">存活時（旅行者不計算在內）</span><span class="highlight-evil">惡魔死亡，你變成那個</span><span class="highlight-evil">惡魔。</span>'
};

export const Baron: Role = {
  flavor: '你的詭計讓鎮上的秩序陷入混亂。更多的外人，意味著更多的猜忌與不安。',
  id: 'baron',
  name: '男爵',
  alignment: 'evil',
  type: 'minion',
  icon: '/icons/baron.png',
  ability: '會有額外的外來者在場。[+2外來者]',
  abilityHTML: '會有額外的外來者在場。<span class="highlight-good">[+2外來者]</span>'
};


// ================= Demon (惡魔) =================
export const Imp: Role = {
  flavor: '你是黑鍾鎮隱藏的邪惡存在，一段被遺忘的過去。人們是如此稱呼你：小惡魔。',
  id: 'imp',
  name: '小惡魔',
  alignment: 'evil',
  type: 'demon',
  icon: '/icons/imp.png',
  ability: '每個夜晚*，你要選擇一名玩家：他死亡。如果你以這種方式自殺，一名爪牙會變成小惡魔。',
  abilityHTML: '每個夜晚*，你要選擇一名玩家：他<span class="highlight-evil">死亡。如果你以這種方式自殺，一名</span><span class="highlight-evil">爪牙會變成</span><span class="highlight-evil">小惡魔。</span>'
};

export const Sentinel: Role = {
  flavor: '你守護著這座城鎮的邊緣。外來者的數量在你眼中，不再是個謎團。',
  id: 'sentinel',
  name: '哨兵',
  alignment: 'good',
  type: 'fabled',
  icon: '/icons/sentinel.png',
  ability: '外來者數量可能 +1 或 -1'
};

export const Angel: Role = {
  flavor: '你的羽翼帶來了恩典。新手將在你的庇護下，免受第一夜的殘酷侵擾。',
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
