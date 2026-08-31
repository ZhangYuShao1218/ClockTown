import type { Role } from '../types';

// ================= Townsfolk (鎮民) =================
export const Washerwoman: Role = {
  flavor: '水流洗淨了鎮民的衣裳，卻洗不淨暗處的血跡。你的雙眼，總能看透那被隱藏的真實身分。',
  id: 'washerwoman',
  name: '洗衣婦',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_washerwoman_townsfolk.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個鎮民角色：這兩名玩家之一是該角色。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-good">鎮民角色：這兩名玩家之一是該角色。</span>',
  firstNight: 7500,
  otherNight: 0,
  firstNightReminder: '展示那個鎮民角色標記。指向被你標記“鎮民”和“錯誤”的兩名玩家。',
  otherNightReminder: ''
};

export const Librarian: Role = {
  flavor: '在泛黃的書卷中，記錄著被遺忘的詛咒。你熟知鎮上每一個外來者的秘密，即便他們自己也一無所知。',
  id: 'librarian',
  name: '圖書管理員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_librarian_townsfolk.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個外來者角色：這兩名玩家之一是該角色（或者你會得知沒有外來者在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-good">外來者角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span class="highlight-good">外來者在場）。</span>',
  firstNight: 7600,
  otherNight: 0,
  firstNightReminder: '展示那個外來者角色標記。指向被你標記“外來者”和“錯誤”的兩名玩家。',
  otherNightReminder: ''
};

export const Investigator: Role = {
  flavor: '每一個細微的線索，都指向潛藏的邪惡。爪牙的陰影在你的追蹤下無所遁形。',
  id: 'investigator',
  name: '調查員',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_investigator_townsfolk.png',
  ability: '在你的首個夜晚，你會得知兩名玩家和一個爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有爪牙在場）。',
  abilityHTML: '在你的首個夜晚，你會得知<span class="highlight-evil">兩名玩家和一個</span><span class="highlight-evil">爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有</span><span class="highlight-evil">爪牙在場）。</span>',
  firstNight: 7700,
  otherNight: 0,
  firstNightReminder: '展示那個爪牙角色標記。指向被你標記“爪牙”和“錯誤”的兩名玩家。',
  otherNightReminder: ''
};

export const Chef: Role = {
  flavor: '爐火的溫度與廚房的氣味，讓你對周圍的邪惡有著敏銳的直覺。相鄰的黑暗，總會露出馬腳。',
  id: 'chef',
  name: '廚師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_chef_townsfolk.png',
  ability: '在你的首個夜晚，你會得知場上鄰座的邪惡玩家有多少對。',
  abilityHTML: '在你的首個夜晚，你會得知場上<span class="highlight-good">鄰座的</span><span class="highlight-evil">邪惡玩家有多少對。</span>',
  firstNight: 7800,
  otherNight: 0,
  firstNightReminder: '給他展示數字手勢來告訴他場上鄰座邪惡玩家有多少對。',
  otherNightReminder: ''
};

export const Empath: Role = {
  flavor: '你的心跳能與周遭的靈魂共鳴。鄰座的邪惡氣息，是你在黑夜中揮之不去的夢魘。',
  id: 'empath',
  name: '共情者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_empath_townsfolk.png',
  ability: '每個夜晚，你會得知與你鄰近的兩名存活的玩家中邪惡玩家的數量。',
  abilityHTML: '每個夜晚，你會得知與你<span class="highlight-good">鄰近的兩名</span><span class="highlight-good">存活的玩家中</span><span class="highlight-evil">邪惡玩家的數量。</span>',
  firstNight: 7900,
  otherNight: 11000,
  firstNightReminder: '給他展示數字手勢來告訴他與他鄰近的存活玩家有幾人是邪惡的。',
  otherNightReminder: '給他展示數字手勢來告訴他與他鄰近的存活玩家有幾人是邪惡的。'
};

export const FortuneTeller: Role = {
  flavor: '星辰與水晶球映照出血紅的未來。你的占卜能準確地指出惡魔的所在，即便偶爾會被命運開個玩笑。',
  id: 'fortune_teller',
  name: '占卜師',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_fortune_teller_townsfolk.png',
  ability: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有惡魔。會有一名善良玩家始終被你的能力當作惡魔。',
  abilityHTML: '每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有<span class="highlight-evil">惡魔。會有一名</span><span class="highlight-good">善良玩家始終被你的能力當作</span><span class="highlight-evil">惡魔。</span>',
  firstNight: 8000,
  otherNight: 11100,
  firstNightReminder: '讓占卜師選擇兩名玩家。如果其中有惡魔或“干擾項”，點頭示意，否則搖頭。',
  otherNightReminder: '讓占卜師選擇兩名玩家。如果其中有惡魔或“干擾項”，點頭示意，否則搖頭。'
};

export const Undertaker: Role = {
  flavor: '死人不說謊。當鎮民將他們吊死，你負責為他們收屍，同時也揭開了他們生前最後的秘密。',
  id: 'undertaker',
  name: '送葬者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_undertaker_townsfolk.png',
  ability: '每個夜晚*，你會得知今天白天死於處決的玩家的角色。',
  abilityHTML: '每個夜晚*，你會得知今天<span class="highlight-evil">白天死於處決的玩家的角色。</span>',
  firstNight: 0,
  otherNight: 11300,
  firstNightReminder: '',
  otherNightReminder: '如果有玩家今天白天死於處決，喚醒送葬者並對他展示那名玩家的角色標記。'
};

export const Monk: Role = {
  flavor: '你的信仰與祈禱化作堅不可摧的護盾。今夜，你的庇護將讓惡魔的利爪無功而返。',
  id: 'monk',
  name: '僧侶',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_monk_townsfolk.png',
  ability: '每個夜晚*，你要選擇除你以外的一名玩家：當晚惡魔的負面能力對他無效。',
  abilityHTML: '每個夜晚*，你要選擇除你以外的一名玩家：當晚<span class="highlight-evil">惡魔的負面能力對他無效。</span>',
  firstNight: 0,
  otherNight: 2200,
  firstNightReminder: '',
  otherNightReminder: '讓僧侶選擇除自己外的一名玩家。標記那名玩家被保護。'
};

export const Ravenkeeper: Role = {
  flavor: '群鴉是你的眼線，死亡是你的代價。當你倒下的那一刻，真相將向你徹底敞開。',
  id: 'ravenkeeper',
  name: '守鴉人',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_ravenkeeper_townsfolk.png',
  ability: '如果你在夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會得知他的角色。',
  abilityHTML: '如果你在<span class="highlight-evil">夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會</span><span class="highlight-good">得知他的角色。</span>',
  firstNight: 0,
  otherNight: 9800,
  firstNightReminder: '',
  otherNightReminder: '如果守鴉人今晚死亡，喚醒他並讓他選擇一名玩家。對他展示那名玩家的角色標記。'
};

export const Virgin: Role = {
  flavor: '純潔是你的武器，也是致命的陷阱。那些敢於質疑你的人，必將遭到公開的制裁。',
  id: 'virgin',
  name: '貞潔者',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_virgin_townsfolk.png',
  ability: '當你首次被提名時，如果提名你的玩家是鎮民，他立刻被處決。',
  abilityHTML: '當你<span class="highlight-evil">首次被提名時，如果提名你的玩家是</span><span class="highlight-good">鎮民，他立刻被</span><span class="highlight-evil">處決。</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Slayer: Role = {
  flavor: '你的槍管裡只剩下一發子彈，但這就夠了。等待時機，給予惡魔致命的一擊吧。',
  id: 'slayer',
  name: '獵手',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_slayer_townsfolk.png',
  ability: '一局遊戲僅限一次。在白天任意時間，你可以選擇公開對場上存活的任意一名玩家發動技能；如果該名玩家為惡魔，則該玩家死亡；否則無事發生。',
  abilityHTML: '<span class="highlight-good">一局遊戲僅限一次。</span>在白天任意時間，你可以選擇公開對場上存活的任意一名玩家發動技能；如果該名玩家為<span class="highlight-evil">惡魔</span>，則該玩家<span class="highlight-evil">死亡</span>；否則無事發生。',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Soldier: Role = {
  flavor: '身經百戰的你，有著無法被撼動的意志。惡魔的爪牙在你面前，不過是徒勞的掙扎。',
  id: 'soldier',
  name: '士兵',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_soldier_townsfolk.png',
  ability: '惡魔的負面能力對你無效。',
  abilityHTML: '<span class="highlight-evil">惡魔的負面能力對你無效。</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Mayor: Role = {
  flavor: '你掌握著這座城鎮的權力。當末日降臨，只要你還活著，善良陣營就仍有一絲希望。',
  id: 'mayor',
  name: '鎮長',
  alignment: 'good',
  type: 'townsfolk',
  icon: '/character/character_mayor_townsfolk.png',
  ability: '如果只有三名玩家存活且白天没有人被處决，你的陣營獲勝。如果你在夜晚即將死亡，可能會有一名其他玩家代替你死亡。',
  abilityHTML: '如果只有<span class="highlight-good">三名玩家存活</span>且白天<span class="highlight-good">没有人被處决，你的陣營獲勝</span>。如果你在夜晚即將<span class="highlight-evil">死亡</span>，可能會有一名其他玩家<span class="highlight-evil">代替你死亡</span>。',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};
