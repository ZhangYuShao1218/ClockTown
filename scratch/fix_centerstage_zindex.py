import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix Bluffs
bluff_target = """                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full aspect-square max-w-[84px] rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group hover:scale-105 hover:border-red-400 transition-all"
                  >
                    {canSeeBluffs ? (
                      role ? (
                        <>
                          <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                            <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                          </div>
                        </>
                      ) : (
                        <span className="text-white/20 text-xs">空</span>
                      )
                    ) : (
                      <span className="text-white/20 text-xl font-bold">?</span>
                    )}
                  </div>"""

bluff_replacement = """                <div key={i} className="flex flex-col items-center flex-1 group relative">
                  <div 
                    className="w-full aspect-square max-w-[84px] rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 group-hover:border-red-400 transition-all"
                  >
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
                  {canSeeBluffs && role && (
                    <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                  )}"""

text = text.replace(bluff_target, bluff_replacement)


# 2. Fix Fabled
fabled_target = """                  <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%]">
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group hover:scale-105 hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                    <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                  </div>
                    </div>"""

fabled_replacement = """                  <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%] group relative">
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                    </div>
                    <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>"""

text = text.replace(fabled_target, fabled_replacement)


# 3. Fix Seats
seat_target_1 = """              <div 
                key={seatIndex}
                className="absolute group z-10"
                style={style}
              >
                <div 
                  className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden ${"""

seat_replacement_1 = """              <div 
                key={seatIndex}
                className="absolute group z-10"
                style={style}
              >
                {guessedRole && (() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {otherNum}
                          </div>
                        )}
                        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">
                          <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                        </div>
                      </>
                    );
                })()}
                <div 
                  className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden ${"""

text = text.replace(seat_target_1, seat_replacement_1)


seat_target_2 = """                      {guessedRole ? (
                        <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                  <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none cursor-default text-left">
                    <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                  </div>
                  {(() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-400 text-white flex items-center justify-center font-bold shadow-lg z-20">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-400 text-white flex items-center justify-center font-bold shadow-lg z-20">
                            {otherNum}
                          </div>
                        )}
                      </>
                    );
                  })()}"""

seat_replacement_2 = """                      {guessedRole ? (
                        <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">"""

text = text.replace(seat_target_2, seat_replacement_2)


with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
