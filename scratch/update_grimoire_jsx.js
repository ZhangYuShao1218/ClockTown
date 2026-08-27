const fs = require('fs');
let content = fs.readFileSync('src/components/game/Grimoire.tsx', 'utf8');

content = content.replace(/onDragOver={onDragOver}/g, '');
content = content.replace(/onDrop={\(e\) => onDropBluff\(e, i\)}/g, 'onClick={() => openModal(\\'bluff\\', i)}');
content = content.replace(/onDrop={onDropFabled}/g, 'onClick={() => openModal(\\'fabled\\')}');
content = content.replace(/onClick={\(\) => { if \(roleInfo\) onRemoveRole\(seat\); }}/g, '');
content = content.replace(/onDrop={\(e\) => onDrop\(e, seat\)}/g, 'onClick={() => openModal(\\'seat\\', seat)}');
content = content.replace(/onClick={\(\) => onRemoveFabled\(fId\)}/g, 'onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}');

content = content.replace('      </div>\n    </div>\n  );\n};', 
      </div>

      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script} 
        filterType={target?.type === 'fabled' ? 'fabled' : 'normal'}
      />
    </div>
  );
};);

fs.writeFileSync('src/components/game/Grimoire.tsx', content);
console.log('Updated Grimoire.tsx JSX');
