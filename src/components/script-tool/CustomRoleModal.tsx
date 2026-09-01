import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Role, RoleType } from '../../data/types';

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  editingRole?: Role | null;
}

export const CustomRoleModal: React.FC<CustomRoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRole
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<RoleType>('townsfolk');
  const [ability, setAbility] = useState('');
  const [flavor, setFlavor] = useState('');
  const [firstNightReminder, setFirstNightReminder] = useState('');
  const [otherNightReminder, setOtherNightReminder] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name || '');
      setType(editingRole.type || 'townsfolk');
      setAbility(editingRole.ability || '');
      setFlavor(editingRole.flavor || '');
      setIconUrl(editingRole.icon || '');
    } else {
      setName('');
      setType('townsfolk');
      setAbility('');
      setFlavor('');
      setIconUrl('');
      setFirstNightReminder('');
      setOtherNightReminder('');
    }
  }, [editingRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ability.trim()) return;

    const id = editingRole?.id || `custom_${Date.now()}`;
    const alignment = (type === 'demon' || type === 'minion') ? 'evil' : 'good';
    const newRole: Role = {
      id,
      name: name.trim(),
      alignment,
      type,
      ability: ability.trim(),
      flavor: flavor.trim() || undefined,
      icon: iconUrl.trim() || undefined,
      firstNight: firstNightReminder ? 50 : undefined,
      otherNight: otherNightReminder ? 50 : undefined
    };

    onSave(newRole);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIconUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRole ? "編輯自訂角色" : "新增自訂角色 (Custom Role)"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">角色名稱 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：鍊金術士、瘋子..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Role Type */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">陣營類型 *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoleType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
            >
              <option value="townsfolk">鎮民 (Townsfolk)</option>
              <option value="outsider">外來者 (Outsider)</option>
              <option value="minion">爪牙 (Minion)</option>
              <option value="demon">惡魔 (Demon)</option>
              <option value="traveler">旅行者 (Traveler)</option>
              <option value="fabled">傳奇角色 (Fabled)</option>
            </select>
          </div>
        </div>

        {/* Ability Description */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1">技能描述 (Ability) *</label>
          <textarea
            rows={3}
            required
            value={ability}
            onChange={(e) => setAbility(e.target.value)}
            placeholder="請輸入角色的完整技能與觸發時機..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Role Flavor Text */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1">背景風味文字 (Flavor Text)</label>
          <input
            type="text"
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
            placeholder="例如：黑暗中的微光、迷霧裡的低語..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Night Reminders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">首夜行動提示 (First Night)</label>
            <input
              type="text"
              value={firstNightReminder}
              onChange={(e) => setFirstNightReminder(e.target.value)}
              placeholder="喚醒該玩家並展示..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">其他夜晚行動 (Other Nights)</label>
            <input
              type="text"
              value={otherNightReminder}
              onChange={(e) => setOtherNightReminder(e.target.value)}
              placeholder="喚醒該玩家，他指向一名玩家..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Icon URL or Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1">角色圖示 (Icon URL 或 本地圖片上傳)</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://... 或點右側按鈕上傳"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <label className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg text-xs font-bold text-slate-200 transition-colors whitespace-nowrap">
              選擇圖片
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          {iconUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-black/40 border border-white/10 rounded-lg w-max">
              <img src={iconUrl} alt="預覽" className="w-10 h-10 object-contain rounded-full bg-slate-800 p-1" />
              <span className="text-xs text-slate-400">圖示預覽</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg text-sm transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !ability.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm shadow-md transition-colors disabled:opacity-50"
          >
            儲存角色
          </button>
        </div>
      </form>
    </Modal>
  );
};
