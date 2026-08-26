import type { Role } from '../types';
import * as townsfolk from './townsfolk';
import * as outsiders from './outsiders';
import * as minions from './minions';
import * as demons from './demons';
import * as travelers from './travelers';

export const AllRoles: Record<string, Role> = {
  washerwoman: townsfolk.Washerwoman,
  librarian: townsfolk.Librarian,
  investigator: townsfolk.Investigator,
  chef: townsfolk.Chef,
  empath: townsfolk.Empath,
  fortune_teller: townsfolk.FortuneTeller,
  undertaker: townsfolk.Undertaker,
  monk: townsfolk.Monk,
  ravenkeeper: townsfolk.Ravenkeeper,
  virgin: townsfolk.Virgin,
  slayer: townsfolk.Slayer,
  soldier: townsfolk.Soldier,
  mayor: townsfolk.Mayor,
  butler: outsiders.Butler,
  drunk: outsiders.Drunk,
  recluse: outsiders.Recluse,
  saint: outsiders.Saint,
  poisoner: minions.Poisoner,
  spy: minions.Spy,
  scarlet_woman: minions.ScarletWoman,
  baron: minions.Baron,
  imp: demons.Imp,
  scapegoat: travelers.Scapegoat,
  sentinel: demons.Sentinel,
  angel: demons.Angel
};
