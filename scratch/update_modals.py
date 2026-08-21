import re

with open('src/components/common/Modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add new props
c = c.replace('maxWidth?: string;', 'maxWidth?: string;\n  noOverlay?: boolean;\n  contentClass?: string;')
c = c.replace('maxWidth = "max-w-lg"', 'maxWidth = "max-w-lg", noOverlay = False, contentClass = "bg-black/95"')
c = c.replace('noOverlay = False', 'noOverlay = false')

# Update overlay
c = c.replace('className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"', 'className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${noOverlay ? "" : "bg-black/80 backdrop-blur-sm"}`}')

# Update content bg
c = c.replace('bg-black/95 backdrop-blur-xl', '${contentClass} backdrop-blur-xl')

with open('src/components/common/Modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('maxWidth="max-w-4xl" title=', 'maxWidth="max-w-4xl" noOverlay={true} contentClass="bg-slate-800/95" title=')

# Update tooltip padding and line height
old_tooltip = r'<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-48 bg-black/95 p-3 text-xs border border-white/20 rounded shadow-2xl pointer-events-none">'
new_tooltip = '<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-48 bg-black/95 p-[5px] text-xs border border-white/20 rounded shadow-2xl pointer-events-none">'
c = c.replace('<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-48 bg-black/95 p-3 text-xs border border-white/20 rounded shadow-2xl pointer-events-none">', new_tooltip)

old_ability = r'<div className="text-white/80">\{role\.ability\}</div>'
new_ability = '<div className="text-white/80 leading-[1.2]">{role.ability}</div>'
c = re.sub(old_ability, new_ability, c)

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Modals")
