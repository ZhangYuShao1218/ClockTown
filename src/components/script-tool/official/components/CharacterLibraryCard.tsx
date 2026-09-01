import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardContent,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import {
    Close as CloseIcon,
    PushPin as PushPinIcon,
    PushPinOutlined as PushPinOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from '../utils/i18n';
import CharacterImage from './CharacterImage';
import type { Character } from '../types';
import { THEME_COLORS } from '../theme/colors';
import CharacterLibraryContent from './CharacterLibraryContent';

interface CharacterLibraryCardProps {
    open: boolean;
    onClose: () => void;
    onAddCharacter: (character: Character) => void;
    onRemoveCharacter?: (character: Character) => void;
    selectedCharacters?: Character[];
    anchorEl?: HTMLElement | null;
    initialTeam?: string; // 初始选中的团队
    position?: { x: number; y: number }; // 角色库出现的位置
}


const CharacterLibraryCard = observer(({
    open,
    onClose,
    onAddCharacter,
    onRemoveCharacter,
    selectedCharacters = [],
    initialTeam,
    position,
}: CharacterLibraryCardProps) => {
    const { t } = useTranslation();
    const [isPinned, setIsPinned] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffsetRef = React.useRef({ x: 0, y: 0 });
    const dragStartRef = React.useRef({ x: 0, y: 0 });
    const cardRef = React.useRef<HTMLDivElement>(null);
    const rafRef = React.useRef<number | null>(null);

    // 处理打开时重置拖拽状态
    useEffect(() => {
        if (open) {
            dragOffsetRef.current = { x: 0, y: 0 };
            if (cardRef.current) {
                cardRef.current.style.transform = 'translate(0px, 0px)';
            }
            setIsDragging(false);
        }
    }, [open]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (isPinned) return;
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [isPinned, handleClose]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!e.currentTarget.classList.contains('draggable-header')) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - dragOffsetRef.current.x,
            y: e.clientY - dragOffsetRef.current.y,
        };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !cardRef.current) return;
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            const baseX = cardRect.left - dragOffsetRef.current.x;
            const baseY = cardRect.top - dragOffsetRef.current.y;
            let newOffsetX = e.clientX - dragStartRef.current.x;
            let newOffsetY = e.clientY - dragStartRef.current.y;
            const finalX = baseX + newOffsetX;
            const finalY = baseY + newOffsetY;
            const maxX = window.innerWidth - cardWidth;
            const maxY = window.innerHeight - cardHeight;
            if (finalX < 0) newOffsetX = -baseX;
            else if (finalX > maxX) newOffsetX = maxX - baseX;
            if (finalY < 0) newOffsetY = -baseY;
            else if (finalY > maxY) newOffsetY = maxY - baseY;
            const newOffset = { x: newOffsetX, y: newOffsetY };
            dragOffsetRef.current = newOffset;
            cardRef.current.style.transform = `translate(${newOffset.x}px, ${newOffset.y}px)`;
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {!isPinned && (
                        <motion.div
                            key="lib-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={handleBackdropClick}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 1000,
                                backgroundColor: 'transparent',
                            }}
                        />
                    )}

                    <motion.div
                        key="lib-card"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
                        style={{
                            position: 'fixed',
                            ...(position ? {
                                top: Math.min(position.y, window.innerHeight - 750),
                                left: Math.min(position.x, window.innerWidth - 420),
                            } : {
                                bottom: 100,
                                right: 24,
                            }),
                            zIndex: 1001,
                        }}
                    >
                        <Box ref={cardRef}>
                            <Card
                                sx={{
                                    width: { xs: 340, sm: 400 },
                                    height: {
                                        xs: 'min(calc(100vh - 180px), 720px)',
                                        sm: 'min(calc(100vh - 120px), 830px)',
                                    },
                                    maxHeight: 'calc(100vh - 5px)',
                                    boxShadow: 6,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: isDragging ? 'grabbing' : 'default',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    '& *': {
                                        userSelect: isDragging ? 'none !important' : 'auto',
                                        WebkitUserSelect: isDragging ? 'none !important' : 'auto',
                                    },
                                }}
                            >
                                {/* 标题栏 - 可拖拽 */}
                                <Box
                                    className="draggable-header"
                                    onMouseDown={handleMouseDown}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        pb: 1,
                                        borderBottom: '1px solid #e0e0e0',
                                        cursor: isDragging ? 'grabbing' : 'grab',
                                        '&:active': { cursor: 'grabbing' },
                                        flexShrink: 0,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CharacterImage
                                            src="/imgs/images/sources/logo2.png"
                                            alt="BOTC Script Tool"
                                            sx={{ height: 24, objectFit: 'contain' }}
                                        />
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {t('characterLibrary')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); setIsPinned(!isPinned); }}
                                            size="small"
                                            title={isPinned ? t('library.unpin') : t('library.pin')}
                                            sx={{
                                                color: isPinned ? THEME_COLORS.good : 'text.secondary',
                                                transition: 'all 0.2s',
                                                '&:hover': { color: THEME_COLORS.good, backgroundColor: 'rgba(76, 175, 80, 0.08)' },
                                            }}
                                        >
                                            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                            size="small"
                                            sx={{ '&:hover': { color: THEME_COLORS.evil, backgroundColor: 'rgba(244, 67, 54, 0.08)' } }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <CardContent sx={{ flex: 1, overflow: 'hidden', p: 0, '&:last-child': { pb: 0 }, minHeight: 0 }}>
                                    <CharacterLibraryContent
                                        active={open}
                                        initialTeam={initialTeam}
                                        selectedCharacters={selectedCharacters}
                                        onAddCharacter={onAddCharacter}
                                        onRemoveCharacter={onRemoveCharacter}
                                        autoFocusSearch
                                    />
                                </CardContent>
                            </Card>
                        </Box>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

export default CharacterLibraryCard;
