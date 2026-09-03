import type { Script } from '../types';
import { AllRoles } from '../roles';

export const Whispers: Script = {
  id: 'whispers',
  name: '竊竊私語 Whispers',
  description: `一個 5 到 6 人的小劇本，推薦給擅長邏輯、喜歡和平、積極探索可能性的玩家。值得一提的是，此劇本對說書人的要求極高：漁夫、博學者、失憶者這類高自由度的角色能力，非常考驗說書人對平衡性的把控。`,
  recommendedPlayers: "5 - 6",
  difficulty: "進階",
  roles: [
    AllRoles['savant'],
    AllRoles['artist'],
    AllRoles['balloonist'],
    AllRoles['amnesiac'],
    AllRoles['fisherman'],
    AllRoles['cannibal'],
    AllRoles['lunatic'],
    AllRoles['mutant'],
    AllRoles['widow'],
    AllRoles['goblin'],
    AllRoles['leviathan'],
  ]
};
