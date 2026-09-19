import type { Script } from '../types';
import { applyRoleOverrides } from '../../lib/scriptRules';
import { TroubleBrewing } from './trouble_brewing';
import { BadMoonRising } from './bad_moon_rising';
import { SectsAndViolets } from './sects_and_violets';
import { NoGreaterJoy } from './no_greater_joy';
import { Whispers } from './whispers';
import { HostBrainEnigma } from './host_brain_enigma';
import { MidnightCarnival } from './midnight_carnival';
import { StringsPulling } from './strings_pulling';
import { FengYaJi } from './feng_ya_ji';
import { GuiZeGuaiTan } from './gui_ze_guai_tan';
import { XiaoZhangBaHu } from './xiao_zhang_ba_hu';
import { WuXingDaChu } from './wu_xing_da_chu';
import { DuXianManYan } from './du_xian_man_yan';
import { QiangDengYouXi } from './qiang_deng_you_xi';
import { MiYingXunZong } from './mi_ying_xun_zong';
import { WuYeLieChe } from './wu_ye_lie_che';
import { XunWuQiLv } from './xun_wu_qi_lv';
import { WangHaiMiYuan } from './wang_hai_mi_yuan';

const RawScripts: Record<string, Script> = {
  trouble_brewing: TroubleBrewing,
  bad_moon_rising: BadMoonRising,
  sects_and_violets: SectsAndViolets,
  no_greater_joy: NoGreaterJoy,
  whispers: Whispers,
  host_brain_enigma: HostBrainEnigma,
  midnight_carnival: MidnightCarnival,
  strings_pulling: StringsPulling,
  feng_ya_ji: FengYaJi,
  gui_ze_guai_tan: GuiZeGuaiTan,
  xiao_zhang_ba_hu: XiaoZhangBaHu,
  wu_xing_da_chu: WuXingDaChu,
  du_xian_man_yan: DuXianManYan,
  qiang_deng_you_xi: QiangDengYouXi,
  mi_ying_xun_zong: MiYingXunZong,
  wu_ye_lie_che: WuYeLieChe,
  xun_wu_qi_lv: XunWuQiLv,
  wang_hai_mi_yuan: WangHaiMiYuan
};

/** 對外一律使用此份：已套用各劇本 roleOverrides 的角色能力覆寫 */
export const AllScripts: Record<string, Script> = Object.fromEntries(
  Object.entries(RawScripts).map(([id, script]) => [id, applyRoleOverrides(script)])
);

export * from './trouble_brewing';
export * from './bad_moon_rising';
export * from './sects_and_violets';
export * from './no_greater_joy';
export * from './whispers';
export * from './host_brain_enigma';
export * from './midnight_carnival';
export * from './strings_pulling';
export * from './feng_ya_ji';
export * from './gui_ze_guai_tan';
export * from './xiao_zhang_ba_hu';
export * from './wu_xing_da_chu';
export * from './du_xian_man_yan';
export * from './qiang_deng_you_xi';
export * from './mi_ying_xun_zong';
export * from './wu_ye_lie_che';
export * from './xun_wu_qi_lv';
export * from './wang_hai_mi_yuan';
