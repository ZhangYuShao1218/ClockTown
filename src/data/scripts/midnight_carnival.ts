import type { Script } from '../types';
import { AllRoles } from '../roles';

export const MidnightCarnival: Script = {
  id: 'midnight_carnival',
    name: '夜半狂歡 Midnight Carnival',
  description: `午夜嘉年華來到了小鎮，帶來了歡笑與奇觀。但當夜幕低垂，狂歡的背後卻隱藏著致命的殺機。這是一個充滿變數與混亂的劇本，適合喜歡挑戰極限的玩家。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  roles: [
    AllRoles['professor'],
    AllRoles['noble'],
    AllRoles['balloonist'],
    AllRoles['snake_charmer'],
    AllRoles['savant'],
    AllRoles['amnesiac'],
    AllRoles['engineer'],
    AllRoles['huntsman'],
    AllRoles['fisherman'],
    AllRoles['farmer'],
    AllRoles['poppy_grower'],
    AllRoles['cannibal'],
    AllRoles['atheist'],
    AllRoles['damsel'],
    AllRoles['drunk'],
    AllRoles['golem'],
    AllRoles['barber'],
    AllRoles['mezepheles'],
    AllRoles['poisoner'],
    AllRoles['pit-hag'],
    AllRoles['psychopath'],
    AllRoles['al-hadikhia'],
    AllRoles['vigormortis'],
    AllRoles['sentinel'],
    AllRoles['spirit_of_ivory'],
  ]
};
