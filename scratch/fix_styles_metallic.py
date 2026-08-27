import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_styles = """  const pillStyles: Record<string, { outer: string, inner: string }> = {
    'townsfolk': { outer: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]', inner: 'bg-slate-900/95' },
    'outsider': { outer: 'bg-gradient-to-br from-blue-400 from-45% via-red-500 via-80% to-red-700 shadow-[0_0_10px_rgba(96,165,250,0.4)]', inner: 'bg-slate-900/95' },
    'minion': { outer: 'bg-red-800 shadow-[0_0_10px_rgba(153,27,27,0.4)]', inner: 'bg-slate-900/95' },
    'demon': { outer: 'bg-gradient-to-b from-red-400 via-red-700 to-red-950 shadow-[0_0_15px_rgba(220,38,38,0.6)]', inner: 'bg-neutral-900/95 shadow-[inset_0_0_20px_rgba(220,38,38,0.4)]' },
    'info': { outer: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]', inner: 'bg-slate-900/95' }
  };"""

good_styles = """  const pillStyles: Record<string, { outer: string, inner: string }> = {
    'townsfolk': { outer: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]', inner: 'bg-slate-900/95' },
    'outsider': { outer: 'bg-gradient-to-br from-blue-500 from-10% to-red-900 to-90% shadow-[0_0_10px_rgba(96,165,250,0.4)]', inner: 'bg-slate-900/95' },
    'minion': { outer: 'bg-red-800 shadow-[0_0_10px_rgba(153,27,27,0.4)]', inner: 'bg-slate-900/95' },
    'demon': { outer: 'bg-[linear-gradient(135deg,#450a0a_0%,#b91c1c_25%,#fecaca_30%,#dc2626_35%,#7f1d1d_60%,#b91c1c_75%,#fecaca_80%,#991b1b_85%,#450a0a_100%)] shadow-[0_0_15px_rgba(239,68,68,0.6)] ring-1 ring-red-500/30', inner: 'bg-neutral-900/95 shadow-[inset_0_0_25px_rgba(220,38,38,0.5)] border border-red-950/80' },
    'info': { outer: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]', inner: 'bg-slate-900/95' }
  };"""

text = text.replace(bad_styles, good_styles)

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
