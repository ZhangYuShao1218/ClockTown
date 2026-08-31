import type { Script } from '../types';
import { TroubleBrewing } from './trouble_brewing';
import { BadMoonRising } from './bad_moon_rising';
import { NoGreaterJoy } from './no_greater_joy';
import { HostBrainEnigma } from './host_brain_enigma';
import { MidnightCarnival } from './midnight_carnival';

export const AllScripts: Record<string, Script> = {
  trouble_brewing: TroubleBrewing,
  bad_moon_rising: BadMoonRising,
  no_greater_joy: NoGreaterJoy,
  host_brain_enigma: HostBrainEnigma,
  midnight_carnival: MidnightCarnival
};

export * from './trouble_brewing';
export * from './bad_moon_rising';
export * from './no_greater_joy';
export * from './host_brain_enigma';
export * from './midnight_carnival';
