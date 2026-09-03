import type { Script } from '../types';
import { AllRoles } from '../roles';

export const FengYaJi: Script = {
  id: 'feng_ya_ji',
  name: '風雅集 Feng Ya Ji',
  description: `鐘樓劇本博物館出品。劇本作者：蘇通染，美術設計：Lei & 摸魚。一套將東方風雅角色（店小二、郎中、悟道者、逆臣、變臉師）與麻脸巫婆世界的混亂惡魔（諾·達魽、混沌、渦流）交織在一起的縫合劇本，資訊與變數並重。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "蘇通染",
  roles: [
    AllRoles['shugenja'],
    AllRoles['librarian'],
    AllRoles['dianxiaoer'],
    AllRoles['empath'],
    AllRoles['langzhong'],
    AllRoles['fortune_teller'],
    AllRoles['undertaker'],
    AllRoles['monk'],
    AllRoles['savant'],
    AllRoles['bianlianshi'],
    AllRoles['artist'],
    AllRoles['wudaozhe'],
    AllRoles['ravenkeeper'],
    AllRoles['barber'],
    AllRoles['nichen'],
    AllRoles['hatter'],
    AllRoles['drunk'],
    AllRoles['cerenovus'],
    AllRoles['marionette'],
    AllRoles['witch'],
    AllRoles['scarlet_woman'],
    AllRoles['imp'],
    AllRoles['no_dashii'],
    AllRoles['hundun'],
    AllRoles['vortox'],
    AllRoles['spirit_of_ivory'],
  ]
};
