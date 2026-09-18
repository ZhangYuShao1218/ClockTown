import type { Script } from '../types';
import { AllRoles } from '../roles';

export const DuXianManYan: Script = {
  id: 'du_xian_man_yan',
  name: '毒線蔓延 Extension Cord',
  description: `鐘樓劇本博物館收錄（第188期，2024-03-09）。劇本作者：Viva La Sam。海外推薦劇本，以調查員、小精靈、共情者等鎮民資訊網絡對抗投毒者與提線木偶交織的毒線，惡魔諾-達鯴讓中毒與失能環環相扣，適合喜歡資訊推理與陣營猜忌的隊伍。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "Viva La Sam",
  roles: [
    // 鎮民 13
    AllRoles['investigator'],
    AllRoles['pixie'],
    AllRoles['empath'],
    AllRoles['dreamer'],
    AllRoles['mathematician'],
    AllRoles['oracle'],
    AllRoles['monk'],
    AllRoles['artist'],
    AllRoles['fisherman'],
    AllRoles['huntsman'],
    AllRoles['soldier'],
    AllRoles['ravenkeeper'],
    AllRoles['cannibal'],
    // 外來者 5
    AllRoles['puzzlemaster'],
    AllRoles['recluse'],
    AllRoles['mutant'],
    AllRoles['damsel'],
    AllRoles['barber'],
    // 爪牙 5
    AllRoles['poisoner'],
    AllRoles['spy'],
    AllRoles['scarlet_woman'],
    AllRoles['boomdandy'],
    AllRoles['marionette'],
    // 惡魔 1
    AllRoles['no_dashii'],
    // 旅行者 5
    AllRoles['bishop'],
    AllRoles['bone_collector'],
    AllRoles['bureaucrat'],
    AllRoles['butcher'],
    AllRoles['matron'],
    // 傳奇 2
    AllRoles['sentinel'],
    AllRoles['djinn'],
  ]
};
