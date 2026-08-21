import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="absolute bottom-4 right-4 z-20 w-48 min-h-[80px] bg-black/60 border border-yellow-500/30 rounded-lg p-2 shadow-lg backdrop-blur-md flex flex-col"', 
                          'className="absolute bottom-4 right-4 z-20 w-48 min-h-[80px] bg-black/60 border border-yellow-500/30 rounded-lg p-2 shadow-lg backdrop-blur-md flex flex-col cursor-pointer hover:border-yellow-500/60 transition-colors"')

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added cursor-pointer to Fabled zone')
