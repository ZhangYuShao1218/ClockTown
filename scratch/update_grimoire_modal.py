import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Imports
content = content.replace(
    'import { setGrimoireRole, setGrimoireBluff, updateFabled } from "../../services/roomService";',
    'import { useState } from "react";\nimport { setGrimoireRole, setGrimoireBluff, updateFabled } from "../../services/roomService";\nimport { RoleSelectionModal } from "./RoleSelectionModal";'
)

# State and Handlers
state_code = '''
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<{ type: 'seat'|'bluff'|'fabled', index?: number } | null>(null);

  const openModal = (type: 'seat'|'bluff'|'fabled', index?: number) => {
    setTarget({ type, index });
    setModalOpen(true);
  };

  const handleModalSelect = async (roleId: string | null) => {
    if (!target) return;
    if (target.type === 'seat' && target.index !== undefined) {
      await setGrimoireRole(roomId, target.index, roleId);
    } else if (target.type === 'bluff' && target.index !== undefined) {
      await setGrimoireBluff(roomId, target.index, roleId);
    } else if (target.type === 'fabled' && roleId && !fabled.includes(roleId)) {
      await updateFabled(roomId, [...fabled, roleId]);
    }
  };
'''
content = re.sub(
    r'  const onDragOver = .*?  const onRemoveFabled = .*?;\n',
    state_code,
    content,
    flags=re.DOTALL
)

# Remove onDragOver/onDrop from elements
content = content.replace('onDragOver={onDragOver}', '')
content = re.sub(r'onDrop={\(e\) => onDropBluff\(e, i\)}', 'onClick={() => openModal(\\'bluff\\', i)}', content)
content = re.sub(r'onDrop={onDropFabled}', 'onClick={() => openModal(\\'fabled\\')}', content)
content = re.sub(r'onClick={\(\) => { if \(roleInfo\) onRemoveRole\(seat\); }}', '', content)
content = re.sub(r'onDrop={\(e\) => onDrop\(e, seat\)}', 'onClick={() => openModal(\\'seat\\', seat)}', content)
content = content.replace('className="w-14 h-14 rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative cursor-pointer group overflow-hidden mb-1"',
                          'className="w-14 h-14 rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative cursor-pointer group overflow-hidden mb-1"')

# Fabled item onClick
content = content.replace('onClick={() => onRemoveFabled(fId)}', 'onClick={(e) => { e.stopPropagation(); updateFabled(roomId, fabled.filter(id => id !== fId)); }}')

# Add modal to end
modal_jsx = '''
      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script} 
        filterType={target?.type === 'fabled' ? 'fabled' : 'normal'}
      />
    </div>
  );
'''
content = content.replace('    </div>\n  );\n};', modal_jsx + '};')

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Grimoire.tsx with Modal logic')
