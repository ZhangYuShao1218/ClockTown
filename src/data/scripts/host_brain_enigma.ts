import type { Script } from '../types';
import { AllRoles } from '../roles';

export const HostBrainEnigma: Script = {
  id: 'host_brain_enigma',
  name: '宿腦謎團 Host Brain Enigma',
  description: `宿腦謎團是一場燒腦的對決。在這個被未知力量支配的村莊裡，每個人都可能是被精神控制的傀儡。玩家需要仔細梳理錯綜複雜的邏輯線，找出隱藏在幕後的主腦。`,
  recommendedPlayers: "5 - 6",
  difficulty: "進階",
  roles: [
    AllRoles['pixie'],
    AllRoles['undertaker'],
    AllRoles['exorcist'],
    AllRoles['fisherman'],
    AllRoles['slayer'],
    AllRoles['juggler'],
    AllRoles['drunk'],
    AllRoles['lunatic'],
    AllRoles['devils_advocate'],
    AllRoles['marionette'],
    AllRoles['lleech'],
    AllRoles['sentinel'],
  ]
};
