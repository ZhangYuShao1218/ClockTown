import React from 'react';
import { Modal } from '../common/Modal';

export interface ScriptExportStyleConfig {
  // Theme & Background
  paperTheme: 'parchment' | 'blood' | 'moon' | 'violet' | 'white' | 'dark' | 'custom';
  customBgUrl: string;
  bgOpacity: number; // 10 to 100
  bgBlur: number; // 0 to 10

  // Page & Dimensions
  pageSize: 'a4' | 'a3' | 'letter' | 'auto';
  orientation: 'portrait' | 'landscape';
  pagePadding: number; // 10 to 60px
  cardGap: number; // 4 to 20px

  // Grid & Columns
  columnCount: 1 | 2 | 3 | 4 | 5;
  teamHeaderStyle: 'banner' | 'underline' | 'stamp' | 'hidden';
  townsfolkColor: string;
  outsiderColor: string;
  minionColor: string;
  demonColor: string;
  travelerColor: string;

  // Character Card Aesthetics
  cardBgOpacity: number; // 0 to 100
  cardBorderRadius: number; // 0 to 20px
  avatarSize: number; // 24 to 60px
  titleFontSize: number; // 10 to 20px
  abilityFontSize: number; // 8 to 16px
  abilityLineHeight: number; // 1.0 to 1.8
  showAbility: boolean;
  showEnglishName: boolean;
  showNightReminders: boolean;
  showTypeBadge: boolean;

  // Jinxes & Footer
  jinxColumns: 1 | 2 | 3;
  showJinxIcons: boolean;
  specialRulesText: string;
  footerWatermark: string;
}

export const defaultScriptStyleConfig: ScriptExportStyleConfig = {
  paperTheme: 'parchment',
  customBgUrl: '',
  bgOpacity: 100,
  bgBlur: 0,
  pageSize: 'a4',
  orientation: 'portrait',
  pagePadding: 32,
  cardGap: 10,
  columnCount: 2,
  teamHeaderStyle: 'banner',
  townsfolkColor: '#1976d2',
  outsiderColor: '#00acc1',
  minionColor: '#fb8c00',
  demonColor: '#e53935',
  travelerColor: '#8e24aa',
  cardBgOpacity: 85,
  cardBorderRadius: 8,
  avatarSize: 36,
  titleFontSize: 13,
  abilityFontSize: 11,
  abilityLineHeight: 1.3,
  showAbility: true,
  showEnglishName: true,
  showNightReminders: true,
  showTypeBadge: false,
  jinxColumns: 2,
  showJinxIcons: true,
  specialRulesText: '',
  footerWatermark: 'Blood on the Clocktower Custom Script'
};

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScriptExportStyleConfig;
  onChangeConfig: (newConfig: ScriptExportStyleConfig) => void;
  onResetDefault: () => void;
}

export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetDefault
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'theme' | 'layout' | 'card' | 'footer'>('theme');

  if (!isOpen) return null;

  const update = (partial: Partial<ScriptExportStyleConfig>) => {
    onChangeConfig({ ...config, ...partial });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎨 調整導出設定 (Export & Beautify Settings)"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col h-[560px] text-slate-200">
        
        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-white/15 bg-black/40 text-xs shrink-0 rounded-t-lg">
          {[
            { id: 'theme', label: '🖼️ 背景與主題' },
            { id: 'layout', label: '📐 版面與分欄' },
            { id: 'card', label: '🃏 角色卡片美術' },
            { id: 'footer', label: '⚖️ 相剋與頁尾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 py-2.5 font-bold transition-colors border-b-2 ${
                activeSubTab === tab.id
                  ? 'border-amber-400 text-amber-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Background & Theme */}
        {activeSubTab === 'theme' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm">
            <div>
              <label className="block font-bold text-stone-200 mb-2">背景主題預設 (Presets)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'parchment', name: '📜 經典羊皮紙', desc: '復古仿古羊皮紙' },
                  { id: 'blood', name: '🩸 暗流血色', desc: '哥德暗紅天鵝絨' },
                  { id: 'moon', name: '🌙 黯月夜空', desc: '星夜午夜深藍' },
                  { id: 'violet', name: '🌸 紫幻迷霧', desc: '教派神秘紫霧' },
                  { id: 'white', name: '📄 現代純白', desc: '高對比簡潔白底' },
                  { id: 'dark', name: '🌑 深邃黑夜', desc: '暗黑磨砂黑金' },
                  { id: 'custom', name: '🖼️ 自訂圖片', desc: '上傳或貼上網址' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => update({ paperTheme: t.id as any })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.paperTheme === t.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md scale-[1.02]'
                        : 'border-white/10 bg-black/40 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {config.paperTheme === 'custom' && (
              <div className="p-3 bg-black/50 border border-white/15 rounded-lg space-y-2">
                <label className="block font-bold text-xs text-stone-300">自訂背景圖片 URL：</label>
                <input
                  type="text"
                  value={config.customBgUrl}
                  onChange={(e) => update({ customBgUrl: e.target.value })}
                  placeholder="https://example.com/custom-bg.jpg"
                  className="w-full px-3 py-2 bg-black/80 border border-white/20 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Background Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>背景透明度 (Opacity)</span>
                  <span className="text-amber-400">{config.bgOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={config.bgOpacity}
                  onChange={(e) => update({ bgOpacity: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>背景模糊濾鏡 (Blur)</span>
                  <span className="text-amber-400">{config.bgBlur} px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={config.bgBlur}
                  onChange={(e) => update({ bgBlur: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            {/* Team Color Scheme */}
            <div className="pt-3 border-t border-white/10">
              <label className="block font-bold text-stone-200 mb-2">五大陣營代表色 (Team Colors)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="block mb-1 text-blue-300 font-bold">鎮民 (Town)</span>
                  <input
                    type="color"
                    value={config.townsfolkColor}
                    onChange={(e) => update({ townsfolkColor: e.target.value })}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
                  />
                </div>
                <div>
                  <span className="block mb-1 text-cyan-300 font-bold">外來者 (Outsider)</span>
                  <input
                    type="color"
                    value={config.outsiderColor}
                    onChange={(e) => update({ outsiderColor: e.target.value })}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
                  />
                </div>
                <div>
                  <span className="block mb-1 text-amber-300 font-bold">爪牙 (Minion)</span>
                  <input
                    type="color"
                    value={config.minionColor}
                    onChange={(e) => update({ minionColor: e.target.value })}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
                  />
                </div>
                <div>
                  <span className="block mb-1 text-red-300 font-bold">惡魔 (Demon)</span>
                  <input
                    type="color"
                    value={config.demonColor}
                    onChange={(e) => update({ demonColor: e.target.value })}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
                  />
                </div>
                <div>
                  <span className="block mb-1 text-purple-300 font-bold">傳奇 (Fabled)</span>
                  <input
                    type="color"
                    value={config.travelerColor}
                    onChange={(e) => update({ travelerColor: e.target.value })}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Layout & Grid */}
        {activeSubTab === 'layout' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm">
            {/* Columns */}
            <div>
              <label className="block font-bold text-stone-200 mb-2">畫布分欄數 (Columns)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(c => (
                  <button
                    key={c}
                    onClick={() => update({ columnCount: c as any })}
                    className={`flex-1 py-2 rounded-lg border font-bold text-center transition-all ${
                      config.columnCount === c
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md'
                        : 'border-white/10 bg-black/40 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {c} 欄
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Size & Orientation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-200 mb-1.5">紙張規格 (Paper Size)</label>
                <select
                  value={config.pageSize}
                  onChange={(e) => update({ pageSize: e.target.value as any })}
                  className="w-full px-3 py-2 bg-black/70 border border-white/20 rounded text-sm text-white focus:outline-none"
                >
                  <option value="a4">標準 A4 (210 × 297 mm)</option>
                  <option value="a3">大圖 A3 (297 × 420 mm)</option>
                  <option value="letter">美規 Letter (8.5 × 11 in)</option>
                  <option value="auto">自適應長圖 (Auto Scroll)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">紙張方向 (Orientation)</label>
                <div className="flex gap-2">
                  {[
                    { id: 'portrait', label: '縱向 (直式)' },
                    { id: 'landscape', label: '橫向 (橫式)' }
                  ].map(o => (
                    <button
                      key={o.id}
                      onClick={() => update({ orientation: o.id as any })}
                      className={`flex-1 py-2 rounded-lg border font-bold text-center text-xs transition-all ${
                        config.orientation === o.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow'
                          : 'border-white/10 bg-black/40 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Header Style */}
            <div>
              <label className="block font-bold text-stone-200 mb-2">陣營分組標題樣式 (Header Style)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'banner', label: '經典彩色色帶' },
                  { id: 'underline', label: '極簡文字下劃線' },
                  { id: 'stamp', label: '哥德印章徽章' },
                  { id: 'hidden', label: '隱藏陣營標題' }
                ].map(h => (
                  <button
                    key={h.id}
                    onClick={() => update({ teamHeaderStyle: h.id as any })}
                    className={`py-2 px-2 rounded-lg border font-bold text-center text-xs transition-all ${
                      config.teamHeaderStyle === h.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow'
                        : 'border-white/10 bg-black/40 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Padding & Card Gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>頁面邊距 (Page Padding)</span>
                  <span className="text-amber-400">{config.pagePadding} px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={config.pagePadding}
                  onChange={(e) => update({ pagePadding: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>卡片間距 (Card Gap)</span>
                  <span className="text-amber-400">{config.cardGap} px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={24}
                  value={config.cardGap}
                  onChange={(e) => update({ cardGap: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Character Card Styling */}
        {activeSubTab === 'card' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm">
            {/* Font Sizes & Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>代幣圖標大小 (Avatar Size)</span>
                  <span className="text-amber-400">{config.avatarSize} px</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={60}
                  value={config.avatarSize}
                  onChange={(e) => update({ avatarSize: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>卡片圓角 (Border Radius)</span>
                  <span className="text-amber-400">{config.cardBorderRadius} px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={config.cardBorderRadius}
                  onChange={(e) => update({ cardBorderRadius: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>角色名字字號 (Title Font)</span>
                  <span className="text-amber-400">{config.titleFontSize} px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={20}
                  value={config.titleFontSize}
                  onChange={(e) => update({ titleFontSize: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-300 mb-1">
                  <span>技能文字字號 (Ability Font)</span>
                  <span className="text-amber-400">{config.abilityFontSize} px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={16}
                  value={config.abilityFontSize}
                  onChange={(e) => update({ abilityFontSize: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            {/* Display Switches */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <label className="block font-bold text-stone-200 mb-2">角色卡片內容開關 (Display Elements)</label>
              
              <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5">
                <span className="font-bold text-xs">顯示技能描述文字 (Ability Text)</span>
                <input
                  type="checkbox"
                  checked={config.showAbility}
                  onChange={(e) => update({ showAbility: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5">
                <span className="font-bold text-xs">顯示官方英文識別名 (Official English ID)</span>
                <input
                  type="checkbox"
                  checked={config.showEnglishName}
                  onChange={(e) => update({ showEnglishName: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5">
                <span className="font-bold text-xs">顯示首夜/其他夜行動標記 (Night Reminder Badges)</span>
                <input
                  type="checkbox"
                  checked={config.showNightReminders}
                  onChange={(e) => update({ showNightReminders: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5">
                <span className="font-bold text-xs">顯示陣營類別標籤 (Type Tag)</span>
                <input
                  type="checkbox"
                  checked={config.showTypeBadge}
                  onChange={(e) => update({ showTypeBadge: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Jinxes & Footer */}
        {activeSubTab === 'footer' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm">
            {/* Jinx Layout */}
            <div>
              <label className="block font-bold text-stone-200 mb-2">相剋規則排列欄數 (Jinx Columns)</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(j => (
                  <button
                    key={j}
                    onClick={() => update({ jinxColumns: j as any })}
                    className={`flex-1 py-2 rounded-lg border font-bold text-center text-xs transition-all ${
                      config.jinxColumns === j
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow'
                        : 'border-white/10 bg-black/40 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {j} 欄排列
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5">
              <span className="font-bold text-xs">顯示雙角色頭像標記 (Paired Token Icons)</span>
              <input
                type="checkbox"
                checked={config.showJinxIcons}
                onChange={(e) => update({ showJinxIcons: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>

            {/* Special Rules */}
            <div>
              <label className="block font-bold text-stone-200 mb-1.5">特別規則備註 (Special Rules Note)</label>
              <textarea
                rows={3}
                value={config.specialRulesText}
                onChange={(e) => update({ specialRulesText: e.target.value })}
                placeholder="例如：本劇本包含特殊自訂規則、旅行者人數上限..."
                className="w-full px-3 py-2 bg-black/70 border border-white/20 rounded text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
            </div>

            {/* Watermark / Footer */}
            <div>
              <label className="block font-bold text-stone-200 mb-1.5">頁尾說書人浮水印 (Footer Watermark)</label>
              <input
                type="text"
                value={config.footerWatermark}
                onChange={(e) => update({ footerWatermark: e.target.value })}
                placeholder="例如：由 鐘樓小鎮 說書人小組 製作"
                className="w-full px-3 py-2 bg-black/70 border border-white/20 rounded text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 bg-black/60 border-t border-white/15 flex items-center justify-between shrink-0 rounded-b-lg">
          <button
            onClick={onResetDefault}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-stone-300 hover:text-white rounded text-xs font-bold transition-colors"
          >
            ↺ 重設為預設值
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs shadow transition-colors"
          >
            完成設定並套用
          </button>
        </div>

      </div>
    </Modal>
  );
};
