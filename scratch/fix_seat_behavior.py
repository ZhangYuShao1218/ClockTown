import re

######################
# RoleSelectionModal.tsx
######################
with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '  selectedFabled?: string[];\n}',
    '  selectedFabled?: string[];\n  noOverlay?: boolean;\n}'
)
text = text.replace(
    "filterType = 'normal', selectedFabled = [] }: RoleSelectionModalProps) => {",
    "filterType = 'normal', selectedFabled = [], noOverlay = false }: RoleSelectionModalProps) => {"
)
text = text.replace(
    '<Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" title={filterType === \'fabled\' ? "選擇傳說角色" : "選擇角色"}>',
    '<Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" title={filterType === \'fabled\' ? "選擇傳說角色" : "選擇角色"} noOverlay={noOverlay}>'
)

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

######################
# Grimoire.tsx
######################
with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove hoveredSeat state
text = text.replace('  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);\n', '')

# Remove hover logic from Seat
bad_seat = """              <div 
                key={seatIndex}
                className={`absolute group transition-all ${hoveredSeat === seatIndex ? 'z-[9999]' : 'z-10'}`}
                style={style}
                onMouseEnter={() => setHoveredSeat(seatIndex)}
                onMouseLeave={() => setHoveredSeat(null)}
                onClick={() => openModal("seat", seatIndex)}
              >"""
good_seat = """              <div 
                key={seatIndex}
                className="absolute group z-10"
                style={style}
                onClick={() => openModal("seat", seatIndex)}
              >"""
text = text.replace(bad_seat, good_seat)

# Remove hover logic from Badges
bad_badge = """              return (
                <div 
                  key={`badge-${seatIndex}`}
                  className={`absolute pointer-events-none ${hoveredSeat === seatIndex ? 'z-[10000]' : 'z-30'}`}
                  style={style}
                >"""
good_badge = """              return (
                <div 
                  key={`badge-${seatIndex}`}
                  className="absolute pointer-events-none z-30"
                  style={style}
                >"""
text = text.replace(bad_badge, good_badge)

# Add noOverlay
text = text.replace(
    '<RoleSelectionModal \n        isOpen={modalOpen} \n        onClose={() => setModalOpen(false)} \n        onSelect={handleModalSelect} \n        script={script || null}\n        filterType={target?.type === \'fabled\' ? \'fabled\' : \'normal\'}\n        selectedFabled={fabled}\n      />',
    '<RoleSelectionModal \n        isOpen={modalOpen} \n        onClose={() => setModalOpen(false)} \n        onSelect={handleModalSelect} \n        script={script || null}\n        filterType={target?.type === \'fabled\' ? \'fabled\' : \'normal\'}\n        selectedFabled={fabled}\n        noOverlay={true}\n      />'
)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


######################
# CenterStage.tsx
######################
with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove hoveredSeat state
text = text.replace('  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);\n', '')

# Remove hover logic from Seat & simplify interior
bad_seat_cs = """              <div 
                key={seatIndex}
                className={`absolute group transition-all ${hoveredSeat === seatIndex ? 'z-[9999]' : 'z-10'}`}
                style={style}
                onMouseEnter={() => setHoveredSeat(seatIndex)}
                onMouseLeave={() => setHoveredSeat(null)}
              >
                {guessedRole && (
                    <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                      <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                    </div>
                )}
                <div 
                  className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden ${
                    isEmpty ? 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5 cursor-pointer pointer-events-auto' 
                            : guessedRole 
                                ? (isEvil ? 'border-red-900 bg-black/90 cursor-pointer pointer-events-auto' : 'border-blue-900 bg-black/90 cursor-pointer pointer-events-auto')
                                : 'border-white/30 bg-black/80 hover:border-white/50 cursor-pointer pointer-events-auto'
                  }`}
                  onClick={() => {
                    if (isEmpty) {
                      handleTakeSeat(seatIndex);
                    } else {
                      setTargetSeat(seatIndex);
                      setModalOpen(true);
                    }
                  }}
                >
                  {isEmpty ? (
                    <span className="text-3xl text-white/20 font-bold">{seatIndex}</span>
                  ) : (
                    <>
                      {player.uid === userUid && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                      )}

                      {guessedRole ? (
                        <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                           <div className="w-full h-[70%] relative mt-2">
                             <RoleIcon icon={guessedRole.icon} className={`w-full h-full object-contain ${isDead ? 'opacity-40 grayscale sepia' : ''}`} />
                           </div>
                           <div className="absolute inset-0 pointer-events-none">
                             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                               <path id={`curve-${seatIndex}`} d="M 15 78 A 43 43 0 0 0 85 78" fill="transparent" />
                               <text fill="rgba(80,50,20,0.9)" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                                 <textPath href={`#curve-${seatIndex}`} startOffset="50%">
                                   {guessedRole.name}
                                 </textPath>
                               </text>
                             </svg>
                           </div>
                        </div>
                      ) : (
                        <span className="text-white/20 text-3xl font-bold">{seatIndex}</span>
                      )}
                      
                      {isDead && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-20 h-1 bg-red-600/80 rotate-45 absolute shadow-lg" />
                          <div className="w-20 h-1 bg-red-600/80 -rotate-45 absolute shadow-lg" />
                        </div>
                      )}

                      {player.uid === userUid && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-auto">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLeaveSeat(); }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded shadow-lg"
                          >
                            離開座位
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>"""

good_seat_cs = """              <div 
                key={seatIndex}
                className="absolute group z-10"
                style={style}
              >
                {guessedRole && (
                    <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                      <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                    </div>
                )}
                <div 
                  className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${
                    guessedRole 
                      ? (isEvil ? 'border-red-900 bg-black/90' : 'border-blue-900 bg-black/90')
                      : 'border-white/30 bg-black/80 hover:border-white/50'
                  }`}
                  onClick={() => {
                    setTargetSeat(seatIndex);
                    setModalOpen(true);
                  }}
                >
                  {player && player.uid === userUid && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                  )}

                  {guessedRole ? (
                    <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                        <div className="w-full h-[70%] relative mt-2">
                          <RoleIcon icon={guessedRole.icon} className={`w-full h-full object-contain ${isDead ? 'opacity-40 grayscale sepia' : ''}`} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                            <path id={`curve-${seatIndex}`} d="M 15 78 A 43 43 0 0 0 85 78" fill="transparent" />
                            <text fill="rgba(80,50,20,0.9)" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                              <textPath href={`#curve-${seatIndex}`} startOffset="50%">
                                {guessedRole.name}
                              </textPath>
                            </text>
                          </svg>
                        </div>
                    </div>
                  ) : (
                    <span className="text-white/20 text-3xl font-bold">{seatIndex}</span>
                  )}
                  
                  {isDead && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-20 h-1 bg-red-600/80 rotate-45 absolute shadow-lg" />
                      <div className="w-20 h-1 bg-red-600/80 -rotate-45 absolute shadow-lg" />
                    </div>
                  )}
                </div>
              </div>"""

text = text.replace(bad_seat_cs, good_seat_cs)

# Update badges loop hover state
text = re.sub(
    r'className=\{`absolute pointer-events-none \$\{hoveredSeat === seatIndex \? \'z-\[10000\]\' : \'z-30\'\}`\}',
    r'className="absolute pointer-events-none z-30"',
    text
)

# Update Nameplates
bad_nameplate = """              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-none"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center">
                  <span className="text-white font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border border-white/30 shadow-[0_0_10px_rgba(0,0,0,1)]">
                    {player ? player.name : `座位 ${seatIndex}`}
                  </span>
                </div>
              </div>"""

good_nameplate = """              <div 
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

text = text.replace(bad_nameplate, good_nameplate)

# Add noOverlay
text = text.replace(
    '<RoleSelectionModal \n        isOpen={modalOpen}\n        onClose={() => setModalOpen(false)}\n        onSelect={handleModalSelect}\n        script={script || null}\n      />',
    '<RoleSelectionModal \n        isOpen={modalOpen}\n        onClose={() => setModalOpen(false)}\n        onSelect={handleModalSelect}\n        script={script || null}\n        noOverlay={true}\n      />'
)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
