import type { Role } from '../types';
import { Townsfolk } from './townsfolk';
import { Outsiders } from './outsiders';
import { Minions } from './minions';
import { Demons } from './demons';
import { Travelers } from './travelers';
import { Fabled } from './fabled';
import { Loric } from './loric';

/**
 * 全部角色。每個 type 一個檔案，夜晚順序權重統一採用全域整數。
 */
export const AllRoles: Record<string, Role> = {
  ...Townsfolk,
  ...Outsiders,
  ...Minions,
  ...Demons,
  ...Travelers,
  ...Fabled,
  ...Loric,
};

export { Townsfolk, Outsiders, Minions, Demons, Travelers, Fabled, Loric };
