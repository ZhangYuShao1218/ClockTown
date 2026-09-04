import type { Role } from '../types';

// ================= 奇遇 (loric) — 11 個 =================
export const Loric: Record<string, Role> = {
  'bigwig_loric': { id: 'bigwig_loric', name: '首席律師', alignment: 'neutral', type: 'loric', icon: '/character/character_bigwig_loric_loric.png', ability: '每個被提名者要選擇一名玩家：在投票前，只有他可以發言，並且他要"瘋狂"地證明被提名者是善良的，否則他可能死亡。', flavor: '你為被告辯護。每個被提名者選一位辯護人，他得瘋狂地力證被告清白，否則性命堪憂。', reminders: ['被提名者', '發言人'] },
  'bootlegger_loric': { id: 'bootlegger_loric', name: '私貨商人', alignment: 'neutral', type: 'loric', icon: '/character/character_bootlegger_loric_loric.png', flavor: '這座鐘鎮流通著私釀的規則與角色。有些東西，不在正典之內。', ability: '這個劇本包含有自制角色或自制規則。' },
  'gardener_loric': { id: 'gardener_loric', name: '園丁', alignment: 'neutral', type: 'loric', icon: '/character/character_gardener_loric_loric.png', flavor: '你親手栽培每一株幼苗。這一局，一名或多名玩家的角色，由說書人為他們挑選。', ability: '由說書人來為一名或更多玩家派發角色。' },
  'godofug_loric': { id: 'godofug_loric', name: '訥神', alignment: 'neutral', type: 'loric', icon: '/character/character_godofug_loric_loric.png', ability: '會有一頂訥帽。當玩家戴著訥帽的時候，只能說單音節詞，但投票算作兩票。如果違反規則，訥帽會被轉移。', flavor: '你賜下一頂訥帽。戴帽之人只能吐出單音節，一票卻抵兩票；違規者，訥帽易主。', reminders: ['訥帽'] },
  'Hindu_loric': { id: 'Hindu_loric', name: '印度教教徒', alignment: 'neutral', type: 'loric', icon: '/character/character_Hindu_loric_loric.png', flavor: '你信奉輪迴。最先倒下的四名靈魂，會立刻以同陣營的旅行者之姿轉世歸來。', ability: '最先死亡的四名玩家會立刻以相同陣營的旅行者轉世重生。' },
  'knaves_loric': { id: 'knaves_loric', name: '詭詐傑克', alignment: 'neutral', type: 'loric', icon: '/character/character_knaves_loric_loric.png', flavor: '場上有兩位說書人：一人吐真言，一人吐謊語。他們或許會在某個黃昏悄悄對調。', ability: '場上有兩位說書人：一人說真話，一人說假話。每局遊戲限一次，他們可能會在黃昏互換。' },
  'pope_loric': { id: 'pope_loric', name: '教皇', alignment: 'neutral', type: 'loric', icon: '/character/character_pope_loric_loric.png', flavor: '你宣講重複的教條。場上有著成對的善良角色，它們也可能只是偽裝。', ability: '場上存在重複的善良角色。它們可能也是偽裝身份。' },
  'stormcatcher_loric': { id: 'stormcatcher_loric', name: '暴風捕手', alignment: 'neutral', type: 'loric', icon: '/character/character_stormcatcher_loric_loric.png', ability: '遊戲開始時，你要宣佈一個善良角色。如果該角色在場，他只能死於處決，但所有邪惡玩家會在首個夜晚得知他是哪一名玩家。', flavor: '你在風暴來臨前示警。你宣告一個善良角色，他只會死於處決，但邪惡陣營首夜便知他是誰。', reminders: ['保護'] },
  'tor_loric': { id: 'tor_loric', name: '遺忘之門', alignment: 'neutral', type: 'loric', icon: '/character/character_tor_loric_loric.png', ability: '玩家不知道自己的角色和陣營。當他們死亡時才會得知這些資訊。', flavor: '你開啟遺忘之門。眾人皆不知自己的角色與陣營，唯有死亡降臨時，真相才揭曉。', firstNightReminder: '在設定調整階段，不要把盲抽袋給玩家。由說書人從盲抽袋抽取角色標記，並把他們放置在魔典中。 如果一名玩家在白天死亡，私下告訴他們角色和陣營。如果一名玩家在夜晚死亡，喚醒他們，並向他們依次展示“你是”資訊標記，他們的角色標記，“你是”資訊標記和豎起或倒置的大拇指。' },
  'ventriloquist_loric': { id: 'ventriloquist_loric', name: '腹語師', alignment: 'neutral', type: 'loric', icon: '/character/character_ventriloquist_loric_loric.png', ability: '如果一名玩家在被提名時"瘋狂"地證明自己是一個新的角色，他可能不會死於當天的處決。', flavor: '你借他人之口說話。被提名者若瘋狂地宣稱自己是個新角色，或許就能逃過當日的處決。', reminders: ['瘋狂'] },
  'Zenomancer_loric': { id: 'Zenomancer_loric', name: '異術士', alignment: 'neutral', type: 'loric', icon: '/character/character_Zenomancer_loric_loric.png', flavor: '你為人設下隱秘的課題。一旦有人達成他的目標，便會換得一則真確的訊息。', ability: '一名或多名玩家各自擁有一個目標。當達成目標後，他會獲得一條正確資訊。' },
};
