import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import MarkdownRenderer from './MarkdownRenderer';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { getCharacterDictionary } from '../data';
import { useTranslation } from '../utils/i18n';
import CharacterImage from './CharacterImage';
import type { Character } from '../types';
import { THEME_COLORS } from '../theme/colors';
import { getFabledCharacters } from '../data/extras/fabled';
import { getLoricCharacters } from '../data/extras/loric';
import { PINYIN_MAP } from '../data/utils/pinyinMap';

// 剧本系列 → 颜色组合(背景色/前景色)
const SERIES_COLORS: Record<string, { bg: string; fg: string }> = {
    '奥德赛': { bg: '#B8860B', fg: '#ffffff' },
};

// 懒加载图片组件 - 使用统一的CharacterImage组件
const LazyAvatar = React.memo(({ character, teamColor, size = 48 }: { character: Character; teamColor: string; size?: number }) => {
    return (
        <CharacterImage
            component="avatar"
            src={character.image}
            alt={character.name}
            sx={{
                width: size,
                height: size,
                border: `2px solid ${teamColor}`,
            }}
        />
    );
});

interface CharacterItemProps {
    character: Character;
    teamColor: string;
    showTeamChip: boolean;
    isSelected: boolean;
    teamTabs: Array<{ key: string; label: string; color: string }>;
    onAddCharacter: (character: Character) => void;
    onRemoveCharacter?: (character: Character) => void;
    hideSelectedChip?: boolean;
    fontBump?: number;
    avatarSize?: number;
}

// 角色项组件，使用memo优化
const CharacterItem = React.memo(({
    character,
    teamColor,
    showTeamChip,
    isSelected,
    teamTabs,
    onAddCharacter,
    onRemoveCharacter,
    hideSelectedChip = false,
    fontBump = 0,
    avatarSize = 48,
}: CharacterItemProps) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (isSelected && onRemoveCharacter) {
            onRemoveCharacter(character);
        } else {
            onAddCharacter(character);
        }
    };

    return (
        <>
            <ListItem
                component="div"
                onClick={handleClick}
                sx={{
                    py: 1.5,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid transparent',
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                        backgroundColor: isSelected
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(0, 0, 0, 0.04)',
                    },
                }}
            >
                <ListItemAvatar>
                    <LazyAvatar character={character} teamColor={teamColor} size={avatarSize} />
                </ListItemAvatar>
                <ListItemText
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 'bold',
                                    color: teamColor,
                                    fontSize: `calc(0.9rem + ${fontBump}rem)`,
                                }}
                            >
                                {character.name}
                            </Typography>

                            {isSelected && !hideSelectedChip && (
                                <Chip
                                    label={t('selected')}
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: `calc(0.6rem + ${fontBump}rem)`,
                                        backgroundColor: THEME_COLORS.good,
                                        color: '#fff',
                                        '& .MuiChip-label': {
                                            px: 0.5,
                                        },
                                    }}
                                />
                            )}
                            {showTeamChip && (
                                <Chip
                                    label={teamTabs.find(tb => tb.key === character.team)?.label || character.team}
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: `calc(0.6rem + ${fontBump}rem)`,
                                        backgroundColor: teamColor,
                                        color: '#fff',
                                        '& .MuiChip-label': {
                                            px: 0.5,
                                        },
                                    }}
                                />
                            )}
                            {/* 作者标签 */}
                            {character.author && (
                                <Chip
                                    label={`@${character.author}`}
                                    size="small"
                                    sx={{
                                        height: 16,
                                        fontSize: `calc(0.55rem + ${fontBump}rem)`,
                                        backgroundColor: '#9e9e9e',
                                        color: '#fff',
                                        '& .MuiChip-label': {
                                            px: 0.5,
                                        },
                                    }}
                                />
                            )}
                            {/* 系列标签(如"奥德赛") */}
                            {character.series && (() => {
                                const sc = SERIES_COLORS[character.series] || { bg: '#B8860B', fg: '#ffffff' };
                                return (
                                    <Chip
                                        label={`@${character.series}`}
                                        size="small"
                                        sx={{
                                            height: 16,
                                            fontSize: `calc(0.55rem + ${fontBump}rem)`,
                                            backgroundColor: sc.bg,
                                            color: sc.fg,
                                            '& .MuiChip-label': {
                                                px: 0.5,
                                            },
                                        }}
                                    />
                                );
                            })()}
                        </Box>
                    }
                    secondary={
                        <Box
                            sx={{
                                fontSize: `calc(0.75rem + ${fontBump}rem)`,
                                lineHeight: 1.3,
                                color: 'text.secondary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                '& p': { m: 0, display: 'inline' },
                                '& ul, & ol': { m: 0, pl: 2 },
                            }}
                        >
                            <MarkdownRenderer content={character.ability} />
                        </Box>
                    }
                />
            </ListItem>
            <Divider />
        </>
    );
});

export interface CharacterLibraryContentProps {
    onAddCharacter: (character: Character) => void;
    onRemoveCharacter?: (character: Character) => void;
    selectedCharacters?: Character[];
    /** 是否處於作用中（用於延遲/略過昂貴計算），預設 true */
    active?: boolean;
    /** 初始選中的陣營標籤 key */
    initialTeam?: string;
    /** 字級加成（pt），例如 2 代表所有文字 +2pt */
    fontScalePt?: number;
    /** 隱藏已選角色卡片上的「已選」標籤 */
    hideSelectedChip?: boolean;
    /** 隱藏「全部」陣營篩選標籤 */
    hideAllTeamTab?: boolean;
    /** 開啟時自動聚焦搜尋框 */
    autoFocusSearch?: boolean;
}

/**
 * 角色庫的內容主體（搜尋 + 陣營標籤 + 角色清單）。
 * 從 CharacterLibraryCard 抽離，供浮動卡片與左側抽屜共用。
 */
const CharacterLibraryContent = observer(({
    onAddCharacter,
    onRemoveCharacter,
    selectedCharacters = [],
    active = true,
    initialTeam,
    fontScalePt = 0,
    hideSelectedChip = false,
    hideAllTeamTab = false,
    autoFocusSearch = false,
}: CharacterLibraryContentProps) => {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [seriesFilter, setSeriesFilter] = useState('');
    const [seriesMenuAnchor, setSeriesMenuAnchor] = useState<null | HTMLElement>(null);
    const [renderCount, setRenderCount] = useState(-1);
    const listRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const fontBump = (fontScalePt || 0) / 12; // 2pt ≈ 0.167rem
    const emptyTeams = () => ({
        townsfolk: [] as Character[],
        outsider: [] as Character[],
        minion: [] as Character[],
        demon: [] as Character[],
        fabled: [] as Character[],
        loric: [] as Character[],
        traveler: [] as Character[],
    });

    const currentCharacterData = useMemo(() => {
        return getCharacterDictionary(language);
    }, [language]);

    const charactersByTeam = useMemo(() => {
        if (!active) return emptyTeams();

        const teams = {
            townsfolk: [] as Character[],
            outsider: [] as Character[],
            minion: [] as Character[],
            demon: [] as Character[],
            fabled: getFabledCharacters(language),
            loric: getLoricCharacters(language),
            traveler: [] as Character[],
        };

        const seenIds = new Set<string>();

        Object.values(currentCharacterData).forEach((char) => {
            const character = char as Character;
            if (seenIds.has(character.id) || character.team === 'fabled' || character.team === 'loric') {
                return;
            }
            seenIds.add(character.id);
            if (teams[character.team as keyof typeof teams]) {
                teams[character.team as keyof typeof teams].push(character);
            }
        });

        Object.keys(teams).forEach((teamKey) => {
            const arr = teams[teamKey as keyof typeof teams];
            if (arr.length > 1) {
                teams[teamKey as keyof typeof teams] = [...arr.filter(c => !c.author), ...arr.filter(c => c.author)];
            }
        });

        return teams;
    }, [currentCharacterData, language, active]);

    const availableSeries = useMemo(() => {
        const set = new Set<string>();
        Object.values(charactersByTeam).forEach(arr => arr.forEach(c => { if (c.series) set.add(c.series); }));
        return Array.from(set);
    }, [charactersByTeam]);

    const filteredCharacters = useMemo(() => {
        if (!active) return emptyTeams();
        if (!searchTerm.trim()) return charactersByTeam;

        const term = searchTerm.toLowerCase();
        const filtered = emptyTeams();

        Object.entries(charactersByTeam).forEach(([team, characters]) => {
            const teamKey = team as keyof typeof filtered;
            filtered[teamKey] = characters.filter((char) => {
                const nameMatch = char.name.toLowerCase().includes(term);
                const abilityMatch = char.ability.toLowerCase().includes(term);
                const pinyinMatch = PINYIN_MAP[char.name]?.includes(term);
                const idMatch = char.id.toLowerCase().includes(term);
                const seriesMatch = (char.series || '').toLowerCase().includes(term);
                return nameMatch || abilityMatch || pinyinMatch || idMatch || seriesMatch;
            });
        });

        return filtered;
    }, [charactersByTeam, searchTerm, active]);

    const teamTabs = [
        { key: 'selected', label: t('selectedCharacters'), color: THEME_COLORS.good },
        ...(hideAllTeamTab ? [] : [{ key: 'all', label: t('all'), color: THEME_COLORS.text.primary }]),
        { key: 'townsfolk', label: t('townsfolk'), color: THEME_COLORS.good },
        { key: 'outsider', label: t('outsider'), color: THEME_COLORS.good },
        { key: 'minion', label: t('minion'), color: THEME_COLORS.evil },
        { key: 'demon', label: t('demon'), color: THEME_COLORS.evil },
        { key: 'fabled', label: t('fabled'), color: THEME_COLORS.fabled },
        { key: 'loric', label: t('loric'), color: THEME_COLORS.loric },
        { key: 'traveler', label: t('traveler'), color: THEME_COLORS.purple },
    ];

    const currentTeam = teamTabs[selectedTab];

    const currentCharacters = useMemo(() => {
        let chars: Character[] = [];
        if (currentTeam.key === 'selected') {
            if (!searchTerm.trim()) {
                chars = selectedCharacters;
            } else {
                const term = searchTerm.toLowerCase();
                chars = selectedCharacters.filter((char) => {
                    const nameMatch = char.name.toLowerCase().includes(term);
                    const abilityMatch = char.ability.toLowerCase().includes(term);
                    const pinyinMatch = PINYIN_MAP[char.name]?.includes(term);
                    const idMatch = char.id.toLowerCase().includes(term);
                    const seriesMatch = (char.series || '').toLowerCase().includes(term);
                    return nameMatch || abilityMatch || pinyinMatch || idMatch || seriesMatch;
                });
            }
        } else if (currentTeam.key === 'all') {
            chars = Object.values(filteredCharacters).flat();
        } else {
            const teamCharacters = filteredCharacters[currentTeam.key as keyof typeof filteredCharacters];
            chars = teamCharacters ? teamCharacters.filter(char => char.team === currentTeam.key) : [];
        }
        if (seriesFilter) {
            chars = chars.filter(c => c.series === seriesFilter);
        }
        return chars;
    }, [currentTeam.key, filteredCharacters, selectedCharacters, searchTerm, seriesFilter]);

    // 團隊/系列/搜尋變化時,回第1段;隨後每幀補一段,共3段展開到全量
    useEffect(() => {
        setRenderCount(currentCharacters.length ? Math.max(1, Math.ceil(currentCharacters.length / 3)) : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTeam.key, seriesFilter, searchTerm]);
    useEffect(() => {
        if (renderCount < 0 || renderCount >= currentCharacters.length) return;
        const step = Math.max(1, Math.ceil(currentCharacters.length / 3));
        const id = requestAnimationFrame(() => setRenderCount(prev => Math.min(currentCharacters.length, prev + step)));
        return () => cancelAnimationFrame(id);
    }, [renderCount, currentCharacters.length]);

    useEffect(() => {
        if (!active) return;
        setSearchTerm('');
        if (initialTeam) {
            const teamIndex = teamTabs.findIndex(tab => tab.key === initialTeam);
            setSelectedTab(teamIndex !== -1 ? teamIndex : 0);
        } else {
            setSelectedTab(0);
        }
        if (autoFocusSearch) {
            requestAnimationFrame(() => searchInputRef.current?.focus());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, initialTeam]);

    const handleAddCharacter = useCallback((character: Character) => {
        onAddCharacter(character);
    }, [onAddCharacter]);

    const handleRemoveCharacter = useCallback((character: Character) => {
        if (onRemoveCharacter) onRemoveCharacter(character);
    }, [onRemoveCharacter]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* 搜尋欄 */}
            <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('searchCharacters')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputRef={searchInputRef}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
            </Box>

            {/* 陣營標籤頁 */}
            <Box sx={{ borderBottom: '1px solid #e0e0e0', p: 1, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {teamTabs.map((tab, index) => (
                        <Box
                            key={tab.key}
                            onClick={() => setSelectedTab(index)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                                fontSize: `calc(0.8rem + ${fontBump}rem)`,
                                backgroundColor: selectedTab === index ? tab.color : 'transparent',
                                color: selectedTab === index ? '#fff' : tab.color,
                                border: `1px solid ${tab.color}`,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: selectedTab === index ? tab.color : `${tab.color}15`,
                                },
                            }}
                        >
                            <Box sx={{
                                width: 8, height: 8,
                                borderRadius: '50%',
                                backgroundColor: selectedTab === index ? '#fff' : tab.color,
                            }} />
                            {tab.label}
                            <Chip
                                label={
                                    tab.key === 'selected'
                                        ? selectedCharacters.length
                                        : tab.key === 'all'
                                            ? Object.values(filteredCharacters).flat().length
                                            : (filteredCharacters[tab.key as keyof typeof filteredCharacters]?.length || 0)
                                }
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: `calc(0.6rem + ${fontBump}rem)`,
                                    backgroundColor: selectedTab === index ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                                    color: selectedTab === index ? '#fff' : 'inherit',
                                    '& .MuiChip-label': { px: 0.5 },
                                }}
                            />
                        </Box>
                    ))}
                    {availableSeries.length > 0 && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => setSeriesMenuAnchor(e.currentTarget)}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                fontSize: `calc(0.75rem + ${fontBump}rem)`, textTransform: 'none', ml: 0.5,
                                borderColor: seriesFilter ? (SERIES_COLORS[seriesFilter]?.bg ?? '#bbb') : '#bbb',
                                color: seriesFilter ? (SERIES_COLORS[seriesFilter]?.bg ?? '#666') : '#666',
                            }}
                        >
                            {seriesFilter ? seriesFilter : t('all')}
                        </Button>
                    )}
                    <Menu
                        anchorEl={seriesMenuAnchor}
                        open={Boolean(seriesMenuAnchor)}
                        onClose={() => setSeriesMenuAnchor(null)}
                        slotProps={{ paper: { style: { maxHeight: 260, width: 180 } } }}
                    >
                        <MenuItem onClick={() => { setSeriesFilter(''); setSeriesMenuAnchor(null); }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: 1, mr: 1, bgcolor: '#bbbbbb' }} />
                            {t('all')}
                        </MenuItem>
                        {availableSeries.map((seriesName) => {
                            const sc = SERIES_COLORS[seriesName] || { bg: '#9e9e9e', fg: '#ffffff' };
                            return (
                                <MenuItem
                                    key={seriesName}
                                    onClick={() => { setSeriesFilter(seriesFilter === seriesName ? '' : seriesName); setSeriesMenuAnchor(null); }}
                                >
                                    <Box sx={{ width: 10, height: 10, borderRadius: 1, mr: 1, bgcolor: sc.bg, border: `1px solid ${sc.fg}` }} />
                                    {seriesName}
                                    {seriesFilter === seriesName && <CheckIcon sx={{ ml: 'auto', fontSize: 16 }} />}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </Box>
            </Box>

            {/* 角色清單 */}
            <Box ref={listRef} sx={{ flex: 1, overflow: 'auto', p: 0, minHeight: 0 }}>
                {currentCharacters.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                        color: 'text.secondary',
                    }}>
                        <Typography variant="body2">
                            {searchTerm ? t('noSearchResults') : t('noCharactersInTeam')}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {currentCharacters.slice(0, renderCount).map((character) => {
                            const characterTeamColor =
                                currentTeam.key === 'all' || currentTeam.key === 'selected'
                                    ? teamTabs.find(tb => tb.key === character.team)?.color || THEME_COLORS.text.primary
                                    : currentTeam.color;
                            const isSelected = selectedCharacters.some(c => c.id === character.id);

                            return (
                                <CharacterItem
                                    key={character.id}
                                    character={character}
                                    teamColor={characterTeamColor}
                                    showTeamChip={currentTeam.key === 'all' || currentTeam.key === 'selected'}
                                    isSelected={isSelected}
                                    teamTabs={teamTabs}
                                    onAddCharacter={handleAddCharacter}
                                    onRemoveCharacter={handleRemoveCharacter}
                                    hideSelectedChip={hideSelectedChip}
                                    fontBump={fontBump}
                                />
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
});

export default CharacterLibraryContent;
