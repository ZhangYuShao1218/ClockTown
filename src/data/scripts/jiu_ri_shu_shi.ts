import type { Script } from '../types';
import { AllRoles } from '../roles';

export const JiuRiShuShi: Script = {
  id: 'jiu_ri_shu_shi',
  name: '舊日熟識 Jiu Ri Shu Shi',
  description: `鐘樓劇本博物館收錄（第239期，2024-07-30），2024 天津血染鐘樓城市賽（第五屆）專用劇本。劇本作者：老許 & 王鑫。以暗流湧動的鎮民與外來者為班底，搭配祖母、賭徒、女裁縫、賣花女孩等熟悉面孔；邪惡方由投毒者、教父、紅唇女郎、刺客輔佐小惡魔、渦流、方古三位惡魔——都是老朋友，卻也最難看透。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "老許 & 王鑫",
  roles: [
    // 鎮民 13
    AllRoles['chef'],
    AllRoles['librarian'],
    AllRoles['investigator'],
    AllRoles['grandmother'],
    AllRoles['empath'],
    AllRoles['oracle'],
    AllRoles['flowergirl'],
    AllRoles['monk'],
    AllRoles['gambler'],
    AllRoles['slayer'],
    AllRoles['seamstress'],
    AllRoles['soldier'],
    AllRoles['ravenkeeper'],
    // 外來者 4
    AllRoles['drunk'],
    AllRoles['barber'],
    AllRoles['klutz'],
    AllRoles['recluse'],
    // 爪牙 4
    AllRoles['poisoner'],
    AllRoles['godfather'],
    AllRoles['scarlet_woman'],
    AllRoles['assassin'],
    // 惡魔 3
    AllRoles['imp'],
    AllRoles['vortox'],
    AllRoles['fang_gu'],
  ]
};
