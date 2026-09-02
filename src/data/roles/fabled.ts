import type { Role } from '../types';

// ================= 傳奇 (fabled) — 19 個 =================
export const Fabled: Record<string, Role> = {
  'angel': { id: 'angel', name: '天使', alignment: 'good', type: 'fabled', icon: '/character/character_angel_fabled.png', ability: '對新玩家的死亡負最大責任的人，可能會遭遇一些不好的事情。', flavor: '你的羽翼帶來了恩典。新手將在你的庇護下，免受第一夜的殘酷侵擾。' },
  'bootlegger': { id: 'bootlegger', name: '私貨商人', alignment: 'good', type: 'fabled', icon: '/character/character_bootlegger_fabled.png', ability: '這個劇本包含有自制角色或自制規則。' },
  'buddhist': { id: 'buddhist', name: '佛陀', alignment: 'good', type: 'fabled', icon: '/character/character_buddhist_fabled.png', ability: '每個白天的前兩分鐘，老玩家不能發言。' },
  'deus_ex_fiasco2': { id: 'deus_ex_fiasco2', name: '強權上帝', alignment: 'good', type: 'fabled', icon: '/character/character_deus_ex_fiasco2_fabled.png', ability: '上帝在本場遊戲就是規則的主宰，但是一旦宣佈了特殊規則就必須遵守，否則可能會被玩家群毆。' },
  'deusexfiasco': { id: 'deusexfiasco', name: '失敗的上帝', alignment: 'good', type: 'fabled', icon: '/character/character_deusexfiasco_fabled.png', ability: '每局遊戲限一次，說書人可能會犯一個"錯誤"但會將其糾正，並公開承認自己曾處理有誤' },
  'djinn': { id: 'djinn', name: '燈神', alignment: 'good', type: 'fabled', icon: '/character/character_djinn_fabled.png', ability: '使用燈神的相剋規則。所有玩家都會知道其內容。' },
  'doomsayer': { id: 'doomsayer', name: '末日預言者', alignment: 'good', type: 'fabled', icon: '/character/character_doomsayer_fabled.png', ability: '如果大於等於四名玩家存活，每名當前存活的玩家可以公開要求你殺死一名與他陣營相同的玩家（每名玩家限一次）' },
  'duchess': { id: 'duchess', name: '公爵夫人', alignment: 'good', type: 'fabled', icon: '/character/character_duchess_fabled.png', ability: '每個白天，三名玩家可以一起拜訪你。當晚*他們會得知他們之中有幾個是邪惡的，但其中一人的資訊是錯的。', reminders: ['提名1', '提名2', '提名3'] },
  'ferryman': { id: 'ferryman', name: '擺渡人', alignment: 'good', type: 'fabled', icon: '/character/character_ferryman_fabled.png', ability: '在遊戲的最後一天所有已死亡玩家會重新獲得投票標記。' },
  'fibbin': { id: 'fibbin', name: '騙人精', alignment: 'good', type: 'fabled', icon: '/character/character_fibbin_fabled.png', ability: '每局遊戲限一次，一名善良玩家可能會得知"有問題"的資訊。', reminders: ['已使用'] },
  'fiddler': { id: 'fiddler', name: '小提琴手', alignment: 'good', type: 'fabled', icon: '/character/character_fiddler_fabled.png', ability: '每局遊戲限一次，惡魔可以秘密選擇一名對立陣營的玩家，所有玩家要表決：這兩名玩家中誰的陣營獲勝。（平局邪惡陣營獲勝)', reminders: ['已使用'] },
  'gardener': { id: 'gardener', name: '園丁', alignment: 'good', type: 'fabled', icon: '/character/character_gardener_fabled.png', ability: '由說書人來為一名或更多玩家派發角色。', reminders: ['已使用'] },
  'hells_librarian': { id: 'hells_librarian', name: '地獄藏書員', alignment: 'good', type: 'fabled', icon: '/character/character_hells_librarian_fabled.png', ability: '當說書人宣佈安靜時，仍在說話的玩家可能會遭遇一些不好的事情。', reminders: ['錯誤資訊'] },
  'qilin': { id: 'qilin', name: '麒麟', alignment: 'good', type: 'fabled', icon: '/character/character_qilin_fabled.png', ability: '在遊戲的最後一天，最幸運的玩家身上會發生一些好的事情。' },
  'revolutionary': { id: 'revolutionary', name: '革命者', alignment: 'good', type: 'fabled', icon: '/character/character_revolutionary_fabled.png', ability: '公開聲明—對鄰座玩家本局遊戲一直保持同一陣營。每局遊戲限一次，他們中的一人可能被當作其他的角色/陣營。', reminders: ['知道'] },
  'sentinel': { id: 'sentinel', name: '哨兵', alignment: 'good', type: 'fabled', icon: '/character/character_sentinel_fabled.png', ability: '在初始設定時，可能會額外增加或減少一個外來者。' },
  'spirit_of_ivory': { id: 'spirit_of_ivory', name: '聖潔之魂', alignment: 'good', type: 'fabled', icon: '/character/character_spirit_of_ivory_fabled.png', ability: '遊戲過程中邪惡玩家的總數最多能比初始設定多一名。' },
  'stormcatcher': { id: 'stormcatcher', name: '暴風捕手', alignment: 'good', type: 'fabled', icon: '/character/character_stormcatcher_fabled.png', ability: '遊戲開始時，你要宣佈一個善良角色。如果該角色在場，他只能死於處決，但所有邪惡玩家會在首個夜晚得知他是哪—名玩家。', reminders: ['改名'] },
  'toymaker': { id: 'toymaker', name: '玩具匠', alignment: 'good', type: 'fabled', icon: '/character/character_toymaker_fabled.png', ability: '惡魔可以在夜晚選擇放棄攻擊（每局遊戲至少一次)。邪惡玩家照常獲取初始資訊' },
};
