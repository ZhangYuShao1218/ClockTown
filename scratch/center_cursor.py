import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure all seat states have cursor-pointer
content = re.sub(
    r"p \? 'border-primary/50 bg-primary/20 shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\]' : 'border-dashed border-white/30 bg-black/60 hover:bg-white/20 hover:border-white/50 cursor-pointer'",
    "p ? 'border-primary/50 bg-primary/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer hover:border-white/50' : 'border-dashed border-white/30 bg-black/60 hover:bg-white/20 hover:border-white/50 cursor-pointer'",
    content
)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added cursor-pointer to occupied seats')
