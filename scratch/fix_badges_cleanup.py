import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_old = """      
      {role?.type === 'demon' && (
        <img src="/icons/demon_badge.png" alt="Demon" className="absolute top-1 left-1 w-6 h-6 rounded-full border border-red-500 shadow-md" />
      )}
      {role?.type === 'outsider' && (
        <img src="/icons/outsider_badge.png" alt="Outsider" className="absolute top-1 left-1 w-6 h-6 rounded-full border border-blue-400 shadow-md" />
      )}"""

text = text.replace(bad_old, "")

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
