import re

files = ['src/components/game/CenterStage.tsx', 'src/components/game/Grimoire.tsx']

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Revert width back to w-[20%]
    text = text.replace('w-[22%]', 'w-[20%]')

    # Add relative z-30 to Bluffs container
    bluff_container_bad = 'className="flex flex-col items-center space-y-2 pointer-events-auto bg-black/60 border-2 border-rose-900/80 p-3 pb-2 rounded-xl shadow-lg backdrop-blur-md w-full shrink-0"'
    bluff_container_good = 'className="flex flex-col items-center space-y-2 pointer-events-auto bg-black/60 border-2 border-rose-900/80 p-3 pb-2 rounded-xl shadow-lg backdrop-blur-md w-full shrink-0 relative z-30"'
    text = text.replace(bluff_container_bad, bluff_container_good)

    # Add relative z-20 to Fabled container
    fabled_container_bad = 'className="bg-black/60 border-2 border-yellow-400 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col w-full shrink-0"'
    fabled_container_good = 'className="bg-black/60 border-2 border-yellow-400 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col w-full shrink-0 relative z-20"'
    text = text.replace(fabled_container_bad, fabled_container_good)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
