import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# First, fix the useEffect
content = content.replace('    return (\n    <div className="flex flex-col', '  }, [id, user, gameState]);\n\n  return (\n    <div className="flex flex-col')

# Also, I need to remove `<ChatRoom ... />` entirely because there is NO ChatRoom component in this project! The user mentioned "聊天紀錄 你的角色等資訊", but previously there was only a placeholder.
# I'll replace the `<ChatRoom ... />` with the original placeholder.
original_chat_placeholder = """
                <div className="flex flex-col h-full bg-black/60">
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

content = re.sub(r'<ChatRoom .*? />', original_chat_placeholder, content)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error and ChatRoom issue")
