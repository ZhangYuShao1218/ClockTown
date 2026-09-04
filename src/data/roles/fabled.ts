import type { Role } from '../types';

// ================= 傳奇 (fabled) — 19 個 =================
export const Fabled: Record<string, Role> = {
  'angel': { id: 'angel', name: '天使', alignment: 'good', type: 'fabled', icon: '/character/character_angel_fabled.png', ability: '對新玩家的死亡負最大責任的人，可能會遭遇一些不好的事情。', flavor: '你的羽翼帶來了恩典。新手將在你的庇護下，免受第一夜的殘酷侵擾。' },
  'bootlegger': { id: 'bootlegger', name: '私貨商人', alignment: 'good', type: 'fabled', icon: '/character/character_bootlegger_fabled.png', flavor: '這座鐘鎮流通著私釀的規則與角色。有些東西，不在正典之內。', ability: '這個劇本包含有自制角色或自制規則。' },
  'buddhist': { id: 'buddhist', name: '佛陀', alignment: 'good', type: 'fabled', icon: '/character/character_buddhist_fabled.png', flavor: '你以靜默渡人。每個白晝的頭兩分鐘，老練的舌頭必須噤聲。', ability: '每個白天的前兩分鐘，老玩家不能發言。' },
  'deus_ex_fiasco2': { id: 'deus_ex_fiasco2', name: '強權上帝', alignment: 'good', type: 'fabled', icon: '/character/character_deus_ex_fiasco2_fabled.png', flavor: '你是這一局的規則本身。但你一旦立下規矩，便得守住，否則眾怒難平。', ability: '上帝在本場遊戲就是規則的主宰，但是一旦宣佈了特殊規則就必須遵守，否則可能會被玩家群毆。' },
  'deusexfiasco': { id: 'deusexfiasco', name: '失敗的上帝', alignment: 'good', type: 'fabled', icon: '/character/character_deusexfiasco_fabled.png', flavor: '你也會犯錯。這一局，說書人或許失手一次，但終會公開認錯並更正。', ability: '每局遊戲限一次，說書人可能會犯一個"錯誤"但會將其糾正，並公開承認自己曾處理有誤' },
  'djinn': { id: 'djinn', name: '燈神', alignment: 'good', type: 'fabled', icon: '/character/character_djinn_fabled.png', flavor: '你自神燈中現身，宣讀專屬的相剋規則。其內容，眾人皆知。', ability: '使用燈神的相剋規則。所有玩家都會知道其內容。' },
  'doomsayer': { id: 'doomsayer', name: '末日預言者', alignment: 'good', type: 'fabled', icon: '/character/character_doomsayer_fabled.png', flavor: '你預告著集體的終局。只要還有四人以上，每個人都能喚你取走一名同陣營者的命。', ability: '如果大於等於四名玩家存活，每名當前存活的玩家可以公開要求你殺死一名與他陣營相同的玩家（每名玩家限一次）' },
  'duchess': { id: 'duchess', name: '公爵夫人', alignment: 'good', type: 'fabled', icon: '/character/character_duchess_fabled.png', ability: '每個白天，三名玩家可以一起拜訪你。當晚*他們會得知他們之中有幾個是邪惡的，但其中一人的資訊是錯的。', flavor: '你在府邸接待訪客。每個白晝三人一同拜謁，夜裡他們得知彼此的邪惡數目——其中一份是假的。', reminders: ['提名1', '提名2', '提名3'] },
  'ferryman': { id: 'ferryman', name: '擺渡人', alignment: 'good', type: 'fabled', icon: '/character/character_ferryman_fabled.png', flavor: '你載送亡魂渡過冥河。遊戲的最後一日，所有死者會重新握住投票標記。', ability: '在遊戲的最後一天所有已死亡玩家會重新獲得投票標記。' },
  'fibbin': { id: 'fibbin', name: '騙人精', alignment: 'good', type: 'fabled', icon: '/character/character_fibbin_fabled.png', ability: '每局遊戲限一次，一名善良玩家可能會得知"有問題"的資訊。', flavor: '你偶爾也撒個小謊。這一局，一名善人可能會收到一則「有問題」的訊息。', reminders: ['已使用'] },
  'fiddler': { id: 'fiddler', name: '小提琴手', alignment: 'good', type: 'fabled', icon: '/character/character_fiddler_fabled.png', ability: '每局遊戲限一次，惡魔可以秘密選擇一名對立陣營的玩家，所有玩家要表決：這兩名玩家中誰的陣營獲勝。（平局邪惡陣營獲勝)', flavor: '你以琴聲賭一場勝負。這一局惡魔可秘密挑一個對手，由眾人表決誰的陣營獲勝。', reminders: ['已使用'] },
  'gardener': { id: 'gardener', name: '園丁', alignment: 'good', type: 'fabled', icon: '/character/character_gardener_fabled.png', ability: '由說書人來為一名或更多玩家派發角色。', flavor: '你親手栽培每一株幼苗。這一局，一名或多名玩家的角色，由說書人為他們挑選。', reminders: ['已使用'] },
  'hells_librarian': { id: 'hells_librarian', name: '地獄藏書員', alignment: 'good', type: 'fabled', icon: '/character/character_hells_librarian_fabled.png', ability: '當說書人宣佈安靜時，仍在說話的玩家可能會遭遇一些不好的事情。', flavor: '你掌管沉默的禁區。當說書人喝令安靜，仍在出聲的人會遭遇不測。', reminders: ['錯誤資訊'] },
  'qilin': { id: 'qilin', name: '麒麟', alignment: 'good', type: 'fabled', icon: '/character/character_qilin_fabled.png', flavor: '你是祥瑞之獸。遊戲的最後一日，最幸運的那個人身上會降臨好事。', ability: '在遊戲的最後一天，最幸運的玩家身上會發生一些好的事情。' },
  'revolutionary': { id: 'revolutionary', name: '革命者', alignment: 'good', type: 'fabled', icon: '/character/character_revolutionary_fabled.png', ability: '公開聲明—對鄰座玩家本局遊戲一直保持同一陣營。每局遊戲限一次，他們中的一人可能被當作其他的角色/陣營。', flavor: '你煽動變革。你宣告兩名鄰座整局同陣營，而其中一人或許被眾人看成了別的模樣。', reminders: ['知道'] },
  'sentinel': { id: 'sentinel', name: '哨兵', alignment: 'good', type: 'fabled', icon: '/character/character_sentinel_fabled.png', flavor: '你在城門值守。開局的名冊上，外來者的數目或許會悄悄多一個、或少一個。', ability: '在初始設定時，可能會額外增加或減少一個外來者。' },
  'spirit_of_ivory': { id: 'spirit_of_ivory', name: '聖潔之魂', alignment: 'good', type: 'fabled', icon: '/character/character_spirit_of_ivory_fabled.png', flavor: '你守護著陣營的天平。整局之中，邪惡的人數至多比開局多出一名。', ability: '遊戲過程中邪惡玩家的總數最多能比初始設定多一名。' },
  'stormcatcher': { id: 'stormcatcher', name: '暴風捕手', alignment: 'good', type: 'fabled', icon: '/character/character_stormcatcher_fabled.png', ability: '遊戲開始時，你要宣佈一個善良角色。如果該角色在場，他只能死於處決，但所有邪惡玩家會在首個夜晚得知他是哪—名玩家。', flavor: '你在風暴來臨前示警。你宣告一個善良角色，他只會死於處決，但邪惡陣營首夜便知他是誰。', reminders: ['改名'] },
  'toymaker': { id: 'toymaker', name: '玩具匠', alignment: 'good', type: 'fabled', icon: '/character/character_toymaker_fabled.png', flavor: '你打造會呼吸的玩偶。惡魔可以在某些夜晚放下屠刀，而邪惡陣營照舊得知開局的訊息。', ability: '惡魔可以在夜晚選擇放棄攻擊（每局遊戲至少一次)。邪惡玩家照常獲取初始資訊' },
};
