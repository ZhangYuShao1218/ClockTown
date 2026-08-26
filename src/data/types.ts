export type Alignment = 'good' | 'evil';
export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled';

export interface Role {
  id: string;
  name: string;
  alignment: Alignment;
  type: RoleType;
  ability: string;
  image?: string;
  icon?: string;
  description?: string;
  abilityHTML?: string;
  flavor?: string;
}

export interface NightOrderItem {
  id: string;
  name: string;
  type: RoleType | 'info';
}

export interface Script {
  id: string;
  name: string;
  description: string;
  roles: Role[];
  firstNight: NightOrderItem[];
  otherNight: NightOrderItem[];
}
