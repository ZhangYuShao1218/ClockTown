import type { Script } from '../types';
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

export const AllScripts: Record<string, Script> = {
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
  xiao_zhang_ba_hu: XiaoZhangBaHu
};

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
