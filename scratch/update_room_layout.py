import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pass hostPlayer to CenterStage
content = content.replace('fabled={gameState.private?.fabled || []}\n          />', 'fabled={gameState.private?.fabled || []}\n            hostPlayer={hostPlayer}\n          />')

# Pass hostPlayer to Grimoire
content = content.replace('onOpenScriptModal={() => setScriptModalOpen(true)}\n              />', 'onOpenScriptModal={() => setScriptModalOpen(true)}\n                hostPlayer={hostPlayer}\n              />')

# Move toggle button to right
top_nav_pattern = r'      \{\/\* Top Left Nav & Drawer Toggle \*\/\}\n      <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 pointer-events-auto">\n        <button \n          onClick=\{\(\) => setIsDrawerOpen\(true\)\}\n          className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold rounded-lg border border-indigo-500/50 shadow-lg backdrop-blur-md transition-all flex items-center space-x-2"\n        >\n          <span>☰</span>\n          <span>\{isHost && activeTab === \'truth\' \? "說書人面板" : "聊天室 & 筆記"\}</span>\n        </button>\n\n        <div className="flex space-x-1 bg-black/60 p-1 rounded-lg border border-white/20 backdrop-blur-md">\n          <button '

new_top_nav = """      {/* Top Left Nav */}
      <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 pointer-events-auto">
        <div className="flex space-x-1 bg-black/60 p-1 rounded-lg border border-white/20 backdrop-blur-md">
          <button """

content = re.sub(top_nav_pattern, new_top_nav, content)

# Add toggle button to top-right (but wait, Drawer is absolute right-0. If Drawer is closed, button is at right-4. If Drawer is open, button could be hidden or stay.)
# Actually, let's put the button in absolute top-4 right-4.
drawer_toggle_btn = """
      {/* Top Right Drawer Toggle */}
      {!isDrawerOpen && (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold rounded-lg border border-indigo-500/50 shadow-lg backdrop-blur-md transition-all flex items-center space-x-2"
          >
            <span>☰</span>
            <span>{isHost && activeTab === 'truth' ? "說書人面板" : "聊天室 & 筆記"}</span>
          </button>
        </div>
      )}
"""

# Insert drawer toggle button right before Main Board Area
content = content.replace('      {/* Main Board Area (100% full screen) */}', drawer_toggle_btn + '\n      {/* Main Board Area (100% full screen) */}')

# Remove drawer overlay
overlay_pattern = r'      \{\/\* Drawer Overlay \*\/\}\n      \{isDrawerOpen && \(\n        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick=\{\(\) => setIsDrawerOpen\(false\)\} />\n      \)\}'
content = re.sub(overlay_pattern, '', content)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Room.tsx layout and props")
