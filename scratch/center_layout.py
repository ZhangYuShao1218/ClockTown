import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onLeaveRoom?: () => void;', 'onLeaveRoom: () => void;\n  onOpenScriptModal: () => void;')
content = content.replace('distribution \n}: CenterStageProps) => {', 'distribution,\n  onLeaveRoom,\n  onOpenScriptModal\n}: CenterStageProps) => {')

# Find the absolute divs to remove and replace
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
            {script?.name || "未知劇本"}
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative overflow-hidden mb-1">
                    {canSeeBluffs ? (
                      role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      ) : (
                        <span className="text-white/20 text-xs">空</span>
                      )
                    ) : (
                      <span className="text-white/20 text-xl font-bold">?</span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/80 leading-none h-3 truncate w-full text-center">{canSeeBluffs && role ? role.name : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>'''

content = re.sub(r'      {/\* 頂部資訊列 \*/}.*?      </div>\n\n      {/\* 舞台中央 \*/}', right_stack + '\n\n      {/* 舞台中央 */}', content, flags=re.DOTALL)

# Adjust radius
content = content.replace('const radius = 40;', 'const radius = 33;')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated CenterStage UI layout')
