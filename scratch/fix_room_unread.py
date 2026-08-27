import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add state
text = text.replace(
    '  const [isNightOrderOpen, setNightOrderOpen] = useState(false);',
    '  const [isNightOrderOpen, setNightOrderOpen] = useState(false);\n  const [totalUnreadCount, setTotalUnreadCount] = useState(0);'
)

# Modify drawer button to show badge
bad_button = """              <span className="mb-2 text-lg">遊戲</span>
              <div className="flex flex-col items-center gap-1 text-lg tracking-widest font-serif">
                {(isHost && activeTab === "truth" ? "說書人面板" : "遊戲訊息").split('').map((char, i) => (
                  <span key={i} className="leading-none">{char}</span>
                ))}
              </div>"""

good_button = """              <div className="relative">
                <span className="mb-2 text-lg">遊戲</span>
                {totalUnreadCount > 0 && (
                  <div className="absolute -top-3 -right-3 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-slate-900 shadow-md z-10">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 text-lg tracking-widest font-serif mt-2">
                {(isHost && activeTab === "truth" ? "說書人面板" : "遊戲訊息").split('').map((char, i) => (
                  <span key={i} className="leading-none">{char}</span>
                ))}
              </div>"""

text = text.replace(bad_button, good_button)

# Update Chat component call
bad_chat = "settings={gameState?.public?.settings} />"
good_chat = "settings={gameState?.public?.settings} seatCount={gameState?.public?.seatCount} onUnreadCountChange={setTotalUnreadCount} />"
text = text.replace(bad_chat, good_chat)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
