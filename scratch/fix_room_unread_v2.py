import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add unread state
text = text.replace(
    '  const [isNightOrderOpen, setNightOrderOpen] = useState(false);',
    '  const [isNightOrderOpen, setNightOrderOpen] = useState(false);\n  const [totalUnreadCount, setTotalUnreadCount] = useState(0);'
)

# Add badge
bad_button = """              <span className="mb-2 text-lg">??/span>
              <div className="flex flex-col items-center gap-1 text-lg tracking-widest font-serif">
                {(isHost && activeTab === "truth" ? "說書人面?? : "?戲訊息").split('').map((char, i) => (
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

text = text.replace('              <span className="mb-2 text-lg">📜</span>\n              <div className="flex flex-col items-center gap-1 text-lg tracking-widest font-serif">\n                {(isHost && activeTab === "truth" ? "說書人面板" : "遊戲訊息").split(\'\').map((char, i) => (\n                  <span key={i} className="leading-none">{char}</span>\n                ))}\n              </div>', good_button)

# Add onUnreadCountChange to Chat
text = text.replace(
    'seatCount={gameState?.public?.seatCount} />',
    'seatCount={gameState?.public?.seatCount} onUnreadCountChange={setTotalUnreadCount} />'
)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
