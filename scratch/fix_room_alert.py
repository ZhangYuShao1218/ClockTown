import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
text = text.replace('import { Chat } from "./Chat";', 'import { Chat } from "./Chat";\nimport { AlertDialog } from "../common/AlertDialog";')

# Add state
text = text.replace('  const [totalUnreadCount, setTotalUnreadCount] = useState(0);', '  const [totalUnreadCount, setTotalUnreadCount] = useState(0);\n  const [isClearDataAlertOpen, setClearDataAlertOpen] = useState(false);')

# Replace confirm
bad_btn = """<button onClick={() => { if(window.confirm('確定要清空所有自行標記的角色與筆記嗎？')) window.dispatchEvent(new CustomEvent('clear-local-notes')); }} className="px-4 py-3 text-red-400 hover:bg-red-500/30 hover:text-red-200 text-center font-bold tracking-widest text-base transition-colors">清空資料</button>"""
good_btn = """{activeTab !== "truth" && (
              <button onClick={() => setClearDataAlertOpen(true)} className="px-4 py-3 text-red-400 hover:bg-red-500/30 hover:text-red-200 text-center font-bold tracking-widest text-base transition-colors">清空資料</button>
            )}"""
text = text.replace(bad_btn, good_btn)

# Add AlertDialog near end
alert_dialog = """
      <AlertDialog 
        isOpen={isClearDataAlertOpen} 
        onClose={() => setClearDataAlertOpen(false)} 
        onConfirm={() => window.dispatchEvent(new CustomEvent('clear-local-notes'))} 
        message="確定要清空所有自行標記的角色與筆記嗎？" 
        showCancel={true} 
      />
    </div>
  );
};
"""
text = text.replace('    </div>\n  );\n};\n', alert_dialog)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
