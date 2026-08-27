import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the seat map wrapper to add `x`, `y`, `tooltipClass` and Night Order Badges + Tooltips
seat_target = """          {seats.map((seatIndex) => {
            const style = getSeatStyle(seatIndex);
            
            const roleId = grimoireState?.[seatIndex]?.roleId;
            const isDead = (grimoireState?.[seatIndex] as any)?.isDead;
            const role = roleId ? script.roles.find(r => r.id === roleId) : null;
            const isEvil = role?.type === "demon" || role?.type === "minion";

            return (
              <div 
                key={seatIndex} 
                className={`absolute pointer-events-auto cursor-pointer group z-10`}
                style={style}
                onClick={() => openModal("seat", seatIndex)}
              >
                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""

seat_replacement = """          {seats.map((seatIndex) => {
            const style = getSeatStyle(seatIndex);
            
            const roleId = grimoireState?.[seatIndex]?.roleId;
            const isDead = (grimoireState?.[seatIndex] as any)?.isDead;
            const role = roleId ? script.roles.find(r => r.id === roleId) : null;
            const isEvil = role?.type === "demon" || role?.type === "minion";

            const angleDeg = (seatIndex / seatCount) * 360 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = 50 + 45 * Math.cos(angleRad);
            const y = 50 + 45 * Math.sin(angleRad);
            
            let tooltipClass = "top-[110%] mt-2 ";
            if (y > 75) tooltipClass = "bottom-[110%] mb-2 ";
            
            if (x < 25) tooltipClass += "left-0";
            else if (x > 75) tooltipClass += "right-0";
            else tooltipClass += "left-1/2 -translate-x-1/2";

            return (
              <div 
                key={seatIndex} 
                className={`absolute pointer-events-auto cursor-pointer group z-10 hover:z-[9999]`}
                style={style}
                onClick={() => openModal("seat", seatIndex)}
              >
                {role && (() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === role.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === role.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {otherNum}
                          </div>
                        )}
                        <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                          <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                        </div>
                      </>
                    );
                })()}
                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""

text = text.replace(seat_target, seat_replacement)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
