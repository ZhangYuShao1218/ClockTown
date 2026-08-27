import re

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 4. Slayer
c = c.replace("name: '殺手',", "name: '獵手',")
c = re.sub(r"id: 'slayer',\s*name: '獵手',\s*alignment: 'good',\s*type: 'townsfolk',\s*icon: '[^']*',", "id: 'slayer',\n  name: '獵手',\n  alignment: 'good',\n  type: 'townsfolk',\n  icon: 'https://wiki.bloodontheclocktower.com/images/d/d3/Icon_slayer.png',", c)

# 5. Soldier
c = re.sub(r"id: 'soldier',\s*name: '士兵',\s*alignment: 'good',\s*type: 'townsfolk',\s*icon: '[^']*',", "id: 'soldier',\n  name: '士兵',\n  alignment: 'good',\n  type: 'townsfolk',\n  icon: 'https://wiki.bloodontheclocktower.com/images/c/c3/Icon_soldier.png',", c)

# 6. Mayor
c = c.replace("name: '市長',", "name: '鎮長',")
c = re.sub(r"id: 'mayor',\s*name: '鎮長',\s*alignment: 'good',\s*type: 'townsfolk',\s*icon: '[^']*',", "id: 'mayor',\n  name: '鎮長',\n  alignment: 'good',\n  type: 'townsfolk',\n  icon: 'https://wiki.bloodontheclocktower.com/images/a/a1/Icon_mayor.png',", c)

# 7. Imp
c = re.sub(r"id: 'imp',\s*name: '小惡魔',\s*alignment: 'evil',\s*type: 'demon',\s*icon: '[^']*',", "id: 'imp',\n  name: '小惡魔',\n  alignment: 'evil',\n  type: 'demon',\n  icon: 'https://wiki.bloodontheclocktower.com/images/5/5c/Icon_imp.png',", c)

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated roles.ts")
