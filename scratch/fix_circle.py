import re

def fix_circle(filepath, is_grimoire=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # 1. Replace the wrapper
    wrapper_start = r'<div className="flex-1 flex items-center justify-center w-full min-h-0 py-16">\s*<div className="relative w-\[95vmin\] max-w-\[1000px\] aspect-square rounded-full border-2 border-white/10 shadow-2xl flex items-center justify-center pointer-events-none mx-auto bg-black/40">\s*<div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />'

    new_wrapper = """<div className="absolute left-[5%] top-[5%] bottom-[5%] right-[22%] flex items-center justify-center pointer-events-none">
        <div className="relative h-full aspect-square flex items-center justify-center pointer-events-none">"""
        
    c = re.sub(wrapper_start, new_wrapper, c)
    
    # 2. Increase seat size: w-24 h-24 -> w-32 h-32 (128px) or w-[15%] aspect-square
    # "座位區 每個座位的大小放大些 當坐位數很多 有需要的時候才會自適應縮小"
    # w-32 h-32 is good for ~10 seats. Let's use `w-[14%] aspect-square`.
    # `w-[14%]` inside a container that is `aspect-square`.
    # Wait, percentage width on absolute element uses parent width. 
    # If the parent is aspect-square, 14% width is responsive.
    c = c.replace('className="absolute w-24 h-24 pointer-events-auto', 'className="absolute w-[16%] aspect-square pointer-events-auto')
    
    # The inner circle border: border-4 -> border-4 (maybe change to relative size? No, it's fine).
    
    # In CenterStage.tsx, the seat radius is currently 42. Since container is now exactly the circle, we want radius to be maybe 42% (to leave 8% margin for the seat itself, 42+8 = 50% = edge).
    # `const radius = 42;` -> wait, earlier I changed it to 42. 42 is perfect.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

fix_circle('src/components/game/Grimoire.tsx', True)
fix_circle('src/components/game/CenterStage.tsx', False)
print("Removed large circle and scaled seats")
