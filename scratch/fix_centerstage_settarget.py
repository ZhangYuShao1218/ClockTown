import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('onClick={() => { setTarget({ type: \'seat\', index: seatIndex }); setModalOpen(true); }}', 'onClick={() => { setTargetSeat(seatIndex); setModalOpen(true); }}')
c = c.replace('script={script}', 'script={script || null}')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed CenterStage setTargetSeat syntax")
