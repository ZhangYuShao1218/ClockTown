import re

def fix_layout(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Fix right stack width and padding to prevent clipping
    # Find `w-64 pr-2`
    c = c.replace('w-64 pr-2', 'w-[20%] pr-4 pl-4')

    # Remove scale-105 because we'll just make text larger. Wait, user wants it enlarged 5%.
    # With pl-4 and w-[20%], scale-105 origin-right won't clip anymore.
    # But let's change text sizes in Room Info as requested:
    # "Room跟房號 文字大小放大點 離開房間按鈕的文字大小也調大"
    c = c.replace('text-[10px] text-white/50 tracking-widest', 'text-xs text-white/50 tracking-widest')
    c = c.replace('font-mono text-white text-xs font-bold', 'font-mono text-white text-base font-bold')
    c = c.replace('text-xs px-3 py-1 bg-red-900', 'text-sm px-4 py-1.5 bg-red-900')

    # Remove giant circle background and change container size
    # Pattern for container:
    seat_area_pattern = r'<div className="flex-1 flex items-center justify-center w-full min-h-0 py-16">\s*<div className="relative w-\[95vmin\] max-w-\[1000px\] aspect-square rounded-full border-2 border-white/10 shadow-2xl flex items-center justify-center pointer-events-none mx-auto bg-black/40">\s*<div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />\s*<div className="text-center pointer-events-none flex flex-col items-center z-0">'

    new_seat_area = """<div className="absolute left-[5%] top-[5%] bottom-[5%] right-[22%] flex items-center justify-center pointer-events-none">
        <div className="relative h-full aspect-square flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-none flex flex-col items-center z-0">"""

    # For CenterStage, the pattern is slightly different (no Grimoire text inside the circle)
    # Let's just use a more generic replace
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

fix_layout('src/components/game/Grimoire.tsx')
fix_layout('src/components/game/CenterStage.tsx')
print("Fixed stack styles")
