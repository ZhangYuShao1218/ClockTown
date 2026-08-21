import re

def parse_script_name(script_var):
    return f"""<div className="flex flex-col items-center justify-center">
              {{({script_var}?.name || "").includes('(') ? (
                <>
                  <span>{{({script_var}?.name || "").split('(')[0].strip()}}</span>
                  <span className="text-sm text-yellow-500/80">({{({script_var}?.name || "").split('(')[1]}}</span>
                </>
              ) : <span>{{{script_var}?.name || "未知劇本"}}</span>}}
            </div>"""

def fix_board_component(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Right stack top spacing: top-16 -> top-4
    c = c.replace('top-16 bottom-4 flex flex-col', 'top-4 bottom-4 flex flex-col')

    # Distribution panel text: text-[10px] -> text-lg, text-base -> text-lg
    c = c.replace('text-[10px] font-bold text-blue-300', 'text-lg font-bold text-blue-300')
    c = c.replace('text-[10px] font-bold text-red-400', 'text-lg font-bold text-red-400')
    c = c.replace('text-base font-bold text-white', 'text-lg font-bold text-white')

    # Demon bluffs and Fabled titles: text-sm -> text-lg, text-[10px] -> text-lg
    c = c.replace('<h3 className="text-sm font-bold text-red-400/90', '<h3 className="text-lg font-bold text-red-400/90')
    c = c.replace('<h3 className="text-[10px] font-bold text-yellow-500/80', '<h3 className="text-lg font-bold text-yellow-500/80')

    # Demon bluffs circles: w-14 h-14 sm:w-16 sm:h-16 -> w-20 h-20
    c = c.replace('w-14 h-14 sm:w-16 sm:h-16', 'w-20 h-20')

    # Storyteller: text-[10px] -> text-lg, text-sm -> text-lg
    # It was: <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase">說書人</span>
    # <span className="text-sm font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>
    c = c.replace('<span className="text-[10px] text-white/70 font-bold tracking-widest uppercase">說書人</span>', '<span className="text-lg text-white/70 font-bold tracking-widest uppercase">說書人</span>')
    c = c.replace('<span className="text-sm font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>', '<span className="text-lg font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>')

    # Room info text sizes
    # <span className="text-sm text-white/50 tracking-widest uppercase">Room</span> -> <span className="text-lg text-white/50 tracking-widest uppercase">Room : </span>
    c = c.replace('<span className="text-sm text-white/50 tracking-widest uppercase">Room</span>', '<span className="text-lg text-white/50 tracking-widest uppercase mr-2">Room :</span>')
    
    # 離開房間: text-sm -> text-lg
    c = c.replace('className="w-full text-sm px-4 py-1.5 bg-red-900/80', 'className="w-full text-lg px-4 py-2 bg-red-900/80')

    # Script Name logic
    old_script_btn = r'\{script\?\.name \|\| "未知劇本"\}'
    script_var = 'script'
    c = re.sub(old_script_btn, parse_script_name(script_var), c)
    # also replace the text-sm inside the button to text-lg
    c = c.replace('font-serif transition-colors text-sm truncate px-1"', 'font-serif transition-colors text-lg px-1"')

    # Fix seat tag spacing
    # absolute -bottom-6 -> absolute -bottom-10
    c = c.replace('absolute -bottom-6 left-1/2', 'absolute -bottom-10 left-1/2')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

fix_board_component('src/components/game/Grimoire.tsx')
fix_board_component('src/components/game/CenterStage.tsx')
print("Updated Board text sizing and spacing")
