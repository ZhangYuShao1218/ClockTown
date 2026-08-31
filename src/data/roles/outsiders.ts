import type { Role } from '../types';

// ================= Outsiders (外來者) =================
export const Butler: Role = {
  flavor: '你習慣了服從與跟隨。主人的意志就是你的意志，即便在生死的投票面前也是如此。',
  id: 'butler',
  name: '管家',
  alignment: 'good',
  type: 'outsider',
  icon: '/character/character_butler_outsider.png',
  ability: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有他投票時你才能投票。',
  abilityHTML: '每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有<span class="highlight-good">他投票時你才能投票。</span>',
  firstNight: 8100,
  otherNight: 11200,
  firstNightReminder: '讓管家選擇一名玩家。標記那名玩家為他的主人。',
  otherNightReminder: '讓管家選擇一名玩家。標記那名玩家為他的主人。'
};

export const Drunk: Role = {
  flavor: '一杯接一杯，世界在你眼中扭曲變形。你以為自己是英雄，但你只是個一無所知的醉漢。',
  id: 'drunk',
  name: '酒鬼',
  alignment: 'good',
  type: 'outsider',
  icon: '/character/character_drunk_outsider.png',
  ability: '你不知道你是酒鬼。你以為你是一個鎮民角色，但其實你不是。',
  abilityHTML: '你不知道你是酒鬼。你以為你是一個<span class="highlight-good">鎮民角色，但其實你不是。</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Recluse: Role = {
  flavor: '你選擇遠離人群，卻被當作黑暗的同黨。即使你心向光明，靈魂卻始終散發著邪惡的氣息。',
  id: 'recluse',
  name: '陌客',
  alignment: 'good',
  type: 'outsider',
  icon: '/character/character_recluse_outsider.png',
  ability: '你可能會被當作邪惡陣營、爪牙角色或惡魔角色，即使你已死亡。',
  abilityHTML: '你可能會被當作<span class="highlight-evil">邪惡陣營、</span><span class="highlight-evil">爪牙角色或</span><span class="highlight-evil">惡魔角色，即使你已</span><span class="highlight-evil">死亡。</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Saint: Role = {
  flavor: '他們將你視作聖人，然而這卻是悲劇的開始。如果你被處決，整個城鎮將為你的死陪葬。',
  id: 'saint',
  name: '聖徒',
  alignment: 'good',
  type: 'outsider',
  icon: '/character/character_saint_outsider.png',
  ability: '如果你死於處決，你的陣營落敗。',
  abilityHTML: '如果你死於處決，你的陣營<span class="highlight-evil">落敗。</span>',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

