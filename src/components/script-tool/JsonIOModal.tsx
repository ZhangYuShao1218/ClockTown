import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Role } from '../../data/types';
import type { JinxRule } from './jinxData';

interface JsonIOModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  scriptName: string;
  scriptAuthor: string;
  scriptDescription: string;
  selectedRoles: Role[];
  customJinxes: JinxRule[];
  onImportSuccess: (data: {
    name: string;
    author: string;
    description: string;
    roleIds: string[];
    customRoles?: Role[];
  }) => void;
}

export const JsonIOModal: React.FC<JsonIOModalProps> = ({
  isOpen,
  onClose,
  mode,
  scriptName,
  scriptAuthor,
  scriptDescription,
  selectedRoles,
  customJinxes,
  onImportSuccess
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate standard official BOTC JSON format
  const exportJsonObject = [
    {
      id: '_meta',
      name: scriptName || '自訂劇本 Custom Script',
      author: scriptAuthor || 'Anonymous',
      description: scriptDescription || ''
    },
    ...selectedRoles.map(r => {
      // If it's a standard role, string ID is official standard format.
      // If custom role, full object format.
      if (r.id.startsWith('custom_')) {
        return {
          id: r.id,
          name: r.name,
          team: r.type,
          ability: r.ability,
          flavor: r.flavor,
          image: r.icon,
          firstNight: r.firstNight,
          otherNight: r.otherNight
        };
      }
      return r.id;
    }),
    ...customJinxes.map(j => ({
      id: '_jinx',
      role1: j.role1,
      role2: j.role2,
      reason: j.reason
    }))
  ];

  const exportJsonString = JSON.stringify(exportJsonObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(scriptName || 'botc-script').replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportJsonText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('無效的劇本 JSON 格式：根層級必須為陣列 (Array)。');
      }

      let parsedName = '';
      let parsedAuthor = '';
      let parsedDesc = '';
      const roleIds: string[] = [];
      const customRoles: Role[] = [];

      parsed.forEach((item: any) => {
        if (typeof item === 'string') {
          roleIds.push(item);
        } else if (item && typeof item === 'object') {
          if (item.id === '_meta') {
            parsedName = item.name || '';
            parsedAuthor = item.author || '';
            parsedDesc = item.description || '';
          } else if (item.id && item.id !== '_jinx') {
            roleIds.push(item.id);
            if (item.team || item.ability) {
              const roleType = item.team || 'townsfolk';
              const alignment = (roleType === 'demon' || roleType === 'minion') ? 'evil' : 'good';
              customRoles.push({
                id: item.id,
                name: item.name || item.id,
                alignment,
                type: roleType,
                ability: item.ability || '',
                flavor: item.flavor,
                icon: item.image,
                firstNight: item.firstNight,
                otherNight: item.otherNight
              });
            }
          }
        }
      });

      if (roleIds.length === 0) {
        throw new Error('未在 JSON 中找到任何角色識別碼。');
      }

      onImportSuccess({
        name: parsedName || scriptName,
        author: parsedAuthor || scriptAuthor,
        description: parsedDesc || scriptDescription,
        roleIds,
        customRoles
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'JSON 解析失敗，請確認格式是否正確。');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'import' ? '匯入官方劇本 JSON (Import JSON)' : '匯出標準劇本 JSON (Export JSON)'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-left">
        {mode === 'import' ? (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <p className="text-xs text-slate-300">
              支援貼上或上傳由官方 <a href="https://script.bloodontheclocktower.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">BOTC Script Tool</a> 或其他開源工具生成的標準 JSON 檔案。
            </p>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-600 rounded-lg text-xs font-bold text-slate-200 transition-colors shadow flex items-center gap-2">
                <span>📁 上傳 .json 檔案</span>
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-slate-400">或直接在下方貼上 JSON 字串：</span>
            </div>

            {error && (
              <div className="p-3 bg-red-900/40 border border-red-500 rounded-lg text-xs text-red-300 font-bold">
                {error}
              </div>
            )}

            <textarea
              rows={10}
              required
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`[\n  { "id": "_meta", "name": "我的自訂劇本" },\n  "washerwoman",\n  "librarian",\n  "imp"\n]`}
              className="w-full font-mono text-xs p-3 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500 custom-scrollbar"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg text-xs transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!importJsonText.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
              >
                解析並匯入
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              此格式完全符合官方 Blood on the Clocktower 規範，可直接下載並匯入至官方劇本工具或任何支援標準格式的血染鐘樓系統。
            </p>

            <div className="relative">
              <textarea
                rows={12}
                readOnly
                value={exportJsonString}
                className="w-full font-mono text-xs p-3 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none custom-scrollbar select-all"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                包含 {selectedRoles.length} 位角色、{customJinxes.length} 條自訂相剋
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2 font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  <span>{copied ? '✓ 已複製到剪貼簿' : '複製 JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <span>📥 下載 .json 檔案</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
