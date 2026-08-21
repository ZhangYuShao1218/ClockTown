with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('opacity-40 mix-blend-luminosity', 'opacity-60 mix-blend-luminosity')
c = c.replace('bg-black/30 backdrop-blur-sm', 'bg-black/10 backdrop-blur-sm')

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Room background")
