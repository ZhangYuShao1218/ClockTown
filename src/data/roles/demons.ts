import type { Role } from '../types';

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
