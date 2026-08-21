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
# Bluffs hover z-index
text = text.replace(
    'className="flex flex-col items-center flex-1 group relative"',
    'className="flex flex-col items-center flex-1 group relative hover:z-[9999]"'
)
# Fabled hover z-index
text = text.replace(
    'className="flex flex-col items-center flex-1 min-w-[30%] group relative"',
    'className="flex flex-col items-center flex-1 min-w-[30%] group relative hover:z-[9999]"'
)
# Bluffs and Fabled tooltips positioning: change from "top-[110%] left-1/2 -translate-x-1/2" to "top-[110%] right-0" or similar.
# Wait, for Bluffs they had "top-full mt-2 left-1/2 -translate-x-1/2"
text = text.replace(
    'className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800/95',
    'className="absolute top-full mt-2 right-0 w-64 bg-slate-800/95'
)
text = text.replace(
    'className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95',
    'className="absolute top-[110%] right-0 w-64 bg-slate-800/95'
)
# Wait, seat tooltips ALSO have "top-[110%] left-1/2 -translate-x-1/2"! 
# If I just replace it globally, seat tooltips will also become right-aligned!
# Let's read the file again in Python to do it properly.
