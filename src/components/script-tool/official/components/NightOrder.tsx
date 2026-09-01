import { Box, Typography, Paper } from '@mui/material';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { NightAction } from '../types';
import { THEME_COLORS } from '../theme/colors';
import CharacterImage from './CharacterImage';
import { normalizeImageUrl } from '../utils/jsonSafety';

function getActionId(action: NightAction, index: number): string {
  return `${normalizeImageUrl(action?.image)}-${index}`;
}

/** Extract a safe alt text from an image field that may be a string or string[] */
function getImageAlt(image: unknown): string {
  const url = normalizeImageUrl(image);
  if (!url) return 'Night order character';
  return url.split('/').pop()?.replace(/\.[^.]*$/, '') || 'Night order character';
}

interface NightOrderProps {
  title: string;
  actions?: NightAction[] | null;
  isMobile?: boolean;
  disabled?: boolean;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  compact?: boolean;
}

function SortableActionItem({
  action,
  index,
  isMobile,
  disabled = false,
  compact = false,
}: {
  action: NightAction;
  index: number;
  isMobile: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const COMPACT_SCALE = compact ? 0.65 : 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getActionId(action, index), disabled });

  const restrictedTransform = transform ? {
    ...transform,
    x: isMobile ? transform.x : 0,
  } : null;

  const style = {
    transform: CSS.Transform.toString(restrictedTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 只有這些特殊夜晚標誌圖本身已有圓形底板，不需額外套用
  const isSpecial = (() => {
    const url = (normalizeImageUrl(action?.image) || '').toLowerCase();
    return (
      url.includes('75px-mi') ||
      url.includes('75px-di') ||
      url.includes('75px-dusk') ||
      url.includes('75px-dawn')
    );
  })();

  return (
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(!disabled ? listeners : {})}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: disabled ? 'default' : 'grab',
          touchAction: disabled ? 'auto' : 'pan-y',
          my: 0.35,
          '&:active': {
            cursor: disabled ? 'default' : 'grabbing',
          },
        }}
      >
        {isSpecial ? (
          <CharacterImage
            src={normalizeImageUrl(action.image)}
            alt={getImageAlt(action.image)}
            sx={{
              width: { xs: 40 * COMPACT_SCALE, sm: 44 * COMPACT_SCALE, md: 58 * COMPACT_SCALE },
              height: { xs: 40 * COMPACT_SCALE, sm: 44 * COMPACT_SCALE, md: 58 * COMPACT_SCALE },
              transition: 'all 0.2s',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
              '&:hover': {
                transform: 'scale(1.08)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6)) brightness(1.05)',
              },
            }}
          />
        ) : (
          <Box
            sx={{
              width: { xs: 42 * COMPACT_SCALE, sm: 46 * COMPACT_SCALE, md: 60 * COMPACT_SCALE },
              height: { xs: 42 * COMPACT_SCALE, sm: 46 * COMPACT_SCALE, md: 60 * COMPACT_SCALE },
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, #f4e5c5 0%, #dcb37b 100%)',
              border: '1.5px solid rgba(120, 80, 30, 0.55)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'radial-gradient(circle at center, #fbf0d8 0%, #e6c48c 100%)',
                borderColor: 'rgba(120, 80, 30, 0.9)',
                transform: 'scale(1.08)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55)',
              },
            }}
          >
            <CharacterImage
              src={normalizeImageUrl(action.image)}
              alt={getImageAlt(action.image)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </Box>
    );
  }

export default function NightOrder({ title, actions, isMobile = false, disabled = false, onReorder, compact = false }: NightOrderProps) {
  const safeActions = Array.isArray(actions)
    ? actions.filter((action): action is NightAction => !!action && typeof action === 'object')
    : [];
  const safeTitle = typeof title === 'string' ? title : '';
  const COMPACT_SCALE = compact ? 0.65 : 1;
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Long-press (300ms) to drag; quick swipes keep page scrolling
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = safeActions.findIndex((action, idx) => getActionId(action, idx) === active.id);
      const newIndex = safeActions.findIndex((action, idx) => getActionId(action, idx) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const compactTitleChar = safeTitle.charAt(0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: compact ? 0 : 0, md: 0 },
        backgroundColor: isMobile ? THEME_COLORS.nightOrder.background : 'transparent',
        color: isMobile ? '#fefefe' : '#fefefe',
        borderRadius: 1.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
      }}
    >
      {/* 標題 (具備半透明邊框與底板以強化背景對比度) */}
      {compact && !isMobile ? (
        <Box sx={{ textAlign: 'center', mt: 0.5, mb: 0.3 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28 * COMPACT_SCALE,
            height: 28 * COMPACT_SCALE,
            borderRadius: '50%',
            border: '1.5px solid #ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            color: '#fefefe',
            fontSize: `${0.85 * COMPACT_SCALE}rem`,
            fontWeight: 'bold',
          }}>
            {compactTitleChar}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: isMobile ? 1 : 1.5,
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid rgba(255, 255, 255, 0.75)',
              backgroundColor: 'rgba(0, 0, 0, 0.42)',
              backdropFilter: 'blur(3px)',
              borderRadius: 2,
              px: isMobile ? 1.5 : 0.8,
              py: isMobile ? 0.4 : 0.8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 0 6px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: { xs: `${0.95 * COMPACT_SCALE}rem`, sm: `${1.05 * COMPACT_SCALE}rem`, md: `${1.3 * COMPACT_SCALE}rem` },
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
                letterSpacing: '0.04em',
              }}
            >
              {isMobile ? (
                safeTitle
              ) : (
                safeTitle.split('').map((char, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{
                      display: 'block',
                      lineHeight: char === '晚' ? 1.3 : 1.1,
                      mt: char === '晚' ? 0.3 : 0,
                      minHeight: char === ' ' ? '0.5em' : 'auto',
                    }}
                  >
                    {char === ' ' ? ' ' : char}
                  </Box>
                ))
              )}
            </Typography>
          </Box>
        </Box>
      )}

      {/* 行动图标列表 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={safeActions.map((action, idx) => getActionId(action, idx))}
          strategy={isMobile ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <Box
            sx={{
              flex: compact ? '0 0 auto' : 1,
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              justifyContent: (isMobile || compact) ? 'center' : 'flex-start',
              alignItems: compact ? 'center' : 'stretch',
              alignContent: isMobile ? 'flex-start' : 'stretch',
              gap: isMobile ? 0.5 : 0,
              '&::-webkit-scrollbar': {
                width: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1.5,
              },
            }}
          >
            {safeActions.map((action, index) => (
              <SortableActionItem
                key={getActionId(action, index)}
                action={action}
                index={index}
                isMobile={isMobile}
                disabled={disabled}
                compact={compact}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Paper>
  );
}
