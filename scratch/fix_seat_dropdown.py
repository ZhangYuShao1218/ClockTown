import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add activeDropdownSeat state
if 'activeDropdownSeat' not in text:
    text = text.replace(
        '  const [seatNotes, setSeatNotes] = useState<Record<number, string>>({});',
        '  const [seatNotes, setSeatNotes] = useState<Record<number, string>>({});\n  const [activeDropdownSeat, setActiveDropdownSeat] = useState<number | null>(null);\n\n  useEffect(() => {\n    const handleGlobalClick = () => setActiveDropdownSeat(null);\n    window.addEventListener(\'click\', handleGlobalClick);\n    return () => window.removeEventListener(\'click\', handleGlobalClick);\n  }, []);'
    )

# Replace the nameplate block
bad_nameplate = """              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-none"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex items-center justify-center space-x-2 pointer-events-auto">
                  <span className="text-white font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border border-white/30 shadow-[0_0_10px_rgba(0,0,0,1)]">
                    {seatIndex}. {player ? player.name : '空座位'}
                  </span>
                  
                  {!player && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTakeSeat(seatIndex); }}
                      className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-500 border border-blue-400 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                      title="坐下"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  )}
                  {player && player.uid === userUid && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLeaveSeat(); }}
                      className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 border border-red-400 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                      title="起身"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>"""

good_nameplate = """              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-auto"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex flex-col items-center justify-center">
                  <div 
                    className="cursor-pointer text-white font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border border-white/30 shadow-[0_0_10px_rgba(0,0,0,1)] hover:bg-black hover:border-white/50 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownSeat(activeDropdownSeat === seatIndex ? null : seatIndex); }}
                  >
                    {seatIndex}. {player ? player.name : '空座位'}
                  </div>
                  
                  {activeDropdownSeat === seatIndex && (
                    <div className="absolute top-full mt-1 w-24 bg-slate-900 border border-slate-600 rounded-md shadow-xl overflow-hidden z-[100]">
                      {player && player.uid === userUid ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleLeaveSeat(); setActiveDropdownSeat(null); }}
                          className="w-full px-4 py-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm font-bold text-center transition-colors border-none"
                        >
                          起身
                        </button>
                      ) : !player ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTakeSeat(seatIndex); setActiveDropdownSeat(null); }}
                          className="w-full px-4 py-2 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 text-sm font-bold text-center transition-colors border-none"
                        >
                          坐下
                        </button>
                      ) : (
                        <button disabled className="w-full px-4 py-2 text-gray-500 bg-gray-800 text-sm font-bold text-center cursor-not-allowed border-none">
                          已入座
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>"""

if bad_nameplate in text:
    text = text.replace(bad_nameplate, good_nameplate)
else:
    print('Could not find bad nameplate')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
