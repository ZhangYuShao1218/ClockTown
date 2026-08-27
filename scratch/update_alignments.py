import re

# 1. Update RoleSelectionModal tooltip
with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_tooltip_container = r'className="fixed z-\[99999\] w-64 bg-black/95 p-4 text-base border-2 border-white/40 rounded-xl shadow-\[0_0_50px_rgba\(0,0,0,1\)\] pointer-events-none text-center"'
new_tooltip_container = 'className="fixed z-[99999] w-64 bg-slate-900/95 p-[5px] text-base border-2 border-white/40 rounded-xl shadow-2xl pointer-events-none text-left"'
c = re.sub(old_tooltip_container, new_tooltip_container, c)

old_tooltip_text = r'<div className="text-white font-bold leading-tight">\{hoveredRole\.role\.ability\}</div>'
new_tooltip_text = '<div className="text-white/80 font-bold leading-[1.5]">{hoveredRole.role.ability}</div>'
c = re.sub(old_tooltip_text, new_tooltip_text, c)

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Update ScriptInfoModal descriptions
with open('src/components/game/ScriptInfoModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('leading-relaxed"', 'leading-[1.5] text-left"')

with open('src/components/game/ScriptInfoModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated alignments and line heights")
