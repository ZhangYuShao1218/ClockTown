import React, { useState, useEffect } from "react";
import { updateRoomScript, updateSeatCount, setCustomScript, updateDistribution, applySetupToRoom, updateRoomSettings } from "../../services/roomService";
import { AllScripts } from "../../data/scripts";
import type { Script } from "../../data/scripts";



interface GrimoireSettingsProps {
  roomId: string;
  scriptId: string;
  seatCount: number;
  script: Script | undefined;
  bluffs: (string | null)[];
  distribution: number[];
  grimoireState: any;
  customScript: any;
  activeScriptId: string | null;
  activeSetupId: string | null;
  setActiveScriptId: (id: string | null) => void;
  isViewingList: boolean;
  setIsViewingList: (val: boolean) => void;
  settings: any;
}

export const GrimoireSettings = ({ 
  roomId, 
  scriptId, 
  seatCount, 
  script, 
  bluffs, 
  distribution,
  grimoireState,
  customScript,
  activeScriptId,
  activeSetupId,
  setActiveScriptId,
  isViewingList,
  setIsViewingList,
  settings
}: GrimoireSettingsProps) => {
  const [localScripts, setLocalScripts] = useState<any[]>([]);
  const [newScriptName, setNewScriptName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [t, o, m, d] = distribution || [0, 0, 0, 0];
  const safeSettings = settings || { evilKnowsEachOther: true, evilCanMsg: false, allCanMsg: false, adjacentCanMsg: false };

  useEffect(() => {
    const saved = localStorage.getItem('botc_local_scripts');
    if (saved) {
      try { setLocalScripts(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Only auto-save if the current script is active AND Firebase has fully synced it
    if (activeScriptId && activeScriptId === activeSetupId) {
      setLocalScripts(prev => {
        let isChanged = false;
        const updated = prev.map(s => {
          if (s.id === activeScriptId) {
            isChanged = true;
            return {
              ...s,
              data: { scriptId, seatCount, distribution, bluffs, grimoire: grimoireState, customScript, settings: safeSettings }
            };
          }
          return s;
        });
        if (isChanged) {
          localStorage.setItem('botc_local_scripts', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [scriptId, seatCount, distribution, bluffs, grimoireState, customScript, settings, activeScriptId, activeSetupId]);

  const handleAddScript = () => {
    if (!newScriptName.trim()) return;
    const newScript = {
      id: Date.now().toString(),
      name: newScriptName.trim(),
      data: { 
        scriptId: 'trouble_brewing', 
        seatCount: 12, 
        distribution: [7,2,2,1], 
        bluffs: [null,null,null], 
        grimoire: {}, 
        customScript: null,
        settings: { evilKnowsEachOther: true, evilCanMsg: false, allCanMsg: false, adjacentCanMsg: false }
      }
    };
    const updated = [...localScripts, newScript];
    setLocalScripts(updated);
    localStorage.setItem('botc_local_scripts', JSON.stringify(updated));
    setNewScriptName("");
  };

  const handleDeleteScript = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = localScripts.filter(s => s.id !== id);
    setLocalScripts(updated);
    localStorage.setItem('botc_local_scripts', JSON.stringify(updated));
    if (activeScriptId === id) setActiveScriptId(null);
  };

  const handleSelectScript = async (s: any) => {
    setActiveScriptId(s.id);
    setIsViewingList(false);
    await applySetupToRoom(roomId, s.data, s.id);
  };

  const getDistribution = (count: number) => {
    if (count < 5) return [count, 0, 0, 0];
    const rules: Record<number, number[]> = {
      5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1], 9: [5, 2, 1, 1],
      10: [7, 0, 2, 1], 11: [7, 1, 2, 1], 12: [7, 2, 2, 1], 13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1]
    };
    if (count > 15) return [rules[15][0] + (count - 15), rules[15][1], rules[15][2], rules[15][3]];
    return rules[count];
  };

  const handleScriptTypeChange = async (newScriptId: string) => {
    await updateRoomScript(roomId, newScriptId);
  };

  const handleSeatCountChange = async (delta: number) => {
    const newCount = Math.max(5, Math.min(20, seatCount + delta));
    if (newCount !== seatCount) {
      await updateSeatCount(roomId, newCount);
      await updateDistribution(roomId, getDistribution(newCount));
    }
  };

  const handleDistChange = async (index: number, delta: number) => {
    const newDist = [t, o, m, d];
    newDist[index] = Math.max(0, newDist[index] + delta);
    const newCount = newDist.reduce((a, b) => a + b, 0);
    await updateDistribution(roomId, newDist);
    if (newCount !== seatCount) {
      await updateSeatCount(roomId, newCount);
    }
  };

  const handleSettingToggle = async (key: string) => {
    const newSettings = { ...safeSettings, [key]: !safeSettings[key] };
    await updateRoomSettings(roomId, newSettings);
  };

  const handleExportScript = () => {
    if (!script) return;
    const blob = new Blob([JSON.stringify(script, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.id || 'custom'}_characters.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.id && json.roles) {
          await setCustomScript(roomId, json);
          handleScriptTypeChange("custom");
        } else alert("無效的劇本檔案格式");
      } catch (err) { alert("JSON 解析失敗"); }
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };

  if (isViewingList || !activeScriptId) {
    return (
      <div className="flex-1 flex flex-col h-full bg-transparent rounded-b-xl rounded-tr-xl border-2 border-white/10 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/20 bg-white/5 shrink-0">
          <h2 className="text-base font-bold text-white/80 uppercase tracking-widest">選擇劇本</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex space-x-2">
            <input 
              value={newScriptName} 
              onChange={e => setNewScriptName(e.target.value)} 
              placeholder="自訂新劇本名稱..." 
              className="flex-1 bg-white/5 border border-white/30 rounded px-2 py-1 text-base text-white focus:outline-none focus:border-primary/50" 
            />
            <button onClick={handleAddScript} className="px-3 bg-blue-600/80 hover:bg-blue-500 rounded text-base text-white font-bold transition-colors">新增</button>
          </div>
          
          <div className="space-y-2">
            {localScripts.map(s => (
              <div 
                key={s.id} 
                onClick={() => handleSelectScript(s)} 
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg cursor-pointer flex justify-between items-center group transition-colors"
              >
                <span className="text-white/90 font-bold tracking-wide text-base">{s.name}</span>
                <button 
                  onClick={(e) => handleDeleteScript(s.id, e)} 
                  className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded text-base font-bold transition-all shadow-md"
                  title="刪除"
                >刪除</button>
              </div>
            ))}
            {localScripts.length === 0 && (
              <p className="text-base text-white/40 text-center py-6 border border-dashed border-white/10 rounded-lg">
                尚無自訂劇本，請先新增。
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderSettingsBlock = () => (
    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 space-y-3 mt-4 shadow-md">
      <h3 className="text-base font-bold text-slate-300 border-b border-slate-700 pb-2">遊戲設定</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'evilKnowsEachOther', label: '邪惡相認' },
          { key: 'evilCanMsg', label: '邪惡私訊' },
          { key: 'allCanMsg', label: '所有玩家私訊' },
          { key: 'adjacentCanMsg', label: '鄰近玩家私訊' }
        ].map(setting => (
          <div 
            key={setting.key} 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleSettingToggle(setting.key)}
          >
            <div className={`w-5 h-5 flex items-center justify-center rounded border transition-colors shadow-sm ${safeSettings[setting.key] ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-slate-800 border-slate-600 text-transparent group-hover:border-slate-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className={`text-base font-medium transition-colors ${safeSettings[setting.key] ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{setting.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">

        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-600 shadow-sm">
          <span className="text-base font-bold text-slate-300">劇本名稱</span>
          <input 
            value={localScripts.find(s => s.id === activeScriptId)?.name || ''} 
            onChange={e => {
              const name = e.target.value;
              setLocalScripts(prev => prev.map(s => s.id === activeScriptId ? { ...s, name } : s));
            }}
            className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-base font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 max-w-[200px]"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-600 shadow-sm relative">
            <span className="text-base font-bold text-slate-300 pr-4 shrink-0">劇本種類</span>
            <div className="relative w-full max-w-[180px]">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-slate-950 border border-slate-600 hover:border-slate-400 rounded px-3 py-1.5 text-base font-bold text-white w-full flex justify-between items-center transition-colors"
              >
                <span className="truncate">{AllScripts[scriptId]?.name || "未知劇本"}</span>
                <svg className="w-4 h-4 ml-2 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 py-1">
                  {Object.keys(AllScripts).map(key => (
                    <div 
                      key={key} 
                      onClick={() => { handleScriptTypeChange(key); setIsDropdownOpen(false); }}
                      className="px-4 py-2 text-base text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer font-medium truncate"
                    >
                      {AllScripts[key].name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-600 shadow-sm">
            <span className="text-base font-bold text-slate-300">總座位數量</span>
            <div className="flex items-center space-x-4">
              <button onClick={() => handleSeatCountChange(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-xl font-bold text-white shadow-md transition-colors">-</button>
              <span className="text-lg font-bold text-white w-6 text-center">{seatCount}</span>
              <button onClick={() => handleSeatCountChange(1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-xl font-bold text-white shadow-md transition-colors">+</button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pb-4 border-b border-slate-700">
          <label className="flex-1 text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base py-2 rounded-lg cursor-pointer transition-colors shadow-md">
            匯入角色 JSON
            <input type="file" accept=".json" onChange={handleImportScript} className="hidden" />
          </label>
          <button onClick={handleExportScript} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base py-2 rounded-lg transition-colors shadow-md">
            匯出角色 JSON
          </button>
        </div>

        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 space-y-4 shadow-md">
          <h3 className="text-base font-bold text-slate-300 border-b border-slate-700 pb-2 flex justify-between">
            <span>陣營配置</span>
            <span className="text-sm text-slate-400 font-normal mt-0.5">總和將自動更新座位</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '村民', count: t, idx: 0, color: 'text-blue-300', bg: 'bg-blue-900/20', border: 'border-blue-900/50' },
              { label: '外來者', count: o, idx: 1, color: 'text-blue-300', bg: 'bg-blue-900/20', border: 'border-blue-900/50' },
              { label: '爪牙', count: m, idx: 2, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-900/50' },
              { label: '惡魔', count: d, idx: 3, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-900/50' }
            ].map(item => (
              <div key={item.idx} className={`flex flex-col items-center justify-center p-3 rounded-lg border ${item.bg} ${item.border}`}>
                <div className={`text-base font-bold ${item.color} mb-3 tracking-widest`}>{item.label}</div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => handleDistChange(item.idx, -1)} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-base font-bold text-white shadow-md transition-colors">-</button>
                  <span className="text-base font-bold text-white w-4 text-center">{item.count}</span>
                  <button onClick={() => handleDistChange(item.idx, 1)} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-base font-bold text-white shadow-md transition-colors">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderSettingsBlock()}
      </div>
    </div>
  );
};
