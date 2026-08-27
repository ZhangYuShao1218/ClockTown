import re

with open('src/components/layout/Lobby.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add useLocation
text = text.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate, useLocation } from "react-router-dom";')
text = text.replace('  const navigate = useNavigate();', '  const navigate = useNavigate();\n  const location = useLocation();')

# Update saveName
save_logic = """  const saveName = () => {
    if (!playerName.trim()) {
      setError("請輸入你的玩家名稱");
      return;
    }
    localStorage.setItem("botc_player_name", playerName.trim());
    setIsEditingName(false);
    setError("");
    
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      navigate(returnUrl);
    }
  };"""

text = re.sub(r'  const saveName = \(\) => \{.*?\n  \};\n', save_logic + '\n', text, flags=re.DOTALL)

with open('src/components/layout/Lobby.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
