import type { Script } from '../types';
import { AllRoles } from '../roles';

export const StringsPulling: Script = {
  id: 'strings_pulling',
  name: '幕後操控 Strings Pulling',
  description: `靈感來源：《暗流湧動》。一套以經典 TB 角色為骨架的重製劇本，保留了新手友善的資訊結構，同時把提線木偶、紅唇女郎等機制加入邪惡陣營，讓善良阵營在熟悉的角色池裡遭遇全新的謎題。`,
  recommendedPlayers: "7 - 15",
  difficulty: "初學者",
  author: "Ben Burns",
  roles: [
    AllRoles['washerwoman'],
    AllRoles['librarian'],
    AllRoles['investigator'],
    AllRoles['chef'],
    AllRoles['empath'],
    AllRoles['fortune_teller'],
    AllRoles['undertaker'],
    AllRoles['monk'],
    AllRoles['ravenkeeper'],
    AllRoles['virgin'],
    AllRoles['slayer'],
    AllRoles['soldier'],
    AllRoles['mayor'],
    AllRoles['butler'],
    AllRoles['drunk'],
    AllRoles['recluse'],
    AllRoles['saint'],
    AllRoles['poisoner'],
    AllRoles['baron'],
    AllRoles['spy'],
    AllRoles['scarlet_woman'],
    AllRoles['marionette'],
    AllRoles['imp'],
  ]
};
