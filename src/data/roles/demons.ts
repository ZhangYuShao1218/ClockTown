import type { Role } from '../types';

// ================= Demon (惡魔) =================
export const Imp: Role = {
  flavor: '你是黑鍾鎮隱藏的邪惡存在，一段被遺忘的過去。人們是如此稱呼你：小惡魔。',
  id: 'imp',
  name: '小惡魔',
  alignment: 'evil',
  type: 'demon',
  icon: '/character/character_imp_demon.png',
  ability: '每個夜晚*，你要選擇一名玩家：他死亡。如果你以這種方式自殺，一名爪牙會變成小惡魔。',
  abilityHTML: '每個夜晚*，你要選擇一名玩家：他<span class="highlight-evil">死亡。如果你以這種方式自殺，一名</span><span class="highlight-evil">爪牙會變成</span><span class="highlight-evil">小惡魔。</span>',
  firstNight: 0,
  otherNight: 4900,
  firstNightReminder: '',
  otherNightReminder: '讓小惡魔選擇一名玩家。標記那名玩家死亡。如果小惡魔選擇了自己：用一個備用的小惡魔標記替換一個存活的爪牙角色標記。讓原來的小惡魔重新入睡。喚醒新的小惡魔。對他展示“你是”信息標記，和小惡魔角色標記。'
};

export const Sentinel: Role = {
  flavor: '你守護著這座城鎮的邊緣。外來者的數量在你眼中，不再是個謎團。',
  id: 'sentinel',
  name: '哨兵',
  alignment: 'good',
  type: 'fabled',
  icon: '/character/character_sentinel_fabled.png',
  ability: '外來者數量可能 +1 或 -1',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};

export const Angel: Role = {
  flavor: '你的羽翼帶來了恩典。新手將在你的庇護下，免受第一夜的殘酷侵擾。',
  id: 'angel',
  name: '天使',
  alignment: 'good',
  type: 'fabled',
  icon: '/character/character_angel_fabled.png',
  ability: '對新玩家的死亡負最大責任的人，可能會遭遇一些不好的事情。',
  firstNight: 2,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};
