import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Drawer slide from left
old_drawer = r'<div \n\s*className=\{`absolute top-0 right-0 h-full w-\[350px\] bg-black/90 border-l border-white/20 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col \$\{isDrawerOpen \? \'translate-x-0\' : \'translate-x-full\'\}`\}\n\s*>'
new_drawer = """<div 
        className={`absolute top-0 left-0 h-full w-[350px] bg-black/90 border-r border-white/20 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >"""
c = re.sub(old_drawer, new_drawer, c)

# 2. Drawer Toggle Text and Letter Spacing
old_btn = r'<span className="tracking-widest">\{isHost && activeTab === \'truth\' \? "說書人面板" : "聊天室 & 筆記"\}</span>'
new_btn = '<span style={{ letterSpacing: "0.5em" }}>{isHost && activeTab === "truth" ? "說書人面板" : "遊戲訊息"}</span>'
c = re.sub(old_btn, new_btn, c)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated Room drawer")
