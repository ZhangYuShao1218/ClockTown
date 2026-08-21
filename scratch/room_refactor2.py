import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace everything after `const [activeLocalScriptId...` and before `}`
parts = content.split('  const [activeLocalScriptId, setActiveLocalScriptId] = useState<string | null>(null);')
if len(parts) < 2:
    print("Could not split!")
else:
    head = parts[0] + '  const [activeLocalScriptId, setActiveLocalScriptId] = useState<string | null>(null);\n  const [isDrawerOpen, setIsDrawerOpen] = useState(false);\n'
    
    # We also need to extract `const handleLeave...` etc.
    # Let's just find the `return (`
    return_index = content.find('  return (')
    if return_index == -1:
        print("Could not find return")
    else:
        top_part = content[:return_index]
        top_part = top_part.replace('const [activeTab, setActiveTab] = useState<\'stage\' | \'truth\'>(\'stage\');', 'const [activeTab, setActiveTab] = useState<\'stage\' | \'truth\'>(\'stage\');\n  const [isDrawerOpen, setIsDrawerOpen] = useState(false);')
        
        new_return = """  return (
    <div className="flex flex-col h-screen p-0 bg-black overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm pointer-events-none" />

      {/* Top Left Nav & Drawer Toggle */}
      <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 pointer-events-auto">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold rounded-lg border border-indigo-500/50 shadow-lg backdrop-blur-md transition-all flex items-center space-x-2"
        >
          <span>☰</span>
          <span>{isHost && activeTab === 'truth' ? "說書人面板" : "聊天室 & 筆記"}</span>
        </button>

        <div className="flex space-x-1 bg-black/60 p-1 rounded-lg border border-white/20 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('stage')} 
            className={`px-4 py-1.5 rounded-md font-bold tracking-widest transition-colors text-sm ${activeTab === 'stage' ? 'bg-white/20 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            舞台中央
          </button>
          {isHost && currentScript && (
            <button 
              onClick={() => setActiveTab('truth')} 
              className={`px-4 py-1.5 rounded-md font-bold tracking-widest transition-colors text-sm ${activeTab === 'truth' ? 'bg-red-900/80 text-red-100 shadow-md' : 'text-red-900/50 hover:text-red-200 hover:bg-red-900/30'}`}
            >
              鐘樓真相
            </button>
          )}
        </div>
      </div>

      {/* Main Board Area (100% full screen) */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {activeTab === 'stage' ? (
          <CenterStage 
            roomId={id!}
            seatCount={seatCount}
            seats={seats}
            getPlayerInSeat={getPlayerInSeat}
            handleTakeSeat={handleTakeSeat}
            handleLeaveSeat={handleLeaveSeat}
            userUid={user?.uid}
            script={currentScript}
            bluffs={bluffs}
            canSeeBluffs={canSeeBluffs}
            distribution={gameState.public.distribution || [7,2,2,1]}
            onLeaveRoom={handleLeave}
            onOpenScriptModal={() => setScriptModalOpen(true)}
            fabled={gameState.private?.fabled || []}
          />
        ) : (
          isHost ? (
            currentScript ? (
              <Grimoire 
                roomId={id!}
                script={currentScript}
                seatCount={seatCount}
                grimoireState={gameState.private?.grimoire}
                bluffs={bluffs}
                distribution={gameState.public.distribution || [7,2,2,1]}
                seats={seats}
                getPlayerInSeat={getPlayerInSeat}
                fabled={gameState.private?.fabled || []}
                onLeaveRoom={handleLeave}
                onOpenScriptModal={() => setScriptModalOpen(true)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/50 h-full"><p>真相仍在迷霧之中...</p></div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/50 h-full"><p>僅說書人可見</p></div>
          )
        )}
      </div>

      {/* Right Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-black/95 border-l border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/60">
          <h2 className="text-lg font-bold text-white tracking-widest">{isHost && activeTab === 'truth' ? '說書人設定' : '玩家面板'}</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 flex items-center justify-center w-8 h-8 font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === 'truth' && isHost ? (
            <GrimoireSettings 
              roomId={id!}
              scriptId={gameState.public.scriptId}
              seatCount={seatCount}
              script={currentScript}
              bluffs={bluffs}
              distribution={gameState.public.distribution || [7,2,2,1]}
              grimoireState={gameState.private?.grimoire}
              customScript={gameState.public.customScript}
              activeScriptId={activeScriptId}
              setActiveScriptId={setActiveScriptId}
              settings={gameState.public.settings}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-xl shrink-0">
                <h3 className="text-sm font-bold text-white/50 mb-3 border-b border-white/10 pb-2">你的角色</h3>
                {myRoleInfo ? (
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] shadow-lg overflow-hidden ${isEvil ? 'border-red-500' : 'border-blue-500'}`}>
                      <RoleIcon icon={myRoleInfo.icon} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xl font-bold ${isEvil ? 'text-red-400' : 'text-blue-300'}`}>{myRoleInfo.name}</span>
                      <span className="text-xs text-white/50 mt-1 capitalize">{myRoleInfo.type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/30 text-sm">尚未入座或尚未分配角色</div>
                )}
              </div>
              <div className="flex-1 min-h-0 border border-white/10 rounded-xl overflow-hidden">
                <ChatRoom roomId={id!} userUid={user?.uid} isHost={isHost} players={gameState.public.players} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
      )}

      <ScriptInfoModal isOpen={isScriptModalOpen} onClose={() => setScriptModalOpen(false)} script={currentScript} />
    </div>
  );
};
"""
        with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
            f.write(top_part + new_return)
        
        print('Successfully rewrote Room.tsx')
