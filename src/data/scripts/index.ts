import type { Script } from '../types';
import { TroubleBrewing } from './trouble_brewing';

export const AllScripts: Record<string, Script> = {
  trouble_brewing: TroubleBrewing
};

export * from './trouble_brewing';
