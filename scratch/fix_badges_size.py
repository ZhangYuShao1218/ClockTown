import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_1 = 'className="absolute -top-2 -left-2 w-8 h-8 -rotate-12 drop-shadow-md z-10"'
good_1 = 'className="absolute -top-3 -left-3 w-9 h-9 -rotate-12 drop-shadow-lg z-10"'

text = text.replace(bad_1, good_1)

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
