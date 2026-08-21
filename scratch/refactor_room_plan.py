import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a state for the Drawer
drawer_state = """  const [isDrawerOpen, setIsDrawerOpen] = useState(false);"""
content = re.sub(r'  const \[activeTab, setActiveTab\] = .*?\n', r'\g<0>' + drawer_state + '\n', content)

# We need to extract the "Room Info" elements so they can be passed down. But wait, instead of passing them down, we can render the "Right Stack" partially in Room.tsx, and absolutely position the components in Grimoire/CenterStage.
# Actually, the user wants: 陣營人數 惡魔偽裝 傳奇角色 說書人 on the right side.
# "房號 遊戲階段等等資訊 移動到 右側"
# It's easier if Grimoire/CenterStage just provide the game-specific things, and Room.tsx provides the Room info at the top of the stack.
# But z-index and flex layouts across components don't share a flex context unless we pass a React Node (children) or portal.
# We can just pass `roomHeader` as a prop! Or just put everything inside CenterStage/Grimoire by passing props.

# Let's pass these props to CenterStage and Grimoire:
# onLeaveRoom={handleLeave}
# onOpenScriptModal={() => setScriptModalOpen(true)}
# roomId={id!}
# And also the Drawer button!
