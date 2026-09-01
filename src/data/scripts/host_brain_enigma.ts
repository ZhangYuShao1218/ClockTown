import type { Script } from '../types';
import { AllRoles } from '../roles';

export const HostBrainEnigma: Script = {
  id: 'host_brain_enigma',
    name: '宿腦謎團 Host Brain Enigma',
  description: `宿腦謎團是一場燒腦的對決。在這個被未知力量支配的村莊裡，每個人都可能是被精神控制的傀儡。玩家需要仔細梳理錯綜複雜的邏輯線，找出隱藏在幕後的主腦。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  roles: [
    AllRoles['20007_123'],
    AllRoles['20007_16'],
    AllRoles['20007_42'],
    AllRoles['20007_75'],
    AllRoles['20007_12'],
    AllRoles['20007_61'],
    AllRoles['20007_8'],
    AllRoles['20007_31'],
    AllRoles['20007_29'],
    AllRoles['20007_135'],
    AllRoles['20007_141'],
    AllRoles['20007_105'],
  ]
};
