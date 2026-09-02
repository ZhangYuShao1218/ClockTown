import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Tabs, Tab, Divider } from '@mui/material';
import type { Character } from '../types';
import CharacterLibraryContent from './CharacterLibraryContent';
import { UISettingsContent } from './UISettingsDrawer';

interface LeftControlDrawerProps {
  open: boolean;
  onToggle: () => void;
  initialTab?: 'character' | 'layout' | 'ui';
  selectedCharacters?: Character[];
  onAddCharacter?: (char: Character) => void;
  onRemoveCharacter?: (char: Character) => void;
  onOpenTowerImageDialog?: () => void;
}

const LeftControlDrawer = observer(({
  open,
  onToggle,
  initialTab = 'character',
  selectedCharacters = [],
  onAddCharacter,
  onRemoveCharacter,
  onOpenTowerImageDialog,
}: LeftControlDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'character' | 'layout' | 'ui'>(initialTab);

  return (
    <Box
      className="no-print"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: { xs: '92%', sm: 440 },
        maxWidth: 440,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'sans-serif',
        '& *': { fontFamily: 'sans-serif !important' },
        borderRight: '1.5px solid #cbd5e1',
        boxShadow: open ? '10px 0 30px rgba(0, 0, 0, 0.18)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* 附著在面板右緣的書籤按鈕（隨面板一同滑動，再按一次即關閉） */}
      <Box
        onClick={onToggle}
        sx={{
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          px: '15px',
          py: '18px',
          lineHeight: 1.15,
          fontSize: '0.95rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: '#1e3a8a',
          backgroundColor: '#dbeafe',
          border: '1.5px solid #93c5fd',
          borderLeft: 'none',
          borderRadius: '0 12px 12px 0',
          boxShadow: '6px 0 20px rgba(37, 99, 235, 0.25)',
          userSelect: 'none',
          transition: 'background-color 0.2s, color 0.2s',
          '&:hover': { backgroundColor: '#bfdbfe', color: '#1e40af' },
        }}
      >
        <Box component="span" sx={{ display: 'block' }}>角</Box>
        <Box component="span" sx={{ display: 'block' }}>色</Box>
        <Box component="span" sx={{ width: 16, height: '2px', backgroundColor: 'currentColor', my: 0.75, opacity: 0.6 }} />
        <Box component="span" sx={{ display: 'block' }}>版</Box>
        <Box component="span" sx={{ display: 'block' }}>面</Box>
      </Box>

      {/* 分頁 */}
      <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ '& .MuiTab-root': { fontSize: '1rem', fontWeight: 'bold' } }}
        >
          <Tab value="character" label="角色" sx={{ color: '#1d4ed8' }} />
          <Tab value="layout" label="版面" />
          <Tab value="ui" label="UI" />
        </Tabs>
      </Box>

      <Divider />

      {/* 分頁內容 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {activeTab === 'character' && (
          <CharacterLibraryContent
            active={open && activeTab === 'character'}
            selectedCharacters={selectedCharacters}
            onAddCharacter={(c) => onAddCharacter?.(c)}
            onRemoveCharacter={(c) => onRemoveCharacter?.(c)}
            fontScalePt={2}
            hideSelectedChip
            hideAllTeamTab
          />
        )}
        {activeTab === 'layout' && <UISettingsContent sections="layoutOnly" />}
        {activeTab === 'ui' && (
          <UISettingsContent sections="settingsNoLayout" onOpenTowerImageDialog={onOpenTowerImageDialog} />
        )}
      </Box>
    </Box>
  );
});

export default LeftControlDrawer;
