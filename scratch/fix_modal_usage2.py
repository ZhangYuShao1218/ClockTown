with open('src/components/common/Modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('className="w-full ${maxWidth} rounded-md border-2 border-white/30 bg-black/95 backdrop-blur-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"', 'className={`w-full ${maxWidth} rounded-md border-2 border-white/30 bg-black/95 backdrop-blur-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200`}')
c = c.replace('onClick={(e) => e.stopPropagation()}`', 'onClick={(e) => e.stopPropagation()}')

with open('src/components/common/Modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
