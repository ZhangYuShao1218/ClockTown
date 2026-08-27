import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_demon = "'demon': { outer: 'bg-[linear-gradient(135deg,#450a0a_0%,#b91c1c_25%,#fecaca_30%,#dc2626_35%,#7f1d1d_60%,#b91c1c_75%,#fecaca_80%,#991b1b_85%,#450a0a_100%)] shadow-[0_0_15px_rgba(239,68,68,0.6)] ring-1 ring-red-500/30', inner: 'bg-neutral-900/95 shadow-[inset_0_0_25px_rgba(220,38,38,0.5)] border border-red-950/80' },"

good_demon = "'demon': { outer: 'bg-[linear-gradient(135deg,#7f1d1d_0%,#ef4444_25%,#fef08a_40%,#ffffff_50%,#fef08a_60%,#ef4444_75%,#7f1d1d_100%)] shadow-[0_0_20px_rgba(239,68,68,0.8)] ring-1 ring-red-500/50', inner: 'bg-neutral-900/95 shadow-[inset_0_0_25px_rgba(239,68,68,0.7)]' },"

text = text.replace(bad_demon, good_demon)

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
