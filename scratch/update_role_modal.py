import re

with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state import if not present
if 'useState' not in content:
    content = content.replace('import { Modal }', 'import { useState } from "react";\nimport { Modal }')

# Add hoveredRole state
state_def = """export const RoleSelectionModal = ({ isOpen, onClose, onSelect, script, filterType = 'normal' }: RoleSelectionModalProps) => {
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);

  if (!isOpen) return null;"""
content = re.sub(r'export const RoleSelectionModal = .*?\{\n  if \(\!isOpen\) return null;', state_def, content)

# Remove Clear Role button
clear_btn_pattern = r'        <div className="mb-6">\n          <button[\s\S]*?</button>\n        </div>\n'
content = re.sub(clear_btn_pattern, '', content)

# Add maxWidth
content = content.replace('<Modal isOpen={isOpen} onClose={onClose} title=', '<Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" title=')

# Update icon size and add hover logic
role_btn_pattern = r'<button\n\s*key=\{role\.id\}[\s\S]*?className="flex flex-col items-center group focus:outline-none"\n\s*title=\{role\.ability\}\n\s*>'
new_role_btn = """<div key={role.id} className="relative flex flex-col items-center group">
            <button
              onClick={() => handleSelect(role.id)}
              onMouseEnter={() => setHoveredRole(role)}
              onMouseLeave={() => setHoveredRole(null)}
              className="flex flex-col items-center focus:outline-none w-full"
            >"""
content = re.sub(role_btn_pattern, new_role_btn, content)

# Replace w-14 h-14 with w-[68px] h-[68px]
content = content.replace('w-14 h-14', 'w-[68px] h-[68px]')

# Close the div and add tooltip
end_btn_pattern = r'              </span>\n            </button>'
new_end_btn = """              </span>
            </button>
            {hoveredRole?.id === role.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-48 bg-black/95 p-3 text-xs border border-white/20 rounded shadow-2xl pointer-events-none">
                <div className="font-bold text-white mb-1">{role.name}</div>
                <div className="text-white/80">{role.ability}</div>
              </div>
            )}
          </div>"""
content = re.sub(end_btn_pattern, new_end_btn, content)

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated RoleSelectionModal")
