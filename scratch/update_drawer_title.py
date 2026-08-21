with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('"聊天室 & 筆記"', '"遊戲訊息"')
with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated drawer title")
