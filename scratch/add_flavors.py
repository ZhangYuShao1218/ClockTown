import re

flavor_texts = {
    'Washerwoman': '水流洗淨了鎮民的衣裳，卻洗不淨暗處的血跡。你的雙眼，總能看透那被隱藏的真實身分。',
    'Librarian': '在泛黃的書卷中，記錄著被遺忘的詛咒。你熟知鎮上每一個外來者的秘密，即便他們自己也一無所知。',
    'Investigator': '每一個細微的線索，都指向潛藏的邪惡。爪牙的陰影在你的追蹤下無所遁形。',
    'Chef': '爐火的溫度與廚房的氣味，讓你對周圍的邪惡有著敏銳的直覺。相鄰的黑暗，總會露出馬腳。',
    'Empath': '你的心跳能與周遭的靈魂共鳴。鄰座的邪惡氣息，是你在黑夜中揮之不去的夢魘。',
    'FortuneTeller': '星辰與水晶球映照出血紅的未來。你的占卜能準確地指出惡魔的所在，即便偶爾會被命運開個玩笑。',
    'Undertaker': '死人不說謊。當鎮民將他們吊死，你負責為他們收屍，同時也揭開了他們生前最後的秘密。',
    'Monk': '你的信仰與祈禱化作堅不可摧的護盾。今夜，你的庇護將讓惡魔的利爪無功而返。',
    'Ravenkeeper': '群鴉是你的眼線，死亡是你的代價。當你倒下的那一刻，真相將向你徹底敞開。',
    'Virgin': '純潔是你的武器，也是致命的陷阱。那些敢於質疑你的人，必將遭到公開的制裁。',
    'Slayer': '你的槍管裡只剩下一發子彈，但這就夠了。等待時機，給予惡魔致命的一擊吧。',
    'Soldier': '身經百戰的你，有著無法被撼動的意志。惡魔的爪牙在你面前，不過是徒勞的掙扎。',
    'Mayor': '你掌握著這座城鎮的權力。當末日降臨，只要你還活著，善良陣營就仍有一絲希望。',
    'Butler': '你習慣了服從與跟隨。主人的意志就是你的意志，即便在生死的投票面前也是如此。',
    'Drunk': '一杯接一杯，世界在你眼中扭曲變形。你以為自己是英雄，但你只是個一無所知的醉漢。',
    'Recluse': '你選擇遠離人群，卻被當作黑暗的同黨。即使你心向光明，靈魂卻始終散發著邪惡的氣息。',
    'Saint': '他們將你視作聖人，然而這卻是悲劇的開始。如果你被處決，整個城鎮將為你的死陪葬。',
    'Poisoner': '幾滴無色無味的毒藥，就能讓最聰明的人陷入瘋狂。今夜，你又要讓誰的感官錯亂呢？',
    'Spy': '你潛伏在光明之中，翻閱著魔法書的每一頁。沒有任何秘密能逃過你的雙眼。',
    'ScarletWoman': '你是暗影中的繼承者。當王座崩塌，你將披上血色的長袍，成為新的夢魘。',
    'Baron': '你的詭計讓鎮上的秩序陷入混亂。更多的外人，意味著更多的猜忌與不安。',
    'Imp': '你是黑鍾鎮隱藏的邪惡存在，一段被遺忘的過去。人們是如此稱呼你：小惡魔。',
    'Sentinel': '你守護著這座城鎮的邊緣。外來者的數量在你眼中，不再是個謎團。',
    'Angel': '你的羽翼帶來了恩典。新手將在你的庇護下，免受第一夜的殘酷侵擾。'
}

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add flavor to interface
if 'flavor?: string;' not in text:
    text = text.replace('abilityHTML?: string;', 'abilityHTML?: string;\n  flavor?: string;')

# Inject flavor into each role object
for role_key, flavor in flavor_texts.items():
    pattern = rf'export const {role_key}: Role = \{{'
    replacement = f'export const {role_key}: Role = {{\n  flavor: \'{flavor}\','
    text = re.sub(pattern, replacement, text)

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(text)
