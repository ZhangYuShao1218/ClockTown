const fs = require('fs');

let content = fs.readFileSync('src/components/game/Grimoire.tsx', 'utf8');

content = content.replace(
  'import { setGrimoireRole, setGrimoireBluff, updateFabled } from "../../services/roomService";',
  'import { useState } from "react";\nimport { setGrimoireRole, setGrimoireBluff, updateFabled } from "../../services/roomService";\nimport { RoleSelectionModal } from "./RoleSelectionModal";'
);

const stateCode = 
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
;

content = content.replace(/const onDragOver = [\s\S]*?const onRemoveFabled = [\s\S]*?;\n/, stateCode);

content = content.replace(/onDragOver={onDragOver}/g, '');
content = content.replace(/onDrop={\(e\) => onDropBluff\(e, i\)}/g, 'onClick={() => openModal(\\'bluff\\', i)}');
content = content.replace(/onDrop={onDropFabled}/g, 'onClick={() => openModal(\\'fabled\\')}');
content = content.replace(/onClick={\(\) => { if \(roleInfo\) onRemoveRole\(seat\); }}/g, '');
content = content.replace(/onDrop={\(e\) => onDrop\(e, seat\)}/g, 'onClick={() => openModal(\\'seat\\', seat)}');

content = content.replace(/onClick={\(\) => onRemoveFabled\(fId\)}/g, 'onClick={(e) => { e.stopPropagation(); updateFabled(roomId, fabled.filter(id => id !== fId)); }}');

const modalJsx = 
      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script} 
        filterType={target?.type === 'fabled' ? 'fabled' : 'normal'}
      />
    </div>
  );
;

content = content.replace('    </div>\n  );\n};', modalJsx + '};');

fs.writeFileSync('src/components/game/Grimoire.tsx', content);
console.log('Updated Grimoire.tsx');
