import type { Role } from '../types';

// ================= Travelers (旅行者) =================
export const Scapegoat: Role = {
  id: 'scapegoat',
  name: '替罪羊',
  alignment: 'good',
  type: 'traveler',
  ability: '如果與你同陣營的玩家被處決，你可能會代替他被處決。',
  flavor: '沒事的，就怪在我頭上吧。這又不是第一次了。',
  icon: '/character/character_scapegoat_traveler.png',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: ''
};
