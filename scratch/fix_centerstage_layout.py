import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Hover z-index for Seats
text = text.replace(
    'className="absolute group z-10"',
    'className="absolute group z-10 hover:z-[9999]"'
)

# 2. Update Night Order Badges position (inward 10px)
text = text.replace(
    'className="absolute -left-5 top-1/2',
    'className="absolute left-[-10px] top-1/2'
)
text = text.replace(
    'className="absolute -right-5 top-1/2',
    'className="absolute right-[-10px] top-1/2'
)

# 3. Update Bluffs and Fabled tooltip positioning and hover z-index
text = text.replace(
    'className="flex flex-col items-center flex-1 group relative"',
    'className="flex flex-col items-center flex-1 group relative hover:z-[9999]"'
)
text = text.replace(
    'className="flex flex-col items-center flex-1 min-w-[30%] group relative"',
    'className="flex flex-col items-center flex-1 min-w-[30%] group relative hover:z-[9999]"'
)

# Bluffs tooltip positioning (they are on the right panel, so align right)
text = text.replace(
    '<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800/95',
    '<div className="absolute top-full mt-2 right-0 w-64 bg-slate-800/95'
)
# Fabled tooltip positioning
text = text.replace(
    '<div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95',
    '<div className="absolute top-[110%] right-0 w-64 bg-slate-800/95'
)

# 4. Dynamic tooltip positioning for seats
# We need to insert the math logic into the seat map
seat_logic_target = """          {seats.map((seatIndex) => {
            const player = getPlayerInSeat(seatIndex);
            const style = getSeatStyle(seatIndex);
            const isEmpty = !player;"""

seat_logic_replacement = """          {seats.map((seatIndex) => {
            const player = getPlayerInSeat(seatIndex);
            const style = getSeatStyle(seatIndex);
            const isEmpty = !player;
            
            const angleDeg = (seatIndex / totalSeats) * 360 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = 50 + 45 * Math.cos(angleRad);
            const y = 50 + 45 * Math.sin(angleRad);
            
            let tooltipClass = "top-[110%] mt-2 ";
            if (y > 75) tooltipClass = "bottom-[110%] mb-2 ";
            
            if (x < 25) tooltipClass += "left-0";
            else if (x > 75) tooltipClass += "right-0";
            else tooltipClass += "left-1/2 -translate-x-1/2";
"""

text = text.replace(seat_logic_target, seat_logic_replacement)

# Now replace the static tooltip class in the seat code
seat_tooltip_target = """<div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">"""
# Wait, Fabled also had top-[110%] left-1/2 ... but we already replaced it! 
# Wait, let me check if I successfully replaced Fabled before.
# Let's just use regex to target the exact seat tooltip location.

text = text.replace(seat_tooltip_target, """<div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>""")

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
