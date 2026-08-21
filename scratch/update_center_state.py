import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { RoleIcon } from "../common/RoleIcon";', 'import { RoleIcon } from "../common/RoleIcon";\nimport { RoleSelectionModal } from "./RoleSelectionModal";')

# State for modal
state_code = '''
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSeat, setTargetSeat] = useState<number | null>(null);
  const [seatRoleNotes, setSeatRoleNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!userUid) return;
    const saved = localStorage.getItem(otc_role_notes_);
    if (saved) {
      try { setSeatRoleNotes(JSON.parse(saved)); } catch (e) {}
    }
  }, [userUid]);

  const openNoteModal = (seatIndex: number) => {
    setTargetSeat(seatIndex);
    setModalOpen(true);
  };

  const handleModalSelect = (roleId: string | null) => {
    if (targetSeat === null) return;
    const newNotes = { ...seatRoleNotes };
    if (roleId) {
      newNotes[targetSeat] = roleId;
    } else {
      delete newNotes[targetSeat];
    }
    setSeatRoleNotes(newNotes);
    localStorage.setItem(otc_role_notes_, JSON.stringify(newNotes));
    setModalOpen(false);
  };
'''
content = content.replace('  const [seatNotes, setSeatNotes] = useState<Record<number, string>>({});', state_code + '\n  const [seatNotes, setSeatNotes] = useState<Record<number, string>>({});')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added Modal state to CenterStage')
