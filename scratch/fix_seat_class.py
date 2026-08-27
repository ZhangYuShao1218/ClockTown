import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the hardcoded right-0 in the seat tooltip with the dynamic class
seat_bad = """<div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">"""
seat_good = """<div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left`}>"""

# ONLY for the seats... wait, fabled also has right-0 but without `${tooltipClass}`. So a strict replacement is fine.
# Let's verify how many times it appears.
# But it's safer to just replace it in the block.
# Actually, the fabled one has "text-left">", and I want to only change the one after {otherNum} ... </div>)}

text = text.replace(seat_bad, seat_good, 1)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
