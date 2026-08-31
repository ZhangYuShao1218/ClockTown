import type { Script } from '../types';
import { AllRoles } from '../roles';

export const TroubleBrewing: Script = {
  id: 'trouble_brewing',
    name: '暗流湧動 Trouble Brewing',
  description: '《暗流湧動》是《血染鐘樓》的基礎劇本，最適合新手入門。包含直觀的技能、基礎的邏輯推演與簡單的謊言，帶你進入鐘樓鎮的神秘世界。',
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
    AllRoles['spy'],
    AllRoles['scarlet_woman'],
    AllRoles['baron'],
    AllRoles['imp'],
    AllRoles['scapegoat']
  ]
};
