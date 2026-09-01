import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Upload, Download } from '@mui/icons-material';
import { useTranslation } from '../utils/i18n';

interface UploadJsonDialogProps {
  open: boolean;
  onClose: () => void;
  onSimpleUpload: (content: string) => void;
  onExportOriginalJson: () => void;
}

const UploadJsonDialog = ({
  open,
  onClose,
  onSimpleUpload,
  onExportOriginalJson,
}: UploadJsonDialogProps) => {
  const { t } = useTranslation();

  const handleSimpleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onSimpleUpload(content);
        onClose();
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadOriginal = () => {
    onExportOriginalJson();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock={true}
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
        <Upload sx={{ fontSize: 32, color: '#1976d2' }} />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {t('input.uploadJson')}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 3, lineHeight: 1.7 }}>
          {t('upload.selectMode')}
        </Typography>

        {/* 简单上传卡片 */}
        <Box
          component="label"
          sx={{
            display: 'block',
            mb: 2,
            p: 2.5,
            borderRadius: 2,
            border: '2px solid #e3f2fd',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: '#e3f2fd',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Upload sx={{ color: '#1976d2', fontSize: 24 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {t('upload.simpleMode')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
            {t('upload.simpleDesc')}
          </Typography>
          <input
            type="file"
            accept=".json"
            hidden
            onChange={handleSimpleUpload}
          />
        </Box>

        {/* 下載（匯出原始 JSON）卡片 */}
        <Box
          onClick={handleDownloadOriginal}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '2px solid #e8f5e9',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#43a047',
              backgroundColor: '#e8f5e9',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Download sx={{ color: '#43a047', fontSize: 24 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#43a047' }}>
              {t('upload.syncMode')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
            {t('upload.syncDesc')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, backgroundColor: '#fafafa' }}>
        <Button
          onClick={onClose}
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
      </DialogActions>
    </Dialog>
  );
};

export default UploadJsonDialog;

