const fs = require('fs');

let t = fs.readFileSync('src/components/game/CenterStage.tsx', 'utf-8');

// The bluffs tooltip accidentally got ${tooltipClass}
bad_bluff = 'className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left`}';
good_bluff = 'className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left"';

t = t.replace(bad_bluff, good_bluff);

// The seat tooltip still has right-0
bad_seat = '<div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left">\n                          <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />';
good_seat = '<div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>\n                          <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />';

t = t.replace(bad_seat, good_seat);

fs.writeFileSync('src/components/game/CenterStage.tsx', t);
