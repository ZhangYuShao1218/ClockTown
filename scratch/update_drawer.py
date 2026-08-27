import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Update Drawer Toggle Button to be left-middle bookmark
old_drawer_btn = r'\{\/\* Top Right Drawer Toggle \*\/\}\n      \{\!isDrawerOpen && \(\n        <div className="absolute top-4 right-4 z-50 pointer-events-auto">\n          <button \n            onClick=\{\(\) => setIsDrawerOpen\(true\)\}\n            className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold rounded-lg border border-indigo-500/50 shadow-lg backdrop-blur-md transition-all flex items-center space-x-2"\n          >\n            <span>☰</span>\n            <span>\{isHost && activeTab === \'truth\' \? "說書人面板" : "聊天室 & 筆記"\}</span>\n          </button>\n        </div>\n      \)\}'

new_drawer_btn = """{/* Left Middle Drawer Toggle (Bookmark) */}
      {!isDrawerOpen && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 z-50 pointer-events-auto">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="py-4 px-2 bg-indigo-900/90 hover:bg-indigo-800 text-indigo-100 font-bold rounded-r-xl border-y border-r border-indigo-500/50 shadow-2xl backdrop-blur-md transition-all flex items-center justify-center writing-vertical-lr"
            style={{ writingMode: 'vertical-lr' }}
          >
            <span className="mb-2 text-lg">☰</span>
            <span className="tracking-widest">{isHost && activeTab === 'truth' ? "說書人面板" : "聊天室 & 筆記"}</span>
          </button>
        </div>
      )}"""

c = re.sub(old_drawer_btn, new_drawer_btn, c)

# Ensure left navigation (Top Left) doesn't have the drawer toggle anymore (I already removed it, but let's double check)
# It was already removed.

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated Room drawer toggle")
