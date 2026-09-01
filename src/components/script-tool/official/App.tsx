import { Component, useState, useRef, useEffect, useCallback, type ErrorInfo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Drawer,
  IconButton,
} from '@mui/material';
import {
  Print as PrintIcon,
  CheckCircleOutline as CheckIcon,
  InfoOutlined as InfoIcon,
  Image as ImageIcon,
  OpenInNew as OpenInNewIcon,
  Tune as TuneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import type { Script, Character } from './types';
import InputPanel from './components/InputPanel';
import ShareDialog from './components/ShareDialog';
import CharacterEditDialog from './components/CharacterEditDialog';
import CharacterLibraryCard from './components/CharacterLibraryCard';
import LeftControlDrawer from './components/LeftControlDrawer';
import TitleEditDialog from './components/TitleEditDialog';
import SecondPageTitleEditDialog from './components/SecondPageTitleEditDialog';
import SpecialRuleEditDialog from './components/SpecialRuleEditDialog';
import AddCustomRuleDialog from './components/AddCustomRuleDialog';
import CustomJinxDialog from './components/CustomJinxDialog';
import ScriptRenderer from './components/ScriptRenderer';
import { generateScript } from './utils/scriptGenerator';
import { THEME_COLORS, THEME_FONTS } from './theme/colors';
import { useTranslation } from './utils/i18n';
import { SEOManager } from './components/SEOManager';
import { scriptStore } from './stores/ScriptStore';
import { configStore } from './stores/ConfigStore';
import { getSpecialRuleTemplate } from './data/utils/specialRules';
import { deepStripHtml } from './utils/richTextEditorUtils';
import { getAllCharacterDictionaries, getCharacterDictionary, getCharacterInDictionary } from './data';
import UISettingsDrawer from './components/UISettingsDrawer';
import TowerImageDialog from './components/TowerImageDialog';
import AboutDialog from './components/AboutDialog';
import {
  GlobalStyles,
} from '@mui/material';
import { initGlobalShortcuts, cleanupGlobalShortcuts, registerSaveCallback, unregisterSaveCallback, showSaveAlert, alertUseMui } from './utils/event';
import { saveScript } from './lib/cloudScripts';
import { authStore } from './stores/AuthStore';
import { OverlayScrollbars } from 'overlayscrollbars';
import PrintDialog from './components/AppSub/PrintDialog';
import UnlockModeDialog from './components/AppSub/UnlockModeDialog';
import ExportJsonDialog from './components/AppSub/ExportJsonDialog';
import { trackGenerateScript, trackExportJson, trackExportImage, trackExportPdf, trackClearScript, trackAddCharacter, trackRemoveCharacter, trackEditCharacter } from './utils/analytics';
import { AnimatePresence } from 'framer-motion';
import AnimatedDialog from './components/AnimatedDialog';
import AgentFAB from './components/Agent/AgentFAB';
import AgentDialog from './components/Agent/AgentDialog';

// Place this above the App component, or below the theme definition
const printStyles = {
  '@media print': {
    // 1. Define print page, remove browser default margins
    '@page': {
      size: 'A4 portrait', // Recommended: A4 portrait
      margin: 0,           // Set page margin to 0, we control margins inside the container
    },

    // 2. Hide all elements on the page
    'body *': {
      visibility: 'hidden !important',
    },

    // 3. Only show the core script area to print, and all its children
    '#script-preview, #script-preview *, #main_script, #main_script *, #script-preview-2, #script-preview-2 *, #script-preview-3, #script-preview-3 *, #script-preview-4, #script-preview-4 *': {
      visibility: 'visible !important',
    },

    // 3.5. Remove Container padding and margin
    '.MuiContainer-root': {
      padding: '0 !important',
      margin: '0 !important',
      maxWidth: '100% !important',
    },

    // 4. ⭐ Core: Set first page container height and layout
    '#script-preview': {
      // --- A. Position and size ---
      position: 'relative !important',
      left: '0 !important',
      top: '0 !important',
      width: '100vw !important',  // 100% print viewport width
      height: '100vh !important', // 100% print viewport height
      margin: '0 !important',
      padding: '0 !important',

      // --- B. Force no overflow ---
      overflow: 'hidden !important', // Critical! Clip any content exceeding one page

      // --- C. Page break ---
      // Note: Force page break only when second page exists
      pageBreakInside: 'avoid !important',
    },

    // 4.1 When second page exists, force page break on first page
    '#script-preview:has(~ #script-preview-2)': {
      pageBreakAfter: 'always !important',
    },

    // 5. ⭐ Second page container
    '#script-preview-2': {
      position: 'relative !important',
      left: '0 !important',
      top: '0 !important',
      width: '100vw !important',
      height: '100vh !important',
      margin: '0 !important',
      padding: '0 !important',
      overflow: 'hidden !important',
      pageBreakBefore: 'always !important', // Force page break before second page
      pageBreakInside: 'avoid !important',
      marginTop: '0 !important', // Ensure no top margin when printing
    },

    '#script-preview-3': {
      position: 'relative !important',
      left: '0 !important',
      top: '0 !important',
      width: '100vw !important',
      height: '100vh !important',
      margin: '0 !important',
      padding: '0 !important',
      overflow: 'hidden !important',
      pageBreakBefore: 'always !important',
      pageBreakInside: 'avoid !important',
      marginTop: '0 !important',
    },

    '#script-preview-4': {
      position: 'relative !important',
      left: '0 !important',
      top: '0 !important',
      width: '100vw !important',
      height: '100vh !important',
      margin: '0 !important',
      padding: '0 !important',
      overflow: 'hidden !important',
      pageBreakBefore: 'always !important',
      pageBreakInside: 'avoid !important',
      marginTop: '0 !important',
    },

    // 6. Ensure bottom avatars and text boxes are visible when printing
    '#main_script .MuiBox-root': {
      visibility: 'visible !important',
    },

    // 7. Hide edit button when hovering on title
    '.MuiIconButton-root': {
      display: 'none !important',
    },

    // 8. Hide second page add component button
    '.second-page-add-component': {
      display: 'none !important',
    },

  },
};
// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: THEME_COLORS.good,
    },
    secondary: {
      main: THEME_COLORS.evil,
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: THEME_COLORS.text.primary,
      secondary: THEME_COLORS.text.secondary,
    },
  },
  typography: {
    fontFamily: THEME_FONTS.fontFamily,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiDialog: { defaultProps: { disableScrollLock: true } },
    MuiDrawer: { defaultProps: { disableScrollLock: true } },
    MuiMenu: { defaultProps: { disableScrollLock: true } },
    MuiPopover: { defaultProps: { disableScrollLock: true } },
  },
});

/** Top-level crash barrier — catches ANY render error in the entire app tree */
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App render crashed:', error, errorInfo);
  }
  override render() {
    if (this.state.error) {
      return (
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:3, px:4, textAlign:'center', bgcolor:'#f5f5f5' }}>
          <Typography variant="h5" color="error" fontWeight={700}>Application Error</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth:500 }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </Typography>
          <Box sx={{ display:'flex', gap:2 }}>
            <Button variant="contained" color="error" onClick={() => { this.setState({ error: null }); window.location.reload(); }}>
              Reload Page
            </Button>
            <Button variant="outlined" onClick={() => { try { localStorage.clear(); } catch {} window.location.reload(); }}>
              Reset All Data &amp; Reload
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}

class ScriptRendererErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ScriptRenderer render crashed:', error, errorInfo);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const App = observer(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useTranslation();
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [inputDrawerOpen, setInputDrawerOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [libraryCardOpen, setLibraryCardOpen] = useState<boolean>(false);
  const [replacingCharacter, setReplacingCharacter] = useState<Character | null>(null);
  const [libraryPosition, setLibraryPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [uiSettingsOpen, setUiSettingsOpen] = useState<boolean>(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(false);
  const [titleEditState, setTitleEditState] = useState<{
    open: boolean;
    mode: 'main' | 'firstNight' | 'otherNight' | null;
  }>({
    open: false,
    mode: null,
  });
  const [secondPageTitleEditDialogOpen, setSecondPageTitleEditDialogOpen] = useState<boolean>(false);
  const [specialRuleEditDialogOpen, setSpecialRuleEditDialogOpen] = useState<boolean>(false);
  const [editingSpecialRule, setEditingSpecialRule] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [addCustomRuleDialogOpen, setAddCustomRuleDialogOpen] = useState<boolean>(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState<boolean>(false);
  const [thanksDialogOpen, setThanksDialogOpen] = useState<boolean>(false);
  const [jsonParseError, setJsonParseError] = useState<string>(''); // JSON parse error state
  const [customJinxDialogOpen, setCustomJinxDialogOpen] = useState<boolean>(false);
  const [printDialogOpen, setPrintDialogOpen] = useState<boolean>(false); // Print dialog state
  const [exportJsonDialogOpen, setExportJsonDialogOpen] = useState<boolean>(false); // Export JSON options dialog
  const [exportImageDialogOpen, setExportImageDialogOpen] = useState<boolean>(false); // Export image hint dialog
  const [unlockModeDialogOpen, setUnlockModeDialogOpen] = useState<boolean>(false); // Unlock mode dialog
  const [pendingEditCharacter, setPendingEditCharacter] = useState<Character | null>(null); // Pending character to edit
  const [towerImageDialogOpen, setTowerImageDialogOpen] = useState<boolean>(false);

  // Get state from MobX store
  const { script, originalJson, normalizedJson, customTitle, customAuthor } = scriptStore;

  // Initialize and load data
  useEffect(() => {

    const initializeApp = async () => {
      // Check for json param in URL, redirect to preview page if present
      const jsonParam = searchParams.get('json');
      if (jsonParam) {
        navigate(`/repo/preview?json=${encodeURIComponent(jsonParam)}`);
        return;
      }

      // If no stored data, load default example
      if (!scriptStore.hasStoredData) {
        try {
          const defaultJson = await scriptStore.loadDefaultExample();
          handleGenerate(defaultJson);
        } catch (error) {
          console.error('Failed to load default example:', error);
        }
      } else {
        // If stored data exists, regenerate script (to adapt to language changes)
        if (originalJson) {
          try {
          const generatedScript = generateScript(originalJson, language);
            if (customTitle) generatedScript.title = customTitle;
            if (customAuthor) generatedScript.author = customAuthor;
            scriptStore.setScript(generatedScript);
          } catch (error) {
            console.error('Failed to regenerate script from stored data:', error);
            // Preserve originalJson so user can fix it; clear only the broken script
            scriptStore.setScript(null);
            setJsonParseError(`Startup error: ${error instanceof Error ? error.message : 'Invalid cached data'}. You can edit and re-generate.`);
          }
        }
      }

      setIsInitialized(true);
    };

    initializeApp();
  }, [searchParams, navigate]);

  // Initialize global shortcuts (only once)
  useEffect(() => {
    // Initialize shortcut listeners
    initGlobalShortcuts();

    // Cleanup function
    return () => {
      unregisterSaveCallback();
      cleanupGlobalShortcuts();
    };
  }, []); // Empty dependency array, only runs once on component mount

  // Register save callback (update when language changes)
  useEffect(() => {
    const handleSave = () => {
      // Directly save originalJson from scriptStore
      const jsonToSave = scriptStore.originalJson;

      if (jsonToSave) {
        try {
          // Validate JSON format
          JSON.parse(jsonToSave);

          // Save to localStorage
          const stored = localStorage.getItem('botc-script-data');
          if (stored) {
            const message = language === 'cn'
              ? `Saved to local storage`
              : language === 'es'
                ? `Guardado en almacenamiento local`
                : `Saved to local storage`;
            showSaveAlert(message, 2500);
          }

          // Cloud auto-save (if logged in)
          if (authStore.isLoggedIn) {
            const title = scriptStore.script?.title || 'Untitled';
            saveScript(title, jsonToSave).then(result => {
              if (result.ok) {
                const msg = language === 'cn' ? '☁ Saved to cloud' : '☁ Saved to cloud';
                showSaveAlert(msg, 1500);
              }
            });
          }
        } catch (error) {
          console.error('JSON format error:', error);
          const message = language === 'cn'
            ? '✗ Invalid JSON format'
            : language === 'es'
              ? '✗ Formato JSON no válido'
              : '✗ Invalid JSON format';
          alertUseMui(message, 2500, { kind: 'error' });
        }
      } else {
        console.log('No JSON data to save');
        const message = language === 'cn'
          ? '⚠ No JSON to save'
          : language === 'es'
            ? '⚠ No hay JSON para guardar'
            : '⚠ No JSON to save';
        alertUseMui(message, 2000, { kind: 'warning' });
      }
    };

    registerSaveCallback(handleSave);

    // When language changes, need to re-register callback
    return () => {
      unregisterSaveCallback();
    };
  }, [language]); // Only depends on language

  // Handle JSON input change - only save to store, no auto-parse
  const handleJsonChange = (json: string) => {
    // Only update originalJson, save input content, don't trigger auto-generation
    scriptStore.setOriginalJson(json);

    // Clear previous error (user may be editing)
    setJsonParseError('');
  };

  const handleGenerate = (json: string, title?: string, author?: string) => {
    try {
      const generatedScript = generateScript(json, language);

      // Override title and author
      if (title) generatedScript.title = title;
      if (author) generatedScript.author = author;

      // Update store
      scriptStore.updateScript({
        script: generatedScript,
        originalJson: json,
        customTitle: title || '',
        customAuthor: author || '',
      });

      // Clear error message
      setJsonParseError('');

      // Track analytics
      const characterCount = Object.values(generatedScript.characters).reduce(
        (sum: number, chars: Character[]) => sum + chars.length, 0
      );
      trackGenerateScript({ characterCount, hasCustomTitle: !!title });
    } catch (error) {
      // Show error on generation failure
      const errorMessage = error instanceof Error ? error.message : t('input.errorParse');
      setJsonParseError(`${t('input.errorParse')}: ${errorMessage}`);
    }
  };

  // Listen for language changes, regenerate script
  useEffect(() => {
        if (originalJson && isInitialized) {
      try {
        const generatedScript = generateScript(originalJson, language);

        // Restore custom title and author
        if (customTitle) generatedScript.title = customTitle;
        if (customAuthor) generatedScript.author = customAuthor;

        scriptStore.setScript(generatedScript); // setScript automatically generates normalizedJson
      } catch (error) {
        console.error('Failed to regenerate script on language switch:', error);
        // Set error message
        const errorMessage = error instanceof Error ? error.message : t('input.errorParse');
        setJsonParseError(`${t('input.errorParse')}: ${errorMessage}`);
      }
    }
  }, [language, originalJson, customTitle, customAuthor, isInitialized]);

  // Update character order and sync to JSON
  const handleReorderCharacters = (team: string, newOrder: string[], columnLeftCount?: number) => {
    scriptStore.reorderCharacters(team, newOrder, columnLeftCount);
  };

  // Update character info and sync to JSON
  const handleUpdateCharacter = useCallback((characterId: string, updates: Partial<Character>) => {
    scriptStore.updateCharacter(characterId, updates);
  }, []);

  // Handle editing character
  const handleEditCharacter = (character: Character) => {
    // Check if in official ID parse mode
    if (configStore.config.officialIdParseMode) {
      // Save pending character to edit, show unlock dialog
      setPendingEditCharacter(character);
      setUnlockModeDialogOpen(true);
      return;
    }

    setEditingCharacter(character);
    setEditDialogOpen(true);
    trackEditCharacter({ characterId: character.id });
  };

  // Handle unlock mode and continue editing
  const handleUnlockAndEdit = () => {
    // Unlock official ID parse mode
    configStore.setOfficialIdParseMode(false);
    setUnlockModeDialogOpen(false);

    // Continue editing
    if (pendingEditCharacter) {
      setEditingCharacter(pendingEditCharacter);
      setEditDialogOpen(true);
      setPendingEditCharacter(null);

      // Show unlock success message
      alertUseMui(`${t('dialog.unlockSuccess')}`, 2500, { kind: 'success' });
    }
  };

  // Close edit dialog
  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditingCharacter(null);
  }, []);

  // Regenerate script when per-character jinx version changes
  const handleJinxVersionChange = useCallback(() => {
    const originalJson = scriptStore.originalJson || '';
    const customTitle = scriptStore.script?.title || '';
    const customAuthor = scriptStore.script?.author || '';
    try {
      const generatedScript = generateScript(originalJson, language);
      if (customTitle) generatedScript.title = customTitle;
      if (customAuthor) generatedScript.author = customAuthor;
      scriptStore.setScript(generatedScript);
    } catch (error) {
      console.error('Failed to regenerate script after jinx version change:', error);
    }
  }, [language]);

  // Stable close callbacks (avoid observer component re-renders from inline arrow functions)
  const handleCloseUISettings = useCallback(() => setUiSettingsOpen(false), []);
  const handleCloseShareDialog = useCallback(() => setShareDialogOpen(false), []);
  const handleCloseTitleEdit = useCallback(() => setTitleEditState({ open: false, mode: null }), []);
  const handleCloseSecondPageTitleEdit = useCallback(() => setSecondPageTitleEditDialogOpen(false), []);
  const handleCloseExportJson = useCallback(() => setExportJsonDialogOpen(false), []);
  const handleCloseExportImage = useCallback(() => setExportImageDialogOpen(false), []);
  const handleCloseSpecialRuleEdit = useCallback(() => setSpecialRuleEditDialogOpen(false), []);
  const handleCloseAddCustomRule = useCallback(() => setAddCustomRuleDialogOpen(false), []);
  const handleCloseAboutDialog = useCallback(() => setAboutDialogOpen(false), []);
  const handleCloseCustomJinx = useCallback(() => setCustomJinxDialogOpen(false), []);
  const handleClosePrintDialog = useCallback(() => setPrintDialogOpen(false), []);
  const handleOpenTowerImageDialog = useCallback(() => setTowerImageDialogOpen(true), []);
  const handleCloseTowerImageDialog = useCallback(() => setTowerImageDialogOpen(false), []);

  // Handle adding character to script
  const handleAddCharacter = (character: Character) => {
    // If in replace mode
    if (replacingCharacter) {
      // Use replaceCharacter method, keep original position
      const success = scriptStore.replaceCharacter(replacingCharacter, character);
      if (success) {
        // Clear replace state and close character library
        setReplacingCharacter(null);
        setLibraryCardOpen(false);
      }
    } else {
      // Normal add mode
      scriptStore.addCharacter(character);
      trackAddCharacter({ characterId: character.id, team: character.team });
      // No longer auto-close character library
    }
  };

  // Handle removing character from script
  const handleRemoveCharacter = (character: Character) => {
    scriptStore.removeCharacter(character);
    trackRemoveCharacter({ characterId: character.id, team: character.team });
  };

  // Handle replacing character
  const handleReplaceCharacter = (character: Character, position: { x: number; y: number }) => {
    setReplacingCharacter(character);
    setLibraryPosition(position);
    setLibraryCardOpen(true);
  };

  const handleTitleEdit = (mode: 'main' | 'firstNight' | 'otherNight') => {
    setTitleEditState({
      open: true,
      mode,
    });
  };

  // Handle creating a custom character via right-click context menu
  const handleAddCustomCharacter = useCallback((team: string) => {
    const customId = `custom_${Date.now()}`;
    const customCharacter: Character = {
      id: customId,
      name: t('character.customName'),
      ability: t('character.customAbility'),
      team,
      image: 'https://oss.gstonegames.com/data_file/clocktower/web/icons/lunatic.png',
      firstNight: 0,
      otherNight: 0,
    };
    scriptStore.addCharacter(customCharacter);
    trackAddCharacter({ characterId: customId, team });
  }, [t, scriptStore]);

  // Handle second page title editing
  const handleSecondPageTitleEdit = () => {
    setSecondPageTitleEditDialogOpen(true);
  };

  // Handle first page title save
  const handleTitleSave = (data: {
    title: string;
    titleImage?: string;
    titleImageSize?: number;
    useTitleImage: boolean;
    showTitleFlourish?: boolean;
    author: string;
    playerCount?: string;
    textAlignment?: 'left' | 'center' | 'right';
    authorAlignment?: 'left' | 'center' | 'right';
  }) => {
    scriptStore.updateTitleInfo({
      title: data.title,
      titleImage: data.titleImage,
      titleImageSize: data.titleImageSize,
      useTitleImage: data.useTitleImage,
      showTitleFlourish: data.showTitleFlourish,
      author: data.author,
      playerCount: data.playerCount,
      textAlignment: data.textAlignment,
      authorAlignment: data.authorAlignment,
    });
  };

  // Handle second page title save
  const handleSecondPageTitleSave = (data: {
    title: string;
    titleImage?: string;
    fontSize?: number;
    imageSize?: number;
    useImage: boolean;
  }) => {
    scriptStore.updateTitleInfo({
      secondPageTitleText: data.title,
      secondPageTitleImage: data.titleImage,
      secondPageTitleFontSize: data.fontSize,
      secondPageTitleImageSize: data.imageSize,
      useSecondPageTitleImage: data.useImage,
    });
  };

  // Handle special rule editing
  const handleSpecialRuleEdit = (rule: any) => {
    setEditingSpecialRule(rule);
    setSpecialRuleEditDialogOpen(true);
  };

  // Handle special rule save
  const handleSpecialRuleSave = (rule: any) => {
    scriptStore.updateSpecialRule(rule);
  };

  // Handle adding custom rule
  const handleAddCustomRule = () => {
    setAddCustomRuleDialogOpen(true);
  };

  // Handle night order reordering
  const handleNightOrderReorder = (nightType: 'first' | 'other', oldIndex: number, newIndex: number) => {
    // If official ID parse mode is enabled, disable reordering
    if (configStore.config.officialIdParseMode) {
      console.log('Official ID parse mode is enabled, night order modification disabled');
      return;
    }

    if (!script) return;

    const actions = nightType === 'first' ? [...script.firstnight] : [...script.othernight];
    if (oldIndex === newIndex || oldIndex < 0 || oldIndex >= actions.length || newIndex < 0 || newIndex > actions.length) return;

    // Get the dragged action (may be a character or a special icon: NIGHT/MINION INFO/DEMON INFO)
    const draggedAction = actions[oldIndex];

    // New position neighbors: remove dragged item, then insert at newIndex
    const without = actions.filter((_, i) => i !== oldIndex);
    const insertAt = Math.min(newIndex, without.length);
    const prevIndex = insertAt > 0 ? without[insertAt - 1].index : undefined;
    const nextIndex = insertAt < without.length ? without[insertAt].index : undefined;

    // Midpoint insertion — arbitrary items can now be placed anywhere, including before the special icons
    let newOrderValue: number;
    if (prevIndex !== undefined && nextIndex !== undefined) {
      newOrderValue = (prevIndex + nextIndex) / 2;
      // Guard: if neighbors are (near) identical, nudge forward to avoid float collisions
      if (newOrderValue <= prevIndex || newOrderValue >= nextIndex) {
        newOrderValue = prevIndex + 0.5;
      }
    } else if (prevIndex !== undefined) {
      newOrderValue = prevIndex + 0.5;
    } else if (nextIndex !== undefined) {
      newOrderValue = nextIndex - 0.5;
    } else {
      newOrderValue = 1;
    }

    const characterImage = draggedAction.image;

    // Special icons (Dusk/Mi/Di) are not characters — update their index directly
    const character = script.all.find(c => c.image === characterImage);
    if (!character) {
      scriptStore.updateNightOrderIconIndex(nightType, characterImage, newOrderValue);
      return;
    }

    const updates: Partial<Character> = {};
    if (nightType === 'first') {
      updates.firstNight = newOrderValue;
    } else {
      updates.otherNight = newOrderValue;
    }

    // Update character and sync to JSON
    handleUpdateCharacter(character.id, updates);
  };

  // Handle adding new rule
  const handleAddNewRule = (ruleType: 'special_rule' | 'custom_jinx', templateId?: string) => {
    if (ruleType === 'custom_jinx') {
      // Open custom jinx dialog
      setAddCustomRuleDialogOpen(false);
      setCustomJinxDialogOpen(true);
      return;
    }

    if (ruleType === 'special_rule') {
      let newRule: any;

      if (templateId) {
        // Use template to create rule
        const template = getSpecialRuleTemplate(templateId);

        if (!template) {
          console.error('Special rule template not found:', templateId);
          return;
        }

        newRule = {
          id: `custom_rule_${Date.now()}`,
          title: {
            'cn': template.title['cn'] || '',
            'en': template.title['en'] || template.title['cn'] || '',
            'es': template.title['es'] || template.title['en'] || template.title['cn'] || '',
          },
          team: "special_rule",
          content: {
            'cn': template.content['cn'] || '',
            'en': template.content['en'] || template.content['cn'] || '',
            'es': template.content['es'] || template.content['en'] || template.content['cn'] || '',
          },
          sourceType: 'special_rule' as const,
          sourceIndex: 0,
        };
      } else {
        // Create blank rule
        newRule = {
          id: `custom_rule_${Date.now()}`,
          title: {
            'cn': 'New Rule',
            'en': 'New Rule',
            'es': 'Nueva regla',
          },
          team: "special_rule",
          content: {
            'cn': 'Enter rule content...',
            'en': 'Enter rule content...',
            'es': 'Introduce el contenido de la regla...',
          },
          sourceType: 'special_rule' as const,
          sourceIndex: 0,
        };
      }

      // Add to script
      if (script) {
        const updatedScript = { ...script };
        updatedScript.specialRules = [...updatedScript.specialRules, newRule];
        if (updatedScript.secondPageRules) {
          updatedScript.secondPageRules = [...updatedScript.secondPageRules, newRule];
        }
        scriptStore.setScript(updatedScript);

        // Sync to JSON
        try {
          const parsedJson = JSON.parse(originalJson);
          const jsonArray = Array.isArray(parsedJson) ? parsedJson : [];
          jsonArray.push({
            id: newRule.id,
            team: 'special_rule',
            title: newRule.title,
            content: newRule.content,
          });
          const jsonString = JSON.stringify(jsonArray, null, 2);
          scriptStore.setOriginalJson(jsonString);
        } catch (error) {
          console.error('Failed to sync new rule to JSON:', error);
        }
      }
    }
  };



  // Export JSON file - show options dialog
  const handleExportJson = () => {
    if (!originalJson) return;
    setExportJsonDialogOpen(true);
  };

  // Export option 1: full JSON in current language (using normalizedJson)
  const handleExportCurrentLanguageJson = () => {
    if (!normalizedJson) return;

    try {
      // Use normalizedJson as base, which already contains all supplemented fields
      const parsedJson = JSON.parse(normalizedJson);
      const jsonArray = Array.isArray(parsedJson) ? parsedJson : [];

      // Character dictionary for current language
      const currentDict = getCharacterDictionary(language);

      // Helper: find character in dictionary by name or id
      const findCharacterInDict = (item: any): Character | null => {
        const itemObj = typeof item === 'string' ? { id: item } : item;

        // 1. Find by name
        if (itemObj.name && typeof itemObj.name === 'string') {
          for (const char of Object.values(currentDict)) {
            if ((char as Character).name === itemObj.name) {
              return char as Character;
            }
          }
        }

        const byId = getCharacterInDictionary(currentDict, itemObj.id);
        if (byId) return byId;

        return null;
      };

      const newJsonArray: any[] = [];

      jsonArray.forEach((item: any) => {
        const itemObj = typeof item === 'string' ? { id: item } : item;

        // Keep _meta, jinxed, special_rule
        if (itemObj.id === '_meta' || itemObj.team === 'a jinxed' || itemObj.team === 'special_rule') {
          newJsonArray.push(item);
        } else {
          // Try to find in current language dictionary
          const foundChar = findCharacterInDict(item);

          if (foundChar) {
            // Found, use full info in current language
            const fullCharJson: any = {
              id: foundChar.id,
              name: foundChar.name,
              ability: foundChar.ability,
              team: foundChar.team,
              image: foundChar.image,
            };

            // Add optional fields
            if (foundChar.firstNight) fullCharJson.firstNight = foundChar.firstNight;
            if (foundChar.otherNight) fullCharJson.otherNight = foundChar.otherNight;
            if (foundChar.firstNightReminder) fullCharJson.firstNightReminder = foundChar.firstNightReminder;
            if (foundChar.otherNightReminder) fullCharJson.otherNightReminder = foundChar.otherNightReminder;
            if (foundChar.reminders && foundChar.reminders.length > 0) fullCharJson.reminders = foundChar.reminders;
            if (foundChar.remindersGlobal && foundChar.remindersGlobal.length > 0) fullCharJson.remindersGlobal = foundChar.remindersGlobal;
            if (foundChar.setup) fullCharJson.setup = foundChar.setup;

            newJsonArray.push(fullCharJson);
            console.log(`Exported full info in current language: ${foundChar.name}`);
          } else {
            // Not found, keep original JSON
            newJsonArray.push(item);
            console.warn(`Unable to find in ${language} dictionary, keeping original JSON:`, itemObj.id);
          }
        }
      });

      const cleanedForExport = deepStripHtml(newJsonArray);
      const jsonString = JSON.stringify(cleanedForExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const langSuffix = language === 'cn'
        ? t('export.chineseLang')
        : language === 'es'
          ? t('export.spanishLang')
          : t('export.englishLang');
      const scriptName = script?.title || t('export.defaultScriptName');
      link.download = `${scriptName}-${langSuffix}${t('export.currentLangSuffix')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportJsonDialogOpen(false);
      trackExportJson({ exportType: 'current_language' });
    } catch (error) {
      console.error('Failed to export current language JSON:', error);
      alert(t('input.exportJsonFailed'));
    }
  };

  // Export option 2: original JSON (no processing)
  const handleExportOriginalJson = () => {
    if (!originalJson) return;

    try {
      const parsedJson = JSON.parse(originalJson);
      const cleaned = deepStripHtml(parsedJson);
      const jsonString = JSON.stringify(cleaned, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const scriptName = script?.title || t('export.defaultScriptName');
      link.download = `${scriptName}-${t('export.originalSuffix')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportJsonDialogOpen(false);
      trackExportJson({ exportType: 'original' });
    } catch (error) {
      console.error('Failed to export original JSON:', error);
      alert(t('input.exportJsonFailed'));
    }
  };

  // Export option 3: official ID only (bilingual mode, keep full JSON if not found) (using normalizedJson)
  const handleExportIdOnlyJson = () => {
    if (!normalizedJson) return;

    try {
      // Use normalizedJson as base, which already contains all supplemented fields
      const parsedJson = JSON.parse(normalizedJson);
      const jsonArray = Array.isArray(parsedJson) ? parsedJson : [];

      // Helper: find official ID across all official language dictionaries
      const findOfficialIdByNameOrId = (item: any): { found: boolean; id?: string } => {
        const itemObj = typeof item === 'string' ? { id: item } : item;

        const allDictionaries = getAllCharacterDictionaries();

        // 1. Find by name across language dictionaries
        if (itemObj.name && typeof itemObj.name === 'string') {
          for (const [, dict] of allDictionaries) {
            for (const [id, char] of Object.entries(dict)) {
              if ((char as Character).name === itemObj.name) {
                return { found: true, id };
              }
            }
          }
        }

        for (const [, dict] of allDictionaries) {
          const found = getCharacterInDictionary(dict, itemObj.id);
          if (found) {
            return { found: true, id: found.id };
          }
        }

        return { found: false };
      };

      // Convert to ID-only format
      const idOnlyArray: any[] = [];

      jsonArray.forEach((item: any) => {
        const itemObj = typeof item === 'string' ? { id: item } : item;

        // Keep full info for _meta, jinxed, special_rule
        if (itemObj.id === '_meta' || itemObj.team === 'a jinxed' || itemObj.team === 'special_rule') {
          idOnlyArray.push(item);
        } else {
          // Try to find official ID
          const result = findOfficialIdByNameOrId(item);

          if (result.found && result.id) {
            // Found official ID, export as ID string
            idOnlyArray.push(result.id);
            console.log(`✓ Found official ID: ${result.id}${itemObj.name ? ` (${itemObj.name})` : ''}`);
          } else {
            // Official ID not found, keep full JSON
            idOnlyArray.push(item);
            console.warn(`⚠ Official ID not found, keeping full JSON:`, itemObj.id, itemObj.name || '');
          }
        }
      });

      const cleanedIdOnly = deepStripHtml(idOnlyArray);
      const jsonString = JSON.stringify(cleanedIdOnly, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const scriptName = script?.title || t('export.defaultScriptName');
      link.download = `${scriptName}-${t('export.idOnlySuffix')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportJsonDialogOpen(false);
      trackExportJson({ exportType: 'id_only' });
    } catch (error) {
      console.error('Failed to export ID-only JSON:', error);
      alert(t('input.exportJsonFailed'));
    }
  };

  const handleExportPDF = () => {
    trackExportPdf();
    // Show print settings dialog
    setPrintDialogOpen(true);
  };

  const handleExportImage = () => {
    trackExportImage();
    // Show export image hint dialog
    setExportImageDialogOpen(true);
  };

  const handleConfirmPrint = () => {
    // Close dialog and trigger print
    setPrintDialogOpen(false);
    // Trigger browser print, user can save as PDF
    window.print();
  };

  // Clear all data, but keep default JSON framework
  const handleClear = () => {
    trackClearScript();
    // Create a default JSON framework
    const defaultJson = JSON.stringify([
      {
        "id": "_meta",
        "author": "",
        "name": "Custom Your Script!"
      }
    ], null, 2);

    // Parse default JSON, generate empty script (so add buttons can add characters)
    try {
      const generatedScript = generateScript(defaultJson, language);
      scriptStore.updateScript({
        script: generatedScript,
        originalJson: defaultJson,
        customTitle: '',
        customAuthor: '',
      });
    } catch (error) {
      console.error('Failed to generate default empty script:', error);
      // If generation fails, at least save JSON
      scriptStore.setOriginalJson(defaultJson);
      scriptStore.setScript(null);
      scriptStore.setCustomTitle('');
      scriptStore.setCustomAuthor('');
    }
  };

  return (
    <AppErrorBoundary>
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={printStyles} /> {/* 👈 add here */}
      <SEOManager />
      <CssBaseline />
      <Box
        sx={{
          backgroundRepeat: "no-repeat",
          background: "#F6F1DC",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 頂部 Header: 典雅高質感鐘樓工坊風格 (列印時自動隱藏) */}
        <Box
          className="no-print"
          sx={{
            width: '100%',
            background: 'linear-gradient(160deg, #fffcf6 0%, #fdf8ee 40%, #f7efe0 100%)',
            borderTop: '4px solid #b45309',
            borderBottom: '1.5px solid #d5c8b6',
            py: { xs: 3, sm: 4 },
            px: { xs: 3, sm: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            zIndex: 100,
            position: 'sticky',
            top: 0,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            // 底部裝飾線
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-1px',
              left: '5%',
              right: '5%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #b45309 20%, #f59e0b 50%, #b45309 80%, transparent)',
              opacity: 0.35,
            },
          }}
        >
          {/* 左側：裝飾線 + 大標題 + 副標題 */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2.5 }}>
            {/* 左側琥珀金竪條裝飾 */}
            <Box sx={{
              width: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 50%, #f59e0b 100%)',
              flexShrink: 0,
            }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: '#1c1917',
                  fontSize: { xs: '1.65rem', sm: '2.35rem' },
                  letterSpacing: '0.04em',
                  lineHeight: 1.1,
                  userSelect: 'none',
                  textShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                血染鐘樓 - 劇本工具
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.72rem', sm: '0.82rem' },
                  color: '#92400e',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                Blood on the Clocktower · 劇本排版與製作
              </Typography>
            </Box>
          </Box>

          {/* 右側：致謝按鈕與淺藍色前往魔典按鈕 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setThanksDialogOpen(true)}
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                backgroundColor: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.25,
                py: 0.85,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              致謝與來源
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{
                borderColor: '#93c5fd',
                color: '#1d4ed8',
                backgroundColor: '#eff6ff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.75,
                py: 0.85,
                boxShadow: '0 1px 4px rgba(37, 99, 235, 0.1)',
                '&:hover': {
                  borderColor: '#60a5fa',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.18)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              前往魔典
            </Button>
          </Box>
        </Box>

        <Container maxWidth="xl" sx={{ pt: 3, pb: 14 }}>
          {exportJsonDialogOpen && (
            <ExportJsonDialog
              key="export-json"
              open={exportJsonDialogOpen}
              onClose={handleCloseExportJson}
              onExportOriginal={handleExportOriginalJson}
              onExportCurrentLanguage={handleExportCurrentLanguageJson}
              onExportIdOnly={handleExportIdOnlyJson}
              t={t as (key: string) => string}
            />
          )}

          {/* Script display area - using ScriptRenderer component */}
          {script && (
            <ScriptRendererErrorBoundary
              key={originalJson}
              fallback={
                <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                  <Typography color="error">
                    Script preview failed to render. Please check the script JSON for invalid data.
                  </Typography>
                </Paper>
              }
            >
              <ScriptRenderer
                script={script}
                theme={theme}
                readOnly={false}
                onReorderCharacters={handleReorderCharacters}
                onUpdateCharacter={handleUpdateCharacter}
                onEditCharacter={handleEditCharacter}
                onDeleteCharacter={handleRemoveCharacter}
                onReplaceCharacter={handleReplaceCharacter}
                onAddCustomCharacter={handleAddCustomCharacter}
                onTitleEdit={handleTitleEdit}
                onSecondPageTitleEdit={handleSecondPageTitleEdit}
                onSpecialRuleEdit={handleSpecialRuleEdit}
                onSpecialRuleDelete={(rule) => scriptStore.removeSpecialRule(rule)}
                onNightOrderReorder={handleNightOrderReorder}
                onOpenTowerImageDialog={handleOpenTowerImageDialog}
              />
            </ScriptRendererErrorBoundary>
          )}

          {/* Empty state prompt */}
          {!script && (
            <Paper
              sx={{
                p: { xs: 4, sm: 6, md: 8 },
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#666',
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                }}
              >
                {t('app.emptyState')}
              </Typography>
            </Paper>
          )}
        </Container>

        {/* 底部附著式滑入設定面板 (書籤標籤緊密黏著在視窗上方，隨視窗一同上下滑動) */}
        <Box
          className="no-print"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 1150, // 低於 MUI Dialog (1300)，避免彈窗被面板蓋住
            pointerEvents: 'none', // 整體不擋點擊
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1440px',
              position: 'relative',
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: inputDrawerOpen ? 'translateY(0)' : 'translateY(calc(100% - 46px))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'auto', // 讓整個容器可接受滑鼠事件
            }}
          >
            {/* 書籤頁籤按鈕 (46px 高，永遠可見於底部邊緣) */}
            <Button
              variant="contained"
              onClick={() => setInputDrawerOpen(!inputDrawerOpen)}
              sx={{
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '1.5px solid #cbd5e1',
                borderBottom: 'none',
                boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: '12px 12px 0 0',
                px: 4.5,
                py: 1,
                height: '46px',
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'none',
                mb: '-1px',
                zIndex: 10,
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  borderColor: '#94a3b8',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {inputDrawerOpen ? '▼ 收起設定' : '▲ 劇本設定 / JSON'}
            </Button>

            {/* 純白視窗主體 (不壓黑背景、無多餘外框、無右上 X 按鈕) */}
            <Box
              sx={{
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                p: { xs: 1, sm: 2 },
                pb: 3,
                boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.18)',
                borderRadius: '16px 16px 0 0',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid #cbd5e1',
                borderBottom: 'none',
              }}
            >
              <InputPanel
                onGenerate={(json, title, author) => {
                  handleGenerate(json, title, author);
                  setInputDrawerOpen(false);
                }}
                onExportPDF={handleExportPDF}
                onExportImage={handleExportImage}
                onExportJson={handleExportJson}
                onExportOriginalJson={handleExportOriginalJson}
                onShare={() => setShareDialogOpen(true)}
                onClear={handleClear}
                onOpenUISettings={() => setUiSettingsOpen(true)}
                onAddCustomRule={handleAddCustomRule}
                onOpenAboutDialog={() => setAboutDialogOpen(true)}
                onJsonChange={handleJsonChange}
                hasScript={script !== null}
                currentJson={originalJson}
                jsonParseError={jsonParseError}
              />
            </Box>
          </Box>
        </Box>

      </Box>

      {/* 開源專案致謝與來源彈窗 (點擊遮罩直接關閉) */}
      <Dialog
        open={thanksDialogOpen}
        onClose={() => setThanksDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>💖</span>
          <span>開源專案來源與致謝</span>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph sx={{ fontWeight: 600, color: '#1e293b' }}>
            本劇本工具改編自開源社群優秀專案，專為血染鐘樓玩家與說書人提供高品質的劇本排版與導出體驗。
          </Typography>

          <Box sx={{ backgroundColor: '#f8fafc', p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
              📜 原開源專案資訊
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 0.75 }}>
              • 專案名稱：<strong>botc-script-tool (血染鐘樓劇本製作工具)</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 0.75 }}>
              • 開源作者：<strong>LiWeny16</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#2563eb' }}>
              • GitHub 儲存庫：
              <a
                href="https://github.com/LiWeny16/botc-script-tool"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 4, wordBreak: 'break-all' }}
              >
                https://github.com/LiWeny16/botc-script-tool
              </a>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
      {shareDialogOpen && (
        <ShareDialog
          key="share-dialog"
          open={shareDialogOpen}
          onClose={handleCloseShareDialog}
          script={script}
          originalJson={originalJson}
          normalizedJson={normalizedJson}
        />
      )}

      {editDialogOpen && (
        <CharacterEditDialog
          key="edit-dialog"
          open={editDialogOpen}
          character={editingCharacter}
          onClose={handleCloseEditDialog}
          onSave={handleUpdateCharacter}
          onJinxVersionChange={handleJinxVersionChange}
        />
      )}

      {libraryCardOpen && (
        <CharacterLibraryCard
          key="library-card"
          open={libraryCardOpen}
          onClose={() => {
            setLibraryCardOpen(false);
            setReplacingCharacter(null);
            setLibraryPosition(undefined);
          }}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
          selectedCharacters={script?.all || []}
          initialTeam={replacingCharacter?.team}
          position={libraryPosition}
        />
      )}

      {/* 左側「角色 / 版面」附著式面板 */}
      <LeftControlDrawer
        key="left-control-drawer"
        open={leftDrawerOpen}
        onToggle={() => setLeftDrawerOpen((v) => !v)}
        selectedCharacters={script?.all || []}
        onAddCharacter={handleAddCharacter}
        onRemoveCharacter={handleRemoveCharacter}
        onOpenTowerImageDialog={handleOpenTowerImageDialog}
      />

      {uiSettingsOpen && (
        <UISettingsDrawer
          key="ui-settings"
          open={uiSettingsOpen}
          onClose={handleCloseUISettings}
          onOpenTowerImageDialog={handleOpenTowerImageDialog}
        />
      )}

      <TowerImageDialog
        key="tower-image"
        open={towerImageDialogOpen}
        onClose={handleCloseTowerImageDialog}
      />

      {titleEditState.open && (
        <TitleEditDialog
          key="title-edit"
          open={titleEditState.open}
          title={
            titleEditState.mode === 'main'
              ? script?.title || ''
              : titleEditState.mode === 'firstNight'
              ? script?.storytellerFirstNight || ''
              : script?.storytellerOtherNight || ''
          }
          titleImage={
            titleEditState.mode === 'main'
              ? script?.titleImage
              : titleEditState.mode === 'firstNight'
              ? script?.storytellerFirstNightTitleImage
              : script?.storytellerOtherNightTitleImage
          }
          titleImageSize={
            titleEditState.mode === 'main'
              ? script?.titleImageSize
              : titleEditState.mode === 'firstNight'
              ? script?.storytellerFirstNightTitleImageSize
              : script?.storytellerOtherNightTitleImageSize
          }
          useTitleImage={
            titleEditState.mode === 'main'
              ? script?.useTitleImage
              : titleEditState.mode === 'firstNight'
              ? script?.useStorytellerFirstNightTitleImage
              : script?.useStorytellerOtherNightTitleImage
          }
          showTitleFlourish={script?.showTitleFlourish}
          author={script?.author || ''}
          playerCount={script?.playerCount || ''}
          textAlignment={(script as any)?.textAlignment || 'center'}
          authorAlignment={(script as any)?.authorAlignment || 'center'}
          onClose={() =>
            setTitleEditState({ open: false, mode: null })
          }
            onSave={(data) => {
            if (titleEditState.mode === 'main') {
              scriptStore.updateTitleInfo({
                title: data.title,
                titleImage: data.titleImage,
                titleImageSize: data.titleImageSize,
                useTitleImage: data.useTitleImage,
                showTitleFlourish: data.showTitleFlourish,
                author: data.author,
                playerCount: data.playerCount,
                textAlignment: data.textAlignment,
                authorAlignment: data.authorAlignment,
              });
            }

            if (titleEditState.mode === 'firstNight') {
              scriptStore.updateTitleInfo({
                storytellerFirstNight: data.title,
                storytellerFirstNightTitleImage: data.titleImage,
                storytellerFirstNightTitleImageSize: data.titleImageSize,
                useStorytellerFirstNightTitleImage: data.useTitleImage,
              });
            }

            if (titleEditState.mode === 'otherNight') {
              scriptStore.updateTitleInfo({
                storytellerOtherNight: data.title,
                storytellerOtherNightTitleImage: data.titleImage,
                storytellerOtherNightTitleImageSize: data.titleImageSize,
                useStorytellerOtherNightTitleImage: data.useTitleImage,
              });
            }
          }}
        />
      )}

      {secondPageTitleEditDialogOpen && (
        <SecondPageTitleEditDialog
          key="second-page-title-edit"
          open={secondPageTitleEditDialogOpen}
          title={script?.secondPageTitleText || script?.title || ''}
          titleImage={script?.secondPageTitleImage}
          fontSize={script?.secondPageTitleFontSize}
          imageSize={script?.secondPageTitleImageSize}
          useImage={script?.useSecondPageTitleImage}
          defaultImageUrl={script?.titleImage}
          onClose={handleCloseSecondPageTitleEdit}
          onSave={handleSecondPageTitleSave}
        />
      )}

      {specialRuleEditDialogOpen && (
        <SpecialRuleEditDialog
          key="special-rule-edit"
          open={specialRuleEditDialogOpen}
          rule={editingSpecialRule}
          onClose={handleCloseSpecialRuleEdit}
          onSave={handleSpecialRuleSave}
        />
      )}

      {addCustomRuleDialogOpen && (
        <AddCustomRuleDialog
          key="add-custom-rule"
          open={addCustomRuleDialogOpen}
          onClose={handleCloseAddCustomRule}
          onAddRule={handleAddNewRule}
        />
      )}

      {aboutDialogOpen && (
        <AboutDialog
          key="about"
          open={aboutDialogOpen}
          onClose={handleCloseAboutDialog}
        />
      )}

      {customJinxDialogOpen && (
        <CustomJinxDialog
          key="custom-jinx"
          open={customJinxDialogOpen}
          onClose={handleCloseCustomJinx}
          onSave={(characterA, characterB, description) => {
            scriptStore.addCustomJinx(characterA, characterB, description);
            setCustomJinxDialogOpen(false);
          }}
          characters={script?.all || []}
        />
      )}



      {exportImageDialogOpen && (
        <AnimatedDialog
          key="export-image"
          open={exportImageDialogOpen}
          onClose={handleCloseExportImage}
          disableScrollLock={true}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pb: 2,
              pt: 3,
              px: 3,
            }}
          >
            <ImageIcon sx={{ fontSize: 32, color: '#ff9800' }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {t('dialog.exportImageTitle')}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.8, fontSize: '1rem' }}>
              {t('dialog.exportImageMessage')}
            </Typography>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '2px solid #fff3e0',
                backgroundColor: '#fffbf5',
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {t('dialog.exportImageTip')}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2.5, backgroundColor: '#fafafa', gap: 1 }}>
            <Button
              onClick={() => setExportImageDialogOpen(false)}
              sx={{
                px: 3,
                py: 1,
                fontWeight: 500,
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#eeeeee',
                }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              endIcon={<OpenInNewIcon />}
              onClick={() => {
                const url = language === 'cn'
                  ? 'https://www.ilovepdf.com/zh-cn/pdf_to_jpg'
                  : language === 'es'
                    ? 'https://www.ilovepdf.com/es/pdf_a_jpg'
                  : 'https://www.ilovepdf.com/pdf_to_jpg';
                window.open(url, '_blank');
                setExportImageDialogOpen(false);
              }}
              sx={{
                px: 3,
                py: 1,
                fontWeight: 600,
                backgroundColor: '#ff9800',
                '&:hover': {
                  backgroundColor: '#f57c00',
                }
              }}
            >
              {t('dialog.gotoILovePDF')}
            </Button>
          </DialogActions>
        </AnimatedDialog>
      )}

      {printDialogOpen && (
        <PrintDialog
          key="print"
          open={printDialogOpen}
          onClose={handleClosePrintDialog}
          onConfirm={handleConfirmPrint}
          t={t as (key: string) => string}
          language={language}
        />
      )}

      {unlockModeDialogOpen && (
        <UnlockModeDialog
          key="unlock-mode"
          open={unlockModeDialogOpen}
          onClose={() => {
            setUnlockModeDialogOpen(false);
            setPendingEditCharacter(null);
          }}
          onConfirm={handleUnlockAndEdit}
          t={t as (key: string) => string}
        />
      )}
      </AnimatePresence>

      {/* AI Agent (暫時隱藏不實作) */}
      {/* <AgentFAB /> */}
      {/* <AgentDialog /> */}
    </ThemeProvider >
    </AppErrorBoundary>
  );
});

export default App;
