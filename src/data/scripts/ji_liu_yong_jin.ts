import type { Script } from '../types';
import { AllRoles } from '../roles';

export const JiLiuYongJin: Script = {
  id: 'ji_liu_yong_jin',
  name: '激流勇進 Over The River',
  description: `鐘樓劇本博物館收錄（第318期，2024-11-04），海外社區精選汀西維爾劇本。劇本作者：Andrew Nathenson。專為 5-6 人設計的小型劇本：祖母、鐘錶匠、舞蛇人、旅店老闆、教授與獵手聯手渡河，瘋子與陌客攪亂視線，教父與間諜護著小惡魔逆流而上。`,
  recommendedPlayers: "5 - 6",
  difficulty: "中等",
  author: "Andrew Nathenson",
  roles: [
    // 鎮民 6
    AllRoles['grandmother'],
    AllRoles['clockmaker'],
    AllRoles['innkeeper'],
    AllRoles['snake_charmer'],
    AllRoles['professor'],
    AllRoles['slayer'],
    // 外來者 2
    AllRoles['lunatic'],
    AllRoles['recluse'],
    // 爪牙 2
    AllRoles['godfather'],
    AllRoles['spy'],
    // 惡魔 1
    AllRoles['imp'],
  ]
};
