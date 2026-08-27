with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix Room alignment
c = c.replace('<div className="flex justify-between w-full items-center">', '<div className="flex justify-start w-full items-center">')

# Fix English script name font size (remove text-sm)
c = c.replace('<span className="text-sm text-yellow-500/80">', '<span className="text-lg text-yellow-500/80">')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<div className="flex justify-between w-full items-center">', '<div className="flex justify-start w-full items-center">')
c = c.replace('<span className="text-sm text-yellow-500/80">', '<span className="text-lg text-yellow-500/80">')

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed alignment and font size")
