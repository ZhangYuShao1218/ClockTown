import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

placeholder = """
              <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-xl shrink-0">
                <h3 className="text-sm font-bold text-white/50 mb-3 border-b border-white/10 pb-2">你的角色</h3>
                {isHost ? (
                  <div className="bg-indigo-900/50 text-indigo-200 p-3 rounded text-sm text-center font-medium border border-indigo-500/30">
                    你是說書人，掌控全域。
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/80 shadow-lg overflow-hidden">
                      <span className="text-white/30 text-2xl font-bold">?</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white/50">尚未分配</span>
                      <span className="text-xs text-white/30 mt-1 capitalize">等待說書人</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 border border-white/10 rounded-xl overflow-hidden flex flex-col bg-black/60">
                  <div className="p-3 border-b border-white/10 bg-white/5">
                    <h2 className="text-xs uppercase tracking-wider font-semibold text-white/50">系統訊息與私訊</h2>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    <div className="text-xs text-center text-white/30">遊戲尚未開始 (此處預留復盤系統與私訊)</div>
                  </div>
                  <div className="p-3 border-t border-white/10 bg-black/80">
                    <input 
                      type="text" 
                      placeholder="發送文字..." 
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-white/20"
                      disabled
                    />
                  </div>
              </div>
"""

# Replace the incorrect block inside activeTab === 'truth'
# I'll use regex to match from `<div className="mb-6 p-4` down to `</ChatRoom>` or similar.
# Wait, my previous script put `<div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-xl shrink-0">...`
match_pattern = r'<div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-xl shrink-0">.*?</ChatRoom>\n\s*</div>\n\s*</div>'
content = re.sub(match_pattern, placeholder, content, flags=re.DOTALL)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed variables in Room.tsx")
