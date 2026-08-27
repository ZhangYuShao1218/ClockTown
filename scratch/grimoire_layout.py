import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add props to interface
content = content.replace('fabled?: string[];', 'fabled?: string[];\n  onLeaveRoom: () => void;\n  onOpenScriptModal: () => void;')
content = content.replace('fabled = [] }: GrimoireProps) => {', 'fabled = [], onLeaveRoom, onOpenScriptModal }: GrimoireProps) => {')

# Find the components to stack:
# Distribution, Bluffs, Fabled, Storyteller (already right-side, wait ST is not rendered in Grimoire? Grimoire is only for ST! But wait, ST indicator is for players. Ah, CenterStage has "ST indicator", Grimoire does not? Let me check CenterStage)
# Actually, the user says "從上到下 我希望看到的是 陣營人數 惡魔偽裝 傳奇角色 說書人". 
# The Storyteller indicator (Left-Bottom ST badge in CenterStage) should be moved to the right stack.
# In Grimoire, ST indicator doesn't exist, but maybe it should? The user said "均改到 右側".

right_stack = '''      {/* 右側浮動資訊柱 */}
      <div className="absolute right-4 top-4 bottom-4 flex flex-col space-y-4 items-end pointer-events-none z-20 overflow-y-auto no-scrollbar pb-20 w-64 pr-2">
        
        {/* 房間資訊 (原頁首) */}
        <div className="bg-black/60 border-2 border-white/20 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center w-full space-y-3">
          <div className="flex justify-between w-full items-center">
            <span className="text-xs text-white/50 tracking-widest uppercase">Room</span>
            <span className="font-mono text-white font-bold">{roomId}</span>
          </div>
          <button 
            onClick={onOpenScriptModal}
            className="w-full py-1.5 bg-black/80 border border-white/30 text-yellow-400 hover:text-white hover:bg-white/10 rounded-lg shadow-md font-bold font-serif transition-colors text-sm"
          >
            {script.name}
          </button>
          <button onClick={onLeaveRoom} className="w-full text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800/90 border border-red-500/50 text-red-200 rounded-md transition-colors font-bold">
            離開房間
          </button>
        </div>

        {/* 陣營人數 */}
        <div className="bg-black/60 border-2 border-white/40 rounded-xl py-2 px-3 shadow-lg pointer-events-auto backdrop-blur-md w-full">
          <div className="flex justify-between text-center px-1">
            <div><div className="text-[10px] font-bold text-blue-300">村民</div><div className="text-base font-bold text-white">{t}</div></div>
            <div><div className="text-[10px] font-bold text-blue-300">外來</div><div className="text-base font-bold text-white">{o}</div></div>
            <div><div className="text-[10px] font-bold text-red-400">爪牙</div><div className="text-base font-bold text-white">{m}</div></div>
            <div><div className="text-[10px] font-bold text-red-400">惡魔</div><div className="text-base font-bold text-white">{d}</div></div>
          </div>
        </div>

        {/* 惡魔的偽裝 */}
        <div className="flex flex-col items-center space-y-3 pointer-events-auto bg-black/60 border border-rose-900/80 p-3 rounded-xl shadow-lg backdrop-blur-md w-full">
          <h3 className="text-sm font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>
          <div className="flex space-x-2 justify-center w-full">
            {[0, 1, 2].map(i => {
              const roleId = bluffs[i];
              const role = roleId ? script?.roles.find(r => r.id === roleId) : null;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    onClick={() => openModal("bluff", i)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative cursor-pointer group overflow-hidden mb-1"
                  >
                    {role ? (
                      <>
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                        <button onClick={(e) => { e.stopPropagation(); setGrimoireBluff(roomId, i, null); }} className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </>
                    ) : <span className="text-white/20 text-xs">空</span>}
                  </div>
                  <span className="text-[10px] text-white/80 leading-none h-3 truncate w-full text-center">{role ? role.name : ""}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳奇角色 */}
        <div 
          className="bg-black/60 border border-yellow-500/30 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col cursor-pointer hover:border-yellow-500/60 transition-colors pointer-events-auto w-full"
          onClick={() => openModal("fabled")}
        >
          <h3 className="text-[10px] font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest">傳奇角色 (點擊新增)</h3>
          <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
            {fabled.length > 0 ? fabled.map(fId => {
              const role = AllRoles.find(r => r.id === fId);
              if (!role) return null;
              return (
                <div key={fId} className="relative w-10 h-10 group cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}>
                  <RoleIcon icon={role.icon} className="w-full h-full rounded-full border border-yellow-500/50 shadow-md bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                  <div className="absolute inset-0 bg-red-900/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</div>
                </div>
              );
            }) : (
              <span className="text-white/30 text-xs my-auto">無傳奇角色</span>
            )}
          </div>
        </div>
        
        {/* 說書人標誌 (補上讓兩邊排版一致) */}
        <div className="bg-black/60 border border-white/20 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex items-center justify-center w-full space-x-3">
           <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
             <span className="text-white font-serif font-bold">ST</span>
           </div>
           <span className="text-xs text-white/70 font-bold tracking-widest">說書人</span>
        </div>
      </div>'''

# Replace old absolute divs
content = re.sub(r'      {/\* 頂部資訊列 \*/}.*?      </div>\n\n      {/\* 傳奇角色 \*/}.*?      </div>\n\n      <div className="flex-1', right_stack + '\n\n      <div className="flex-1', content, flags=re.DOTALL)

# Adjust radius
content = content.replace('const radius = 40;', 'const radius = 33;')

# Also fix the seat hover to match CenterStage (which is empty seat hover)
seat_wrapper_old = "className={`w-full aspect-square border-4 ${roleInfo ? (isEvil ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer' : 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer') : 'border-dashed border-white/20 bg-black/40'} rounded-full flex flex-col items-center justify-center transition-colors overflow-hidden relative`}"
seat_wrapper_new = "className={`w-full aspect-square border-4 ${roleInfo ? (isEvil ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer' : 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer') : 'border-dashed border-white/30 bg-black/60 hover:bg-white/20 hover:border-white/50 cursor-pointer'} rounded-full flex flex-col items-center justify-center transition-colors overflow-hidden relative`}"
content = content.replace(seat_wrapper_old, seat_wrapper_new)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Grimoire UI layout')
