import type { Script } from '../types';
import { AllRoles } from '../roles';

export const TroubleBrewing: Script = {
  id: 'trouble_brewing',
    name: '暗流湧動 Trouble Brewing',
  description: `烏雲如鴉群般在天空翻騰，讓這個沉睡中小鎮的迷信居民們籠罩在不祥的陰影之中。洗好的衣服在屋外的細繩上詭異地起舞。\n\n奇怪的泡泡混著奇異的氣味從窗戶與門縫中飄散開來。不同尋常的暖風環繞著長滿常春藤的牆壁，向那些敢於行走在鵝卵石街道上的人們發出不祥的低語。\n\n當遠處的地平線上雷聲響起時，焦慮的母親們把玩耍中的孩子喚回家中。然而，如果你再仔細聆聽，仍然可以聽見近處森林裡的詭異回聲。遠處一座隱約可見的修道院裡，有人影在一道道門洞間穿行。\n\n只有那些讀懂跡象的人，才能明白，有什麼正在……\n\n暗流湧動。`,
  recommendedPlayers: "5 - 15",
  difficulty: "初學者",
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
