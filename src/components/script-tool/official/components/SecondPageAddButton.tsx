import { Box, Dialog, DialogTitle, DialogContent, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import type { SecondPageComponentType } from '../types';

interface SecondPageAddButtonProps {
  onAddComponent: (componentType: SecondPageComponentType) => void;
}

/**
 * 第二页添加组件按钮
 * 大的半透明加号，点击后显示组件选择对话框
 */
export const SecondPageAddButton = ({ onAddComponent }: SecondPageAddButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t, language } = useTranslation();

  const handleAdd = (type: SecondPageComponentType) => {
    onAddComponent(type);
    setDialogOpen(false);
  };

  return (
    <>
      {/* 大的半透明加号按钮 */}
      <Box
        className="second-page-add-component"
        onClick={() => setDialogOpen(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          margin: '40px auto',
          maxWidth: 600,
          border: '3px dashed rgba(0, 0, 0, 0.2)',
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderColor: 'rgba(25, 118, 210, 0.5)',
            transform: 'scale(1.02)',
            '& .add-icon': {
              color: '#1976d2',
              transform: 'rotate(90deg)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <AddIcon
            className="add-icon"
            sx={{
              fontSize: 80,
              color: 'rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: 600,
            }}
          >
            {t('secondPage.addComponent')}
          </Typography>
        </Box>
      </Box>

      {/* 组件选择对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            pb: 2,
          }}
        >
          {t('secondPage.addComponent')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            {/* 标题组件 */}
            <Button
              variant="outlined"
              onClick={() => handleAdd('title')}
              sx={{
                py: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              📝 {t('secondPage.title')}
            </Button>

            {/* 标准人数表 */}
            <Button
              variant="outlined"
              onClick={() => handleAdd('ppl_table1')}
              sx={{
                py: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              📊 {t('secondPage.playerTable1')}
            </Button>

            {/* 6-9人配置表 */}
            <Button
              variant="outlined"
              onClick={() => handleAdd('ppl_table2')}
              sx={{
                py: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              📊 {t('secondPage.playerTable2')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

