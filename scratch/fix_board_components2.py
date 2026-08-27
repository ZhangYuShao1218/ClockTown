import re

def fix_board_component(filepath, is_grimoire=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    return_index = c.find('  return (')
    if return_index == -1:
        return
        
    top_part = c[:return_index]

    if is_grimoire:
        bluff_render = """{role ? (
                      <>
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                        <button onClick={(e) => { e.stopPropagation(); setGrimoireBluff(roomId, i, null); }} className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                      </>
                    ) : <span className="text-white/20 text-xs">空</span>}"""
        bluff_name = '{role ? role.name : ""}'
        bluff_onclick = 'onClick={() => openModal("bluff", i)}'
        bluff_cursor = 'cursor-pointer group'
        fabled_onclick = 'onClick={() => openModal("fabled")}'
        fabled_title = '傳奇角色 (點擊新增)'
        fabled_hover = 'cursor-pointer hover:border-yellow-500/60 transition-colors'
        remove_fabled = 'onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}'
        remove_overlay = '<div className="absolute inset-0 bg-red-900/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</div>'
        group_cursor = 'group cursor-pointer'
        seat_onClick = 'onClick={() => openModal("seat", seatIndex)}'
        seat_hover = 'cursor-pointer transition-transform hover:scale-105 group'
        seat_content = """{role ? (
                       <>
                         <RoleIcon icon={role.icon} className={`w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] ${isDead ? 'opacity-40 grayscale sepia' : ''}`} />
                         {isDead && (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-16 h-1 bg-red-600/80 rotate-45 absolute" />
                             <div className="w-16 h-1 bg-red-600/80 -rotate-45 absolute" />
                           </div>
                         )}
                       </>
                     ) : (
                       <span className="text-white/20 text-3xl font-bold">{seatIndex}</span>
                     )}"""
        seat_color = "${roleId ? (isEvil ? 'border-red-900 hover:border-red-500' : 'border-blue-900 hover:border-blue-500') : 'border-white/20 hover:border-white/50'}"
        seat_vars = 'const roleId = grimoireState?.[seatIndex]?.roleId;\n            const role = roleId ? script.roles.find(r => r.id === roleId) : null;\n            const isEvil = role?.type === "demon" || role?.type === "minion";\n            const isDead = (grimoireState?.[seatIndex] as any)?.isDead || false;'
        modal_str = """<RoleSelectionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleModalSelect}
        script={script}
      />"""
    else:
        bluff_render = """{canSeeBluffs ? (
                      role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      ) : (
                        <span className="text-white/20 text-xs">空</span>
                      )
                    ) : (
                      <span className="text-white/20 text-xl font-bold">?</span>
                    )}"""
        bluff_name = '{canSeeBluffs && role ? role.name : ""}'
        bluff_onclick = ''
        bluff_cursor = ''
        fabled_onclick = ''
        fabled_title = '傳奇角色'
        fabled_hover = ''
        remove_fabled = ''
        remove_overlay = ''
        group_cursor = ''
        seat_onClick = "onClick={() => userUid ? openNoteModal(seatIndex) : null}"
        seat_hover = "cursor-pointer group"
        seat_content = """{guessedRole ? (
                     <div className="w-full h-full relative">
                        <span className="absolute inset-0 flex items-center justify-center text-white/20 text-5xl font-bold font-serif opacity-30">{seatIndex}</span>
                        <RoleIcon icon={guessedRole.icon} className={`w-full h-full object-cover mix-blend-screen opacity-70 filter brightness-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] ${isDead ? 'opacity-40 grayscale' : ''}`} />
                     </div>
                   ) : (
                     <span className="text-white/20 text-5xl font-bold font-serif">{seatIndex}</span>
                   )}
                   {isDead && (
                     <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                       <div className="w-20 h-1 bg-red-600/80 rotate-45 absolute shadow-lg" />
                       <div className="w-20 h-1 bg-red-600/80 -rotate-45 absolute shadow-lg" />
                     </div>
                   )}"""
        seat_color = "${guessedRole ? 'border-indigo-500/50 hover:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-white/20 hover:border-white/50'}"
        seat_vars = 'const isDead = stageState?.[seatIndex]?.isDead || false;\n            const guessedRoleId = seatRoleNotes[seatIndex] || null;\n            const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;'
        modal_str = """{userUid && (
        <SeatNoteModal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          seatIndex={selectedSeat}
          currentNote={selectedSeat ? seatRoleNotes[selectedSeat] : null}
          onSave={handleSaveNote}
          script={script}
        />
      )}"""

    new_return = (
        '  return (\n'
        '    <div className="flex-1 flex flex-col relative overflow-hidden h-full">\n'
        '      \n'
        '      {/* 右側浮動資訊柱 (佔據 20% 寬度) */}\n'
        '      <div className="absolute right-0 top-16 bottom-4 flex flex-col space-y-4 items-end pointer-events-none z-20 overflow-y-auto no-scrollbar pb-6 w-[20%] pr-4 pl-4">\n'
        '        \n'
        '        {/* 陣營人數 */}\n'
        '        <div className="bg-black/60 border-2 border-white/40 rounded-xl py-2 px-3 shadow-lg pointer-events-auto backdrop-blur-md w-full">\n'
        '          <div className="flex justify-between text-center px-1">\n'
        '            <div><div className="text-[10px] font-bold text-blue-300">村民</div><div className="text-base font-bold text-white">{t}</div></div>\n'
        '            <div><div className="text-[10px] font-bold text-blue-300">外來</div><div className="text-base font-bold text-white">{o}</div></div>\n'
        '            <div><div className="text-[10px] font-bold text-red-400">爪牙</div><div className="text-base font-bold text-white">{m}</div></div>\n'
        '            <div><div className="text-[10px] font-bold text-red-400">惡魔</div><div className="text-base font-bold text-white">{d}</div></div>\n'
        '          </div>\n'
        '        </div>\n'
        '\n'
        '        {/* 惡魔的偽裝 (放大圈圈，間距 10px) */}\n'
        '        <div className="flex flex-col items-center space-y-3 pointer-events-auto bg-black/60 border border-rose-900/80 p-3 rounded-xl shadow-lg backdrop-blur-md w-full">\n'
        '          <h3 className="text-sm font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>\n'
        '          <div className="flex justify-center w-full" style={{ gap: \'10px\' }}>\n'
        '            {[0, 1, 2].map(i => {\n'
        '              const roleId = bluffs[i];\n'
        '              const role = roleId ? script?.roles.find(r => r.id === roleId) : null;\n'
        '              return (\n'
        '                <div key={i} className="flex flex-col items-center flex-1">\n'
        '                  <div \n'
        '                    ' + bluff_onclick + '\n'
        '                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative overflow-hidden mb-1 ' + bluff_cursor + '`}\n'
        '                  >\n'
        '                    ' + bluff_render + '\n'
        '                  </div>\n'
        '                  <span className="text-[10px] text-white/80 leading-none h-3 truncate w-full text-center">' + bluff_name + '</span>\n'
        '                </div>\n'
        '              );\n'
        '            })}\n'
        '          </div>\n'
        '        </div>\n'
        '\n'
        '        {/* 傳奇角色 */}\n'
        '        <div \n'
        '          className="bg-black/60 border border-yellow-500/30 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col pointer-events-auto w-full ' + fabled_hover + '"\n'
        '          ' + fabled_onclick + '\n'
        '        >\n'
        '          <h3 className="text-[10px] font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest">' + fabled_title + '</h3>\n'
        '          <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">\n'
        '            {fabled.length > 0 ? fabled.map(fId => {\n'
        '              const role = Object.values(AllRoles).find(r => r.id === fId);\n'
        '              if (!role) return null;\n'
        '              return (\n'
        '                <div key={fId} className={`relative w-10 h-10 ' + group_cursor + '`} ' + remove_fabled + '>\n'
        '                  <RoleIcon icon={role.icon} className="w-full h-full rounded-full border border-yellow-500/50 shadow-md bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />\n'
        '                  ' + remove_overlay + '\n'
        '                </div>\n'
        '              );\n'
        '            }) : (\n'
        '              <span className="text-white/30 text-xs my-auto">無傳奇角色</span>\n'
        '            )}\n'
        '          </div>\n'
        '        </div>\n'
        '        \n'
        '        {/* 向下推到底部的 Spacer */}\n'
        '        <div className="flex-1" />\n'
        '\n'
        '        {/* 說書人標誌 (移到房間資訊上方) */}\n'
        '        <div className="bg-black/60 border border-white/20 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex items-center justify-center w-full space-x-3 mt-auto">\n'
        '           <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">\n'
        '             <span className="text-white font-serif font-bold">ST</span>\n'
        '           </div>\n'
        '           <div className="flex flex-col items-start overflow-hidden w-full">\n'
        '             <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase">說書人</span>\n'
        '             <span className="text-sm font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>\n'
        '           </div>\n'
        '        </div>\n'
        '\n'
        '        {/* 房間資訊 */}\n'
        '        <div className="bg-black/60 border-2 border-white/20 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center w-full space-y-3">\n'
        '          <div className="flex justify-between w-full items-center">\n'
        '            <span className="text-sm text-white/50 tracking-widest uppercase">Room</span>\n'
        '            <span className="font-mono text-white text-lg font-bold">{roomId}</span>\n'
        '          </div>\n'
        '          <button \n'
        '            onClick={onOpenScriptModal}\n'
        '            className="w-full py-1.5 bg-black/80 border border-white/30 text-yellow-400 hover:text-white hover:bg-white/10 rounded-lg shadow-md font-bold font-serif transition-colors text-sm truncate px-1"\n'
        '          >\n'
        '            {script?.name || "未知劇本"}\n'
        '          </button>\n'
        '          <button onClick={onLeaveRoom} className="w-full text-sm px-4 py-1.5 bg-red-900/80 hover:bg-red-800/90 border border-red-500/50 text-red-200 rounded-md transition-colors font-bold">\n'
        '            離開房間\n'
        '          </button>\n'
        '        </div>\n'
        '      </div>\n'
        '\n'
        '      {/* 座位區 (左側 80% 置中計算，保留 5% 邊距，無底盤) */}\n'
        '      <div className="absolute left-0 top-0 bottom-0 w-[80%] flex items-center justify-center pointer-events-none p-[5%]">\n'
        '        <div className="relative w-full h-full max-w-[85vh] max-h-[85vh] aspect-square flex items-center justify-center pointer-events-none">\n'
        '          {seats.map((seatIndex) => {\n'
        '            const player = getPlayerInSeat(seatIndex);\n'
        '            const style = getSeatStyle(seatIndex);\n'
        '            ' + seat_vars + '\n'
        '\n'
        '            return (\n'
        '              <div \n'
        '                key={seatIndex} \n'
        '                className={`absolute w-28 h-28 lg:w-32 lg:h-32 pointer-events-auto ' + seat_hover + '`}\n'
        '                style={style}\n'
        '                ' + seat_onClick + '\n'
        '              >\n'
        '                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ' + seat_color + '`}>\n'
        '                   ' + seat_content + '\n'
        '                </div>\n'
        '                \n'
        '                {/* 玩家名稱標籤 */}\n'
        '                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">\n'
        '                   <div className="bg-black/90 px-4 py-1.5 rounded-full border border-white/20 text-xs text-white shadow-xl font-bold">\n'
        '                     {player ? player.name : `座位 ${seatIndex}`}\n'
        '                   </div>\n'
        '                </div>\n'
        '              </div>\n'
        '            );\n'
        '          })}\n'
        '        </div>\n'
        '      </div>\n'
        '\n'
        '      ' + modal_str + '\n'
        '    </div>\n'
        '  );\n'
        '};\n'
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(top_part + new_return)

fix_board_component('src/components/game/Grimoire.tsx', True)
fix_board_component('src/components/game/CenterStage.tsx', False)
print("Updated Board Components successfully")
