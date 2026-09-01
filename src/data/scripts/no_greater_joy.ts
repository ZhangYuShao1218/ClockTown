import type { Script } from '../types';
import { AllRoles } from '../roles';

export const NoGreaterJoy: Script = {
  id: 'no_greater_joy',
    name: '無上愉悅 No Greater Joy',
  description: `一個輕鬆愉快的村莊，洋溢著無上的歡愉。這裡的人們過著和平與快樂的日子。然而，即便是在最歡快的時刻，陰影中也可能潛藏著未知的危險。\n\n這是一個適合較少人數的劇本，考驗玩家在有限資訊與快速節奏下的判斷力。`,
  recommendedPlayers: "5 - 6",
  difficulty: "初學者",
  roles: [
    AllRoles['investigator'],
    AllRoles['empath'],
    AllRoles['chambermaid'],
    AllRoles['clockmaker'],
    AllRoles['artist'],
    AllRoles['sage'],
    AllRoles['drunk'],
    AllRoles['klutz'],
    AllRoles['scarlet_woman'],
    AllRoles['baron'],
    AllRoles['imp'],
  ]
};
