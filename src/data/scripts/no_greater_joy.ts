import type { Script } from '../types';
import { AllRoles } from '../roles';

export const NoGreaterJoy: Script = {
  id: 'no_greater_joy',
    name: '無上愉悅 No Greater Joy',
  description: '我把這個劇本推薦給剛剛接觸本遊戲的新人玩家，在推新的意義上來說，無上愉悅無疑是非常合適並且有趣的，並且玩家不會因為這樣那樣的原因在稀裡糊塗中度過自己不知道自己在幹什麼的第一句遊戲，相信我，這非常重要。事實上，在新人和老人一起遊玩時，Steven更傾向於開一些暗流湧動之外的劇本。只是在純粹新人的情況下，才使用暗流湧動。',
  roles: [
    AllRoles['investigator'],
    AllRoles['empath'],
    AllRoles['chambermaid'],
    AllRoles['clockmaker'],
    AllRoles['artist'],
    AllRoles['sage'],
    AllRoles['drunk'],
    AllRoles['klutz'],
    AllRoles['scarlet_woman'],
    AllRoles['baron'],
    AllRoles['imp'],
  ]
};
