import re

text = '''
善良陣營．鎮民
<color=#1F497D>洗衣婦
在你的首個夜晚，你會得知<color=#C00000>兩名玩家和一個<color=#1F497D>鎮民角色：這兩名玩家之一是該角色。

<color=#1F497D>圖書館管理員
在你的首個夜晚，你會得知<color=#C00000>兩名玩家和一個<color=#1F497D>外來者角色：這兩名玩家之一是該角色（或者你會得知沒有<color=#1F497D>外來者在場）。

<color=#1F497D>調查員
在你的首個夜晚，你會得知<color=#C00000>兩名玩家和一個<color=#C00000>爪牙角色：這兩名玩家之一是該角色（或者你會得知沒有<color=#C00000>爪牙在場）。

<color=#1F497D>廚師
在你的首個夜晚，你會得知場上<color=#1F497D>鄰座的<color=#C00000>邪惡玩家有多少對。

<color=#1F497D>共情者
每個夜晚，你會得知與你<color=#1F497D>鄰近的兩名<color=#1F497D>存活的玩家中<color=#C00000>邪惡玩家的數量。

<color=#1F497D>占卜師
每個夜晚，你要選擇兩名玩家：你會得知他們之中是否有<color=#C00000>惡魔。會有一名<color=#1F497D>善良玩家始終被你的能力當作<color=#C00000>惡魔。

<color=#1F497D>送葬者
每個夜晚*，你會得知今天<color=#C00000>白天死於處決的玩家的角色。

<color=#1F497D>僧侶
每個夜晚*，你要選擇除你以外的一名玩家：當晚<color=#C00000>惡魔的負面能力對他無效。

<color=#1F497D>守鴉人
如果你在<color=#C00000>夜晚死亡，你會被喚醒，然後你要選擇一名玩家：你會<color=#1F497D>得知他的角色。

<color=#1F497D>貞潔者
當你<color=#C00000>首次被提名時，如果提名你的玩家是<color=#1F497D>鎮民，他立刻被<color=#C00000>處決。

<color=#1F497D>獵手
每局遊戲限一次，你可以在白天時<color=#1F497D>公開選擇一名玩家：如果他是<color=#C00000>惡魔，他<color=#C00000>死亡。

<color=#1F497D>士兵
<color=#C00000>惡魔的負面能力對你無效。

<color=#1F497D>鎮長
如果只有三名玩家存活且白天沒有人被處決，你的<color=#1F497D>陣營獲勝。如果你在夜晚即將<color=#C00000>死亡，可能會有另一名其他玩家代替你<color=#C00000>死亡。

善良陣營．外來者
<color=#1F497D>管家
每個夜晚，你要選擇除你以外的一名玩家：明天白天，只有<color=#1F497D>他投票時你才能投票。

<color=#1F497D>酒鬼
你不知道你是酒鬼。你以為你是一個<color=#1F497D>鎮民角色，但其實你不是。

<color=#1F497D>陌客
你可能會被當作<color=#C00000>邪惡陣營、<color=#C00000>爪牙角色或<color=#C00000>惡魔角色，即使你已<color=#C00000>死亡。

<color=#1F497D>聖徒
如果你死於處決，你的陣營<color=#C00000>落敗。

邪惡陣營．爪牙
<color=#C00000>投毒者
每個夜晚，你要選擇一名玩家：他在當晚和明天白天<color=#C00000>中毒。

<color=#C00000>間諜
每個夜晚，你能查看魔典。你可能會被當作<color=#1F497D>善良陣營、<color=#1F497D>鎮民角色或<color=#1F497D>外來者角色，即使你已<color=#C00000>死亡。

<color=#C00000>紅唇女郎
如果大於等於五名玩家<color=#1F497D>存活時（旅行者不計算在內）<color=#C00000>惡魔死亡，你變成那個<color=#C00000>惡魔。

<color=#C00000>男爵
會有額外的外來者在場。<color=#1F497D>[+2外來者]

邪惡陣營．惡魔
<color=#C00000>小惡魔
每個夜晚*，你要選擇一名玩家：他<color=#C00000>死亡。如果你以這種方式自殺，一名<color=#C00000>爪牙會變成<color=#C00000>小惡魔。
'''

roles = {}

lines = text.strip().split('\n')
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line or line.startswith('善良陣營') or line.startswith('邪惡陣營'):
        i += 1
        continue
    
    if line.startswith('<color'):
        name = re.sub(r'<[^>]+>', '', line).strip()
        i += 1
        ability = lines[i].strip()
        
        parts = re.split(r'(<color=#[0-9A-Fa-f]{6}>)', ability)
        html_parts = []
        is_open = False
        plain_text = ""
        for p in parts:
            if p.startswith('<color='):
                if is_open:
                    html_parts.append('</span>')
                color = p[7:14]
                html_parts.append(f'<span className="text-[{color}] font-bold">')
                is_open = True
            else:
                html_parts.append(p)
                plain_text += p
        if is_open:
            html_parts.append('</span>')
            
        roles[name] = {
            'plain': plain_text.replace('"', '\\"').replace("'", "\\'"),
            'html': "".join(html_parts).replace('"', '\\"').replace("'", "\\'")
        }
    i += 1

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for name, data in roles.items():
    n = name
    if n == '圖書館管理員': n = '圖書管理員'
    
    # regex to find ability: '...',
    pattern = r"(name:\s*'" + n + r"',\s*alignment:[^,]+,\s*type:[^,]+,\s*icon:[^,]+,\s*ability:\s*)'[^']*'"
    replacement = r"\g<1>'" + data['plain'] + r"',\n  abilityHTML: '" + data['html'] + r"'"
    content = re.sub(pattern, replacement, content)

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Roles patched successfully!")
