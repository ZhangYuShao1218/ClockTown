import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# onClick logic
seat_div_start = '''                <div 
                  onClick={() => !p && handleTakeSeat(seat)}'''
seat_div_replacement = '''                <div 
                  onClick={() => {
                    if (!p) handleTakeSeat(seat);
                    else openNoteModal(seat);
                  }}'''
content = content.replace(seat_div_start, seat_div_replacement)

# Rendering the role icon note
render_note = '''                  {p ? (
                    <>
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full z-0 opacity-80 mix-blend-overlay" />
                      <span className="absolute z-10 text-white font-bold drop-shadow-md text-center px-1 break-all">{p.name}</span>
                      
                      {seatRoleNotes[seat] && script && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white/50 bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] shadow-lg flex items-center justify-center overflow-hidden z-30">
                          <RoleIcon icon={script.roles.find(r => r.id === seatRoleNotes[seat])?.icon || ""} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </>
                  ) : ('''
content = content.replace('''                  {p ? (
                    <>
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full z-0 opacity-80 mix-blend-overlay" />
                      <span className="absolute z-10 text-white font-bold drop-shadow-md text-center px-1 break-all">{p.name}</span>
                    </>
                  ) : (''', render_note)

# Add Modal
modal_jsx = '''      </div>
      
      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script!} 
      />
    </div>
  );
};'''
content = content.replace('      </div>\n    </div>\n  );\n};', modal_jsx)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated CenterStage JSX')
