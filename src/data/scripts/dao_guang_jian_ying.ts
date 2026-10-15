import type { Script } from '../types';
import { AllRoles } from '../roles';

export const DaoGuangJianYing: Script = {
  id: 'dao_guang_jian_ying',
  name: '刀光劍影 Dao Guang Jian Ying',
  description: `鐘樓劇本博物館收錄（第277期，2024-09-19），SUI 染鐘樓社區玩家投稿。劇本作者：長湴。修行者、貴族、築夢師、氣球駕駛員等資訊角色交織成網，哲學家與失憶者增添變數；邪惡方以教父、女巫、紅唇女郎、鷹身女妖壓迫鎮民，四惡魔亡骨魔、普卡、諾-達鯴、小怪寶各具殺機，刀光劍影間步步驚心。`,
  recommendedPlayers: "7 - 15",
  difficulty: "進階",
  author: "長湴",
  roles: [
    // 鎮民 13
    AllRoles['shugenja'],
    AllRoles['noble'],
    AllRoles['preacher'],
    AllRoles['dreamer'],
    AllRoles['mathematician'],
    AllRoles['balloonist'],
    AllRoles['flowergirl'],
    AllRoles['savant'],
    AllRoles['philosopher'],
    AllRoles['seamstress'],
    AllRoles['ravenkeeper'],
    AllRoles['amnesiac'],
    AllRoles['cannibal'],
    // 外來者 4
    AllRoles['goon'],
    AllRoles['drunk'],
    AllRoles['sweetheart'],
    AllRoles['plague_doctor'],
    // 爪牙 4
    AllRoles['godfather'],
    AllRoles['witch'],
    AllRoles['scarlet_woman'],
    AllRoles['harpy'],
    // 惡魔 4
    AllRoles['vigormortis'],
    AllRoles['pukka'],
    AllRoles['no_dashii'],
    AllRoles['lil_monsta'],
    // 傳奇 1
    AllRoles['djinn'],
  ]
};
