import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_player_ui = """                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/60 shadow-lg overflow-hidden">
                      <span className="text-white/30 text-2xl font-bold">?</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white/50">尚未??</span>
                      <span className="text-base text-white/30 mt-1 capitalize">等?說書?/span>
                    </div>
                  </div>"""

good_player_ui = """                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/60 shadow-lg overflow-hidden shrink-0">
                      {myRoleInfo ? (
                         <img src={`/assets/icons/${myRoleInfo.id}.png`} alt={myRoleInfo.name} className="w-full h-full object-contain p-2" />
                      ) : (
                         <span className="text-white/30 text-2xl font-bold">?</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`text-xl font-bold ${myRoleInfo ? (isEvil ? 'text-red-400' : 'text-blue-300') : 'text-white/50'}`}>
                        {myRoleInfo ? myRoleInfo.name : '尚未分配'}
                      </span>
                      <span className="text-base text-white/30 mt-1 capitalize">
                        {myRoleInfo ? (myRoleInfo.type === 'townsfolk' ? '鎮民' : myRoleInfo.type === 'outsider' ? '外人' : myRoleInfo.type === 'minion' ? '爪牙' : myRoleInfo.type === 'demon' ? '惡魔' : myRoleInfo.type === 'fabled' ? '傳奇' : myRoleInfo.type) : '等待說書人'}
                      </span>
                      {myPlayer?.info && (
                        <div className="mt-2 p-2 bg-black/40 rounded border border-white/10 text-sm text-yellow-100/80 leading-relaxed">
                          {myPlayer.info}
                        </div>
                      )}
                    </div>
                  </div>"""

text = text.replace('                  <div className="flex items-center space-x-4">\n                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/60 shadow-lg overflow-hidden">\n                      <span className="text-white/30 text-2xl font-bold">?</span>\n                    </div>\n                    <div className="flex flex-col">\n                      <span className="text-xl font-bold text-white/50">尚未分配</span>\n                      <span className="text-base text-white/30 mt-1 capitalize">等待說書人</span>\n                    </div>\n                  </div>', good_player_ui)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
