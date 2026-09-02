// 特殊規則模板庫
// 用於新增自定義規則時提供預設模板
import type { I18nText } from '../../types';

export interface SpecialRuleTemplate {
    id: string;
    title: I18nText;
    content: I18nText;
    description?: I18nText;
}

export const specialRuleTemplates: SpecialRuleTemplate[] = [
    {
        id: 'seventh_chair',
        title: {
            'cn': '第七把交椅',
            'en': 'The Seventh Chair',
        },
        content: {
            'cn': '在遊戲開始時，第七個座位是空的，但正常發角色。每局遊戲限一次，說書人可以代表第七個座位發言，並可以參與提名。說書人決定在扮演第七個座位的角色時，該如何行動。',
            'en': 'At game start, the 7th seat is empty but gets a role. Once per game, the Storyteller may speak and nominate for this seat, deciding how to act.',
        },
        description: {
            'cn': '經典特殊規則，適合增加遊戲趣味性',
            'en': 'Classic special rule for added fun',
        },
    },
    {
        id: 'god_in_play',
        title: {
            'cn': '上帝出席',
            'en': 'God in Play',
        },
        content: {
            'cn': '上帝宣佈將會與一名玩家同陣營，如果處決說書人，那麼該玩家的陣營落敗。',
            'en': 'God announces they will be on the same team as a player. If the Storyteller is executed, that player\'s team loses.',
        },
        description: {
            'cn': '適用於娛樂劇本。',
            'en': 'Just for fun scripts.',
        },
    },
    {
        id: 'secret_objective',
        title: {
            'cn': '碟中諜',
            'en': 'Mission Impossible',
        },
        content: {
            'cn': '遊戲開始前, 有兩名玩家會收到他們的秘密任務。完成任務的玩家可以獲得額外的投票權或特殊能力。',
            'en': 'Each player gets a secret mission at game start. Completing it grants extra votes or abilities.',
        },
        description: {
            'cn': '增加遊戲的策略深度',
            'en': 'Adds strategic depth',
        },
    },
];

// 獲取特殊規則模板
export function getSpecialRuleTemplate(id: string): SpecialRuleTemplate | undefined {
    return specialRuleTemplates.find(template => template.id === id);
}

// 獲取所有特殊規則模板
export function getAllSpecialRuleTemplates(): SpecialRuleTemplate[] {
    return specialRuleTemplates;
}
