import re

with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Modal call
bad_modal_start = "    <Modal isOpen={isOpen} onClose={onClose} maxWidth=\"max-w-5xl\""
good_modal_start = "    <Modal isOpen={isOpen} onClose={onClose} maxWidth=\"max-w-lg\" noOverlay={noOverlay}"
text = text.replace(bad_modal_start, good_modal_start)

# Hide scrollbar in the container
bad_scroll = "        <div className=\"max-h-[70vh] overflow-y-auto px-2 pb-8\">"
good_scroll = "        <div className=\"max-h-[70vh] overflow-y-auto px-2 pb-8 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]\">"
text = text.replace(bad_scroll, good_scroll)

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
