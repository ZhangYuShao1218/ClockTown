import re

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Update Sentinel
old_sentinel = r"export const Sentinel: Role = \{\s*id: 'sentinel',\s*name: '守護神',\s*alignment: 'good',\s*type: 'fabled',\s*icon: '[^']*',\s*ability: '[^']*'\s*\};"
new_sentinel = """export const Sentinel: Role = {
  id: 'sentinel',
  name: '哨兵',
  alignment: 'good',
  type: 'fabled',
  icon: 'https://wiki.bloodontheclocktower.com/images/d/d4/Icon_sentinel.png',
  ability: '外來者數量可能 +1 或 -1'
};"""
c = re.sub(old_sentinel, new_sentinel, c)

# Add Angel and remove Doomsayer
old_doomsayer = r"export const Doomsayer: Role = \{\s*id: 'doomsayer',\s*name: '末日宣告者',\s*alignment: 'evil',\s*type: 'fabled',\s*icon: '[^']*',\s*ability: '[^']*'\s*\};"
new_angel = """export const Angel: Role = {
  id: 'angel',
  name: '天使',
  alignment: 'good',
  type: 'fabled',
  icon: 'https://wiki.bloodontheclocktower.com/images/c/ca/Icon_angel.png',
  ability: '對新玩家的死亡負最大責任的人，可能會遭遇一些不好的事情。'
};"""
c = re.sub(old_doomsayer, new_angel, c)

# Update AllRoles dictionary
c = c.replace('sentinel: Sentinel,', 'sentinel: Sentinel,')
c = c.replace('doomsayer: Doomsayer', 'angel: Angel')

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated Fabled roles in roles.ts")
