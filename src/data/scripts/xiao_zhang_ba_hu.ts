import type { Script } from '../types';
import { AllRoles } from '../roles';

export const XiaoZhangBaHu: Script = {
  id: 'xiao_zhang_ba_hu',
  name: '囂張跋扈 Xiao Zhang Ba Hu',
  description: `鐘樓劇本博物館出品（v2.0.0）。靈感來源：《橫行霸道》。劇本作者：劉中奇。小人數高張力劇本——魔鬼代言人、精神病患者、炸彈人三爪牙搭配痸蛭與小惡魔，善良阵營要在極少的夜晚裡搶在爆炸與連鎖死亡前定位邪惡。`,
  recommendedPlayers: "7 - 9",
  difficulty: "進階",
  author: "劉中奇",
  roles: [
    AllRoles['alchemist'],
    AllRoles['pixie'],
    AllRoles['sailor'],
    AllRoles['fortune_teller'],
    AllRoles['high_priestess'],
    AllRoles['snake_charmer'],
    AllRoles['savant'],
    AllRoles['fisherman'],
    AllRoles['tea_lady'],
    AllRoles['cannibal'],
    AllRoles['damsel'],
    AllRoles['zealot'],
    AllRoles['devils_advocate'],
    AllRoles['psychopath'],
    AllRoles['boomdandy'],
    AllRoles['lleech'],
    AllRoles['imp'],
    AllRoles['sentinel'],
  ]
};
