import type { Role } from '../types';

// ================= Minions (爪牙) =================
export const Poisoner: Role = {
  flavor: '幾滴無色無味的毒藥，就能讓最聰明的人陷入瘋狂。今夜，你又要讓誰的感官錯亂呢？',
  id: 'poisoner',
  name: '投毒者',
  alignment: 'evil',
  type: 'minion',
  icon: '/character/character_poisoner_minion.png',
  ability: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天中毒。',
  abilityHTML: '每個夜晚，你要選擇一名玩家：他在當晚和明天白天<span class="highlight-evil">中毒。</span>',
  firstNight: 4600,
  otherNight: 1400,
  firstNightReminder: '讓投毒者選擇一名玩家。標記那名玩家中毒。',
  otherNightReminder: '讓投毒者選擇一名玩家。標記那名玩家中毒。'
};

export const Spy: Role = {
  flavor: '你潛伏在光明之中，翻閱著魔法書的每一頁。沒有任何秘密能逃過你的雙眼。',
  id: 'spy',
  name: '間諜',
  alignment: 'evil',
  type: 'minion',
  icon: '/character/character_spy_minion.png',
  ability: '每個夜晚，你能查看魔典。你可能會被當作善良陣營、鎮民角色或外來者角色，即使你已死亡。',
  abilityHTML: '每個夜晚，你能查看魔典。你可能會被當作<span class="highlight-good">善良陣營、</span><span class="highlight-good">鎮民角色或</span><span class="highlight-good">外來者角色，即使你已</span><span class="highlight-evil">死亡。</span>',
  firstNight: 11700,
  otherNight: 14400,
  firstNightReminder: '將魔典展示給間諜，他想看多久就看多久。',
  otherNightReminder: '將魔典展示給間諜，他想看多久就看多久。'
};

export const ScarletWoman: Role = {
  flavor: '你是暗影中的繼承者。當王座崩塌，你將披上血色的長袍，成為新的夢魘。',
  id: 'scarlet_woman',
  name: '紅唇女郎',
  alignment: 'evil',
  type: 'minion',
  icon: '/character/character_scarlet_woman_minion.png',
  ability: '如果大於等於五名玩家存活時（旅行者不計算在內）惡魔死亡，你變成那個惡魔。',
  abilityHTML: '如果大於等於五名玩家<span class="highlight-good">存活時（旅行者不計算在內）</span><span class="highlight-evil">惡魔死亡，你變成那個</span><span class="highlight-evil">惡魔。</span>',
  firstNight: 0,
  otherNight: 3700,
  firstNightReminder: '',
  otherNightReminder: '如果紅唇女郎今天變成了小惡魔，對她展示“你是”信息標記，和小惡魔角色標記。'
};

export const Baron: Role = {
  flavor: '你的詭計讓鎮上的秩序陷入混亂。更多的外人，意味著更多的猜忌與不安。',
  id: 'baron',
  name: '男爵',
  alignment: 'evil',
  type: 'minion',
  icon: '/character/character_baron_minion.png',
  ability: '會有額外的外來者在場。[+2外來者]',
  abilityHTML: '會有額外的外來者在場。<span class="highlight-good">[+2外來者]</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

