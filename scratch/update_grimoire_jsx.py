import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onDragOver={onDragOver}', '')
content = content.replace('onDrop={(e) => onDropBluff(e, i)}', 'onClick={() => openModal("bluff", i)}')
content = content.replace('onDrop={onDropFabled}', 'onClick={() => openModal("fabled")}')
content = content.replace('onClick={() => { if (roleInfo) onRemoveRole(seat); }}', '')
content = content.replace('onDrop={(e) => onDrop(e, seat)}', 'onClick={() => openModal("seat", seat)}')
content = content.replace('onClick={() => onRemoveFabled(fId)}', 'onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}')
content = content.replace('(拖曳至此)', '(點擊新增)')

modal_jsx = '''      </div>

      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script} 
        filterType={target?.type === "fabled" ? "fabled" : "normal"}
      />
    </div>
  );
};'''

content = content.replace('      </div>\n    </div>\n  );\n};', modal_jsx)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Grimoire.tsx JSX')
