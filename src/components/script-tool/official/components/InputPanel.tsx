import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import { AllScripts } from '../../../../data/scripts';
import { Cloud } from 'lucide-react';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Upload,
  Download,
  Refresh,
  LibraryBooks,
  RestartAlt,
  Share,
  Tune,
  Add,
  Print,
  Image,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { configStore } from '../stores/ConfigStore';
import { uiConfigStore } from '../stores/UIConfigStore';
import { scriptStore } from '../stores/ScriptStore';
import { useTranslation } from '../utils/i18n';
import { alertSuccess, alertError, alertInfo, alertWarning } from '../utils/alert';
import { registerFileSyncSaveCallback, unregisterFileSyncSaveCallback } from '../utils/event';
import { trackUploadJson } from '../utils/analytics';
import CloudScriptDialog from './CloudScriptDialog';
import { saveScript } from '../lib/cloudScripts';
import { authStore } from '../stores/AuthStore';
import IOSSwitch from './IOSSwitch';
import UploadJsonDialog from './UploadJsonDialog';
import FileSyncBanner from './FileSyncBanner';

interface InputPanelProps {
  onGenerate: (json: string, title?: string, author?: string) => void;
  onExportPDF: () => void;
  onExportImage: () => void;
  onExportJson: () => void;
  onExportOriginalJson: () => void;
  onShare: () => void;
  onClear?: () => void;
  onOpenUISettings?: () => void;
  onAddCustomRule?: () => void;
  onOpenAboutDialog?: () => void;
  onJsonChange?: (json: string) => void;  // 新增：JSON输入变化回调
  hasScript: boolean;
  currentJson?: string;
  jsonParseError?: string; // 新增：JSON 解析错误信息
}

const InputPanel = observer(({ onGenerate, onExportPDF, onExportImage, onExportJson, onExportOriginalJson, onShare, onClear, onOpenUISettings, onAddCustomRule, onOpenAboutDialog, onJsonChange, hasScript, currentJson, jsonParseError }: InputPanelProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [jsonInput, setJsonInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [error, setError] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [cloudDialogOpen, setCloudDialogOpen] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(200); // JSON编辑框高度
  const [isResizing, setIsResizing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 拖拽状态
  const [repoAnchor, setRepoAnchor] = useState<null | HTMLElement>(null); // 專案劇本倉庫選單

  // 將本專案的 Script 轉為劇本工具可解析的 JSON 並匯入
  const importProjectScript = (scriptId: string) => {
    const src = AllScripts[scriptId];
    if (!src) return;
    const json = JSON.stringify([
      { id: '_meta', name: src.name, author: src.author || '' },
      ...src.roles.map((r) => ({
        id: r.id,
        name: r.name,
        ability: r.ability,
        team: r.type,
        image: r.icon || r.image || '',
        firstNight: r.firstNight ?? 0,
        otherNight: r.otherNight ?? 0,
        ...(r.firstNightReminder ? { firstNightReminder: r.firstNightReminder } : {}),
        ...(r.otherNightReminder ? { otherNightReminder: r.otherNightReminder } : {}),
      })),
    ], null, 2);
    onJsonChange?.(json);
    onGenerate(json);
    setRepoAnchor(null);
  };

  // 文件同步相关状态
  const [fileSyncEnabled, setFileSyncEnabled] = useState(false);
  const [syncFileHandle, setSyncFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [syncFileName, setSyncFileName] = useState('');
  const fileSyncPollingRef = useRef<number | null>(null);
  const lastModifiedRef = useRef<number>(0);

  // 用于防抖的 ref
  const debounceTimerRef = useRef<number | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const previousOfficialIdParseModeRef = useRef(configStore.config.officialIdParseMode);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(0);
  const dragCounterRef = useRef<number>(0); // 拖拽计数器，解决子元素触发 dragLeave 的问题

  // 监听官方ID解析模式的变化，触发重新解析JSON
  useEffect(() => {
    const currentMode = configStore.config.officialIdParseMode;
    const previousMode = previousOfficialIdParseModeRef.current;

    // 只在模式真正变化时触发，且当前有JSON内容时才重新生成
    if (currentMode !== previousMode && currentJson && currentJson.trim()) {
      console.log('Official ID parse mode changed, regenerating script', {
        from: previousMode,
        to: currentMode
      });

      // 触发重新生成剧本
      try {
        onGenerate(currentJson);
      } catch (error) {
        console.error('Failed to regenerate script:', error);
      }
    }

    // 更新 ref
    previousOfficialIdParseModeRef.current = currentMode;
  }, [configStore.config.officialIdParseMode, currentJson, onGenerate]);

  // 同步currentJson到jsonInput（只在外部更新时）
  useEffect(() => {
    if (currentJson && currentJson !== jsonInput) {
      isUpdatingFromPropRef.current = true;
      setJsonInput(currentJson);
      // 短暂延迟后重置标记，避免影响后续用户输入
      setTimeout(() => {
        isUpdatingFromPropRef.current = false;
      }, 100);
    }
  }, [currentJson]);

  // 防抖处理 JSON 变化
  const debouncedOnJsonChange = useCallback((value: string) => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(() => {
      if (onJsonChange && !isUpdatingFromPropRef.current) {
        onJsonChange(value);
      }
    }, 500); // 500ms 防抖延迟
  }, [onJsonChange]);

  // 文件同步：保存到本地文件
  const saveToLocalFile = useCallback(async () => {
    if (!syncFileHandle || !fileSyncEnabled) {
      return;
    }

    try {
      const writable = await syncFileHandle.createWritable();
      await writable.write(jsonInput);
      await writable.close();
      alertSuccess(t('fileSync.saved'), 1500);
      console.log('Saved to local file:', syncFileName);
    } catch (error) {
      console.error('Failed to save to local file:', error);
      alertWarning('保存到本地文件失败', 2000);
    }
  }, [syncFileHandle, fileSyncEnabled, jsonInput, syncFileName, t]);

  // 文件同步：检测文件变化
  const checkFileChanges = useCallback(async () => {
    if (!syncFileHandle || !fileSyncEnabled) {
      return;
    }

    try {
      const file = await syncFileHandle.getFile();
      const currentModified = file.lastModified;

      // 如果文件有变化
      if (lastModifiedRef.current && currentModified > lastModifiedRef.current) {
        const content = await file.text();

        // 只有当内容真的不同时才更新
        if (content !== jsonInput) {
          isUpdatingFromPropRef.current = true;
          setJsonInput(content);

          // 通知父组件
          if (onJsonChange) {
            onJsonChange(content);
          }

          alertInfo(t('fileSync.fileChanged'), 1500);
          console.log('File change detected, synced');

          setTimeout(() => {
            isUpdatingFromPropRef.current = false;
          }, 100);
        }
      }

      lastModifiedRef.current = currentModified;
    } catch (error) {
      console.error('Failed to detect file changes:', error);
    }
  }, [syncFileHandle, fileSyncEnabled, jsonInput, onJsonChange, t]);

  // 启动文件同步轮询
  useEffect(() => {
    if (fileSyncEnabled && syncFileHandle) {
      // 每 2 秒检测一次文件变化
      fileSyncPollingRef.current = window.setInterval(checkFileChanges, 2000);

      return () => {
        if (fileSyncPollingRef.current) {
          clearInterval(fileSyncPollingRef.current);
          fileSyncPollingRef.current = null;
        }
      };
    }
  }, [fileSyncEnabled, syncFileHandle, checkFileChanges]);

  // 注册 Ctrl+S 保存回调
  useEffect(() => {
    if (fileSyncEnabled && syncFileHandle) {
      registerFileSyncSaveCallback(saveToLocalFile);

      return () => {
        unregisterFileSyncSaveCallback();
      };
    }
  }, [fileSyncEnabled, syncFileHandle, saveToLocalFile]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (fileSyncPollingRef.current) {
        clearInterval(fileSyncPollingRef.current);
      }
      unregisterFileSyncSaveCallback();
    };
  }, []);

  // 当 jsonInput 变化时只更新本地状态，不触发自动解析
  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    // 移除自动解析，只在点击生成剧本时才解析
  };

  // 拖拽上传处理（使用计数器解决子元素触发问题）
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current += 1;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current -= 1;

    // 只有当计数器归零时才真正离开
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 重置计数器和状态
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // 检查文件类型
      if (!file.name.endsWith('.json')) {
        alertWarning(t('upload.onlyJsonFiles'), 2500);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleJsonInputChange(content);
        alertSuccess(t('upload.fileUploaded'), 2000);
        trackUploadJson();
      };
      reader.onerror = () => {
        alertWarning(t('upload.fileReadError'), 2500);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = () => {
    try {
      setError('');
      if (!jsonInput.trim()) {
        setError(t('input.errorEmpty'));
        return;
      }

      // 点击生成按钮时，先通知父组件更新 JSON（如果有回调）
      if (onJsonChange && !isUpdatingFromPropRef.current) {
        onJsonChange(jsonInput);
      }

      // 然后触发生成剧本
      onGenerate(jsonInput, titleInput, authorInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('input.errorParse'));
    }
  };

  const handleResetSettings = () => {
    setResetDialogOpen(true);

  };

  const handleConfirmReset = async () => {
    try {
      // 1. 完全清空 ScriptStore（删除 localStorage）
      scriptStore.clear();

      // 2. 重置所有配置 store（删除 localStorage）
      configStore.resetToDefault();
      await uiConfigStore.resetToDefault(); // 异步清理字体和 localStorage

      // 3. 额外保险：手动清理所有可能的 localStorage 键
      const keysToRemove = [
        'botc-script-data',
        'botc-app-config',
        'botc-ui-config'
      ];

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`✓ Deleted localStorage key: ${key}`);
        } catch (error) {
          console.error(`Failed to delete ${key}:`, error);
        }
      });

      // 4. 清空输入框
      setJsonInput('');
      setTitleInput('');
      setAuthorInput('');
      setError('');

      setResetDialogOpen(false);

      console.log('🎉 All settings and data have been reset!');

      // 5. 刷新页面，让应用重新初始化（作为新用户）
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error during reset:', error);
      alert(t('dialog.resetFailed'));
      setResetDialogOpen(false);
    }
  };

  const handleCancelReset = () => {
    setResetDialogOpen(false);
  };

  // 简单上传
  const handleSimpleUpload = (content: string) => {
    handleJsonInputChange(content);
    trackUploadJson();
  };

  // 开启文件同步
  const handleFileSyncStart = async (fileHandle: FileSystemFileHandle, content: string) => {
    try {
      // 设置文件同步状态
      setSyncFileHandle(fileHandle);
      setSyncFileName(fileHandle.name);
      setFileSyncEnabled(true);

      // 读取初始文件内容
      const file = await fileHandle.getFile();
      lastModifiedRef.current = file.lastModified;

      // 更新 JSON 输入框
      handleJsonInputChange(content);

      // 提示用户
      alertSuccess(t('fileSync.started'), 2000);
      console.log('File sync started:', fileHandle.name);
    } catch (error) {
      console.error('Failed to start file sync:', error);
      alertWarning('Failed to start file sync', 2000);
    }
  };

  // 关闭文件同步
  const handleFileSyncStop = () => {
    // 清除状态
    setFileSyncEnabled(false);
    setSyncFileHandle(null);
    setSyncFileName('');
    lastModifiedRef.current = 0;

    // 清除轮询定时器
    if (fileSyncPollingRef.current) {
      clearInterval(fileSyncPollingRef.current);
      fileSyncPollingRef.current = null;
    }

    // 注销保存回调
    unregisterFileSyncSaveCallback();

    // 提示用户
    alertInfo(t('fileSync.stopped'), 2000);
    console.log('File sync stopped');
  };

  const handleClearClick = () => {
    // 如果有剧本，显示确认对话框
    if (hasScript) {
      setClearDialogOpen(true);
    } else {
      // 如果没有剧本，直接清空输入
      handleClear();
    }
  };

  const handleClear = () => {
    // 不清空JSON输入框，保留从父组件传来的默认JSON框架
    // setJsonInput(''); // 注释掉，让父组件控制JSON内容
    setTitleInput('');
    setAuthorInput('');
    setError('');
    setClearDialogOpen(false);
    // 调用父组件的清空回调，清空剧本和存储
    if (onClear) {
      onClear();
    }
  };

  const handleCancelClear = () => {
    setClearDialogOpen(false);
  };

  const handleCloudSave = async () => {
    if (!authStore.isLoggedIn) {
      authStore.loginDialogOpen = true;
      return;
    }
    if (!currentJson || !hasScript) return;
    setCloudSaving(true);
    const title = titleInput || scriptStore.script?.title || 'Untitled';
    const result = await saveScript(title, currentJson);
    setCloudSaving(false);
    if (result.ok) {
      alertSuccess(result.id ? t('cloudScripts.saved') : t('cloudScripts.alreadySaved'));
    } else {
      alertError(result.error || 'Save failed');
    }
  };

  const handleCloudLoad = (json: string, _name: string) => {
    onJsonChange?.(json);
  };

  // 拖动调整大小的处理函数
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = textareaHeight;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY.current;
      const newHeight = Math.max(100, Math.min(800, resizeStartHeight.current + deltaY));
      setTextareaHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Paper
      elevation={3}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mb: 0,
        fontFamily: 'sans-serif',
        '& *': { fontFamily: 'sans-serif !important' },
        backgroundColor: isDragging ? '#f5f5f5' : '#fefefe',
        borderRadius: '16px 16px 0 0',
        border: isDragging ? '3px dashed #9e9e9e' : '1.5px solid #cbd5e1',
        borderBottom: 'none',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.18)',
        transition: 'all 0.3s',
        position: 'relative',
        '@media print': {
          display: 'none', // 打印时隐藏整个输入面板
        },
      }}
    >
      {/* 拖拽提示遮罩 - 覆盖整个面板 */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            pointerEvents: 'none',
            zIndex: 9999,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 4,
              backgroundColor: '#ffffff',
              borderRadius: 3,
              border: '2px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Upload sx={{ fontSize: 64, color: '#757575' }} />
            <Typography variant="h5" sx={{ color: '#424242', fontWeight: 700 }}>
              {t('upload.dropToUpload')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {t('upload.onlyJsonFiles')}
            </Typography>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            fontSize: { xs: '1.3rem', sm: '1.5rem' },
            width: { xs: '100%', md: 'auto' },
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          {t('app.title')}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 1 }}
          sx={{
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: 0, md: 'min-content' },
            alignItems: { xs: 'stretch', sm: 'center' },
            flexShrink: { md: 0 },
            flexWrap: { sm: 'wrap' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => navigate('/image-gen')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              boxSizing: 'border-box',
              whiteSpace: { xs: 'normal', sm: 'nowrap' },
              borderColor: '#9c27b0',
              color: '#9c27b0',
              '&:hover': {
                borderColor: '#7b1fa2',
                backgroundColor: 'rgba(156, 39, 176, 0.08)',
              },
            }}
          >
            {t('imageGen.nav.imageGen')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<LibraryBooks />}
            onClick={(e) => setRepoAnchor(e.currentTarget)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              boxSizing: 'border-box',
              whiteSpace: { xs: 'normal', sm: 'nowrap' },
              borderColor: '#0078ba',
              color: '#0078ba',
              '&:hover': {
                borderColor: '#005a8c',
                backgroundColor: 'rgba(0, 120, 186, 0.08)',
              },
            }}
          >
            {t('app.scriptRepository')}
          </Button>
          <Menu
            anchorEl={repoAnchor}
            open={Boolean(repoAnchor)}
            onClose={() => setRepoAnchor(null)}
            disableScrollLock
          >
            {Object.values(AllScripts).map((s) => (
              <MenuItem key={s.id} onClick={() => importProjectScript(s.id)}>
                {s.name}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {/* 文件同步横幅 */}
        {fileSyncEnabled && syncFileName && (
          <FileSyncBanner
            fileName={syncFileName}
            onClose={handleFileSyncStop}
          />
        )}

        {/* JSON 输入框 */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            multiline
            fullWidth
            label={t('input.jsonLabel')}
            placeholder={t('input.jsonPlaceholder')}
            value={jsonInput}
            onChange={(e) => handleJsonInputChange(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                height: `${textareaHeight}px`,
                alignItems: 'flex-start',
                borderTopLeftRadius: fileSyncEnabled ? 0 : 1,
                borderTopRightRadius: fileSyncEnabled ? 0 : 1,
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              },
            }}
          />
          {/* 拖动手柄 */}
          <Box
            onMouseDown={handleResizeStart}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '12px',
              cursor: 'ns-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isResizing ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
              '&::before': {
                content: '""',
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: isResizing ? '#1976d2' : '#bdbdbd',
                transition: 'background-color 0.2s',
              },
              '&:hover::before': {
                backgroundColor: '#1976d2',
              },
            }}
          />
        </Box>

        {/* 错误提示 */}
        {(error || jsonParseError) && (
          <Alert severity="error" onClose={() => setError('')}>
            {error || jsonParseError}
          </Alert>
        )}

        {/* 第一行：生成剧本、上传JSON、导出JSON、分享剧本、导出PDF */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={handleGenerate}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 20%' },
              minHeight: 48,
            }}
          >
            {t('input.generateScript')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Upload />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
            }}
          >
            {t('input.uploadJson')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Print />}
            onClick={onExportPDF}
            disabled={!hasScript}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
            }}
          >
            {t('input.exportPDF')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Image />}
            onClick={onExportImage}
            disabled={!hasScript}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
            }}
          >
            {t('input.exportImage')}
          </Button>
        </Box>

        {/* 第二行：清空、添加特殊规则、PDF导出设置 */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            size="large"
            color="error"
            startIcon={<Refresh />}
            onClick={handleClearClick}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 44%' },
              minHeight: 48,
            }}
          >
            {t('input.clear')}
          </Button>

          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<Add />}
            onClick={onAddCustomRule}
            disabled={!hasScript}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
            }}
          >
            {t('specialRules.add')}
          </Button>

        </Box>

      </Stack>

      {/* 重置确认对话框 */}
      <Dialog
        open={resetDialogOpen}
        onClose={handleCancelReset}
        disableScrollLock={true}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">
          {t('dialog.resetTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            {t('dialog.resetMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReset} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmReset} color="warning" variant="contained" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 清空确认对话框 */}
      <Dialog
        open={clearDialogOpen}
        onClose={handleCancelClear}
        disableScrollLock={true}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
      >
        <DialogTitle id="clear-dialog-title">
          {t('dialog.clearTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-dialog-description">
            {t('dialog.clearMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleClear} color="error" variant="contained" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 上传 JSON 对话框 */}
      <UploadJsonDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSimpleUpload={handleSimpleUpload}
        onExportOriginalJson={onExportOriginalJson}
      />
      <CloudScriptDialog
        open={cloudDialogOpen}
        onClose={() => setCloudDialogOpen(false)}
        onLoad={handleCloudLoad}
      />
    </Paper>
  );
});

export default InputPanel;
