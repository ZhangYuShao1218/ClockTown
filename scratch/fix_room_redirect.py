import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

redirect_logic = """  useEffect(() => {
    const hasName = !!localStorage.getItem("botc_player_name");
    if (!hasName && id) {
      navigate(`/?returnUrl=/room/${id}`);
    }
  }, [navigate, id]);"""

text = text.replace('  const [isClearDataAlertOpen, setClearDataAlertOpen] = useState(false);\n\n  useEffect(() => {', '  const [isClearDataAlertOpen, setClearDataAlertOpen] = useState(false);\n\n' + redirect_logic + '\n\n  useEffect(() => {')

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
