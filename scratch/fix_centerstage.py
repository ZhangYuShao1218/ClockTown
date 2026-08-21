import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the SeatNoteModal with RoleSelectionModal
modal_bad = """{userUid && (
        <SeatNoteModal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          seatIndex={selectedSeat}
          currentNote={selectedSeat ? seatRoleNotes[selectedSeat] : null}
          onSave={handleSaveNote}
          script={script}
        />
      )}"""

modal_good = """<RoleSelectionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleModalSelect}
        script={script}
      />"""

c = c.replace(modal_bad, modal_good)

# Replace the incorrect seat vars
seat_vars_bad = "const isDead = stageState?.[seatIndex]?.isDead || false;\n            const guessedRoleId = seatRoleNotes[seatIndex] || null;\n            const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;"
seat_vars_good = "const isDead = false;\n            const guessedRoleId = seatRoleNotes[seatIndex] || null;\n            const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;"

c = c.replace(seat_vars_bad, seat_vars_good)

# Fix seat onClick
c = c.replace('onClick={() => userUid ? openNoteModal(seatIndex) : null}', 'onClick={() => setTarget({ type: \'seat\', index: seatIndex }); setModalOpen(true);}')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed CenterStage syntax")
