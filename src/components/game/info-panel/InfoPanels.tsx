import { useState } from "react";
import type { ReactNode } from "react";
import type { Role, Script } from "../../../data/types";
import { RoleIcon } from "../../common/RoleIcon";
import { scriptLogoSrc } from "../../../lib/scriptAssets";

export interface HoveredRole {
  role: Role;
  x: number;
  y: number;
}

export type InfoTab = "bluffs" | "fabled" | "room";

/* ───────────── 陣營人數與生存資訊 ───────────── */

interface CampStatsCardProps {
  distribution: number[];
  totalPlayers: number;
  alivePlayers: number;
  deathVotes: number;
}

export const CampStatsCard = ({ distribution, totalPlayers, alivePlayers, deathVotes }: CampStatsCardProps) => {
  const [t, o, m, d, v = 0] = distribution || [0, 0, 0, 0, 0];
  const camps: { label: string; color: string; count: number }[] = [
    { label: "民", color: "text-blue-300", count: t },
    { label: "外", color: "text-blue-300", count: o },
    { label: "爪", color: "text-red-400", count: m },
    { label: "惡", color: "text-red-400", count: d },
  ];
  if (v > 0) camps.push({ label: "旅", color: "text-purple-400", count: v });

  return (
    <div className="absolute z-20 top-2.5 right-2.5 w-[160px] lg:static lg:w-full bg-stone-800/80 border-2 border-white/40 rounded-xl py-2 px-2 lg:py-2.5 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center">
      <div className="flex justify-between items-center text-center divide-x divide-white/20 w-full mb-2 lg:mb-3">
        {camps.map(c => (
          <div key={c.label} className="flex-1">
            <div className={`text-sm lg:text-lg font-bold ${c.color}`}>{c.label}</div>
            <div className="text-sm lg:text-lg font-bold text-white">{c.count}</div>
          </div>
        ))}
      </div>

      <div className="w-[80%] h-px bg-white/20 mb-2 lg:mb-3" />

      <div className="flex justify-between items-center w-full px-0 lg:px-2 text-center">
        <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="總玩家數">
          <span className="text-sm lg:text-lg font-bold text-amber-300">總數</span>
          <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{totalPlayers}</span>
        </div>
        <div className="w-px h-7 lg:h-10 bg-white/20 mx-1 lg:mx-2"></div>
        <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="存活玩家數">
          <span className="text-sm lg:text-lg font-bold text-amber-300">存活</span>
          <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{alivePlayers}</span>
        </div>
        <div className="w-px h-7 lg:h-10 bg-white/20 mx-1 lg:mx-2"></div>
        <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="擁有死亡票數">
          <img src="/assets/ui/DeathVote.png" className="w-6 h-6 lg:w-[34px] lg:h-[34px] object-contain drop-shadow-md" alt="死亡票" />
          <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{deathVotes}</span>
        </div>
      </div>
    </div>
  );
};

/* ───────────── 圓形角色格（惡魔偽裝 / 傳奇共用） ───────────── */

type SlotVariant = "bluff" | "fabled";

const SLOT_STYLE: Record<SlotVariant, { filled: string; empty: string; label: string; placeholder: string }> = {
  bluff: {
    filled: "border-red-900 bg-black hover:border-red-500",
    empty: "border-red-500/40 border-dashed bg-black/60 hover:border-red-400",
    label: "text-red-400/90",
    placeholder: "text-red-500/60 text-lg group-hover:text-red-400",
  },
  fabled: {
    filled: "border-yellow-500/50 bg-black/80 hover:border-yellow-400",
    empty: "border-yellow-500/40 border-dashed bg-black/50 hover:border-yellow-400",
    label: "text-yellow-400/90",
    placeholder: "text-yellow-500/60 text-3xl group-hover:text-yellow-400",
  },
};

interface RoleSlotProps {
  variant: SlotVariant;
  role: Role | null | undefined;
  onHoverRole: (info: HoveredRole | null) => void;
  /** 空格內容（預設：偽裝「空」、傳奇「+」） */
  emptyContent?: ReactNode;
  onClick?: () => void;
  /** 提供時，hover 顯示 ✕ 並可移除 */
  onRemove?: () => void;
  className?: string;
}

export const RoleSlot = ({ variant, role, onHoverRole, emptyContent, onClick, onRemove, className = "" }: RoleSlotProps) => {
  const s = SLOT_STYLE[variant];
  const defaultEmpty = <span className={`font-bold ${s.placeholder}`}>{variant === "bluff" ? "空" : "+"}</span>;

  return (
    <div
      className={`flex flex-col items-center min-w-0 group relative hover:z-[9999] ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!role) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onHoverRole({ role, x: rect.left + rect.width / 2, y: rect.bottom });
      }}
      onMouseLeave={() => onHoverRole(null)}
    >
      <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${role ? s.filled : s.empty}`}>
        {role ? (
          <>
            <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
            {onRemove && (
              <div
                className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
              >✕</div>
            )}
          </>
        ) : (emptyContent ?? defaultEmpty)}
      </div>
      {role && <span className={`text-base font-bold ${s.label} uppercase tracking-widest mt-1 truncate w-full text-center`}>{role.name}</span>}
    </div>
  );
};

/* ───────────── 傳奇角色卡（兩頁共用，高度一致） ───────────── */

interface FabledCardProps {
  /** 3 格傳奇；元素為 null/undefined 代表空格 */
  slots: (Role | null | undefined)[];
  onHoverRole: (info: HoveredRole | null) => void;
  /** 編輯模式（說書人）：顯示空格「+」、可點擊與移除 */
  editable?: boolean;
  onOpenPicker?: (index?: number) => void;
  onRemove?: (index: number) => void;
  activeTab: InfoTab;
  /** 唯讀且無傳奇時，桌機隱藏整張卡（窄屏分頁仍顯示提示） */
  hideOnDesktopWhenEmpty?: boolean;
}

export const FabledCard = ({ slots, onHoverRole, editable = false, onOpenPicker, onRemove, activeTab, hideOnDesktopWhenEmpty = false }: FabledCardProps) => {
  const filled = slots.filter((r): r is Role => !!r);
  const desktopDisplay = hideOnDesktopWhenEmpty && filled.length === 0 ? "lg:hidden" : "lg:flex";
  // 唯讀時只排已有的傳奇；單一傳奇置中，格寬與三格網格一致，確保卡片高度不變
  const single = !editable && filled.length === 1;

  return (
    <div className={`${activeTab === "fabled" ? "flex" : "hidden"} ${desktopDisplay} flex-col bg-stone-800/80 border-2 border-yellow-400 rounded-b-xl lg:rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md`}>
      <h3
        className={`hidden lg:block text-lg font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest ${editable ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={editable ? () => onOpenPicker?.() : undefined}
      >傳奇角色</h3>
      {!editable && filled.length === 0 && <div className="text-center text-white/40 text-sm py-3">尚無傳奇角色</div>}
      <div className={single ? "flex justify-center w-full" : "grid grid-cols-3 gap-2 w-full"}>
        {editable
          ? [0, 1, 2].map(i => (
              <RoleSlot
                key={i}
                variant="fabled"
                role={slots[i]}
                onHoverRole={onHoverRole}
                onClick={() => onOpenPicker?.(i)}
                onRemove={() => onRemove?.(i)}
              />
            ))
          : filled.map(role => (
              <RoleSlot
                key={role.id}
                variant="fabled"
                role={role}
                onHoverRole={onHoverRole}
                className={single ? "w-[calc((100%-1rem)/3)]" : ""}
              />
            ))}
      </div>
    </div>
  );
};

/* ───────────── 房間資訊卡 ───────────── */

interface RoomInfoCardProps {
  roomId: string;
  script: Script | undefined;
  onOpenScriptModal: () => void;
  onLeaveRoom: () => void;
  activeTab: InfoTab;
}

export const RoomInfoCard = ({ roomId, script, onOpenScriptModal, onLeaveRoom, activeTab }: RoomInfoCardProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const nameParts = script?.name ? script.name.split(" ") : [];

  return (
    <div className={`${activeTab === "room" ? "flex" : "hidden"} lg:flex flex-col items-center bg-stone-800/80 border-2 border-white/40 rounded-b-xl lg:rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md space-y-3`}>
      <div className="flex justify-start w-full items-center">
        <span className="text-lg text-white/50 tracking-widest uppercase mr-2">Room :</span>
        <span className="font-mono text-white text-lg font-bold">{roomId}</span>
        <button
          onClick={handleCopy}
          className={`ml-auto text-sm bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors ${copied ? "text-green-400" : "text-white/80"}`}
        >
          {copied ? "已複製" : "複製網址"}
        </button>
      </div>
      <button
        onClick={onOpenScriptModal}
        className="w-full py-2 bg-[rgba(68,64,60,0.8)] border border-white/30 text-[#ff6b6b] hover:text-[#ff8b8b] hover:bg-[rgba(68,64,60,0.9)] rounded-lg shadow-md font-bold font-serif transition-colors text-lg px-2 flex items-center justify-center space-x-2 overflow-hidden group"
      >
        {script?.id && (
          <img
            src={scriptLogoSrc(script)}
            alt="Script"
            className="w-24 h-auto max-h-20 object-contain shrink-0 drop-shadow-md py-1"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1">
          {nameParts.length > 0 ? (
            <>
              <span className="text-base md:text-lg leading-tight w-full text-center break-words">{nameParts[0]}</span>
              {nameParts.length > 1 && (
                <span className="text-sm md:text-base leading-tight w-full text-center break-words opacity-80">{nameParts.slice(1).join(" ")}</span>
              )}
            </>
          ) : (
            <span className="text-lg text-center leading-tight truncate w-full">未知劇本</span>
          )}
        </div>
      </button>
      <button onClick={onLeaveRoom} className="w-full text-lg px-4 py-2 bg-red-900/80 hover:bg-red-800/90 border border-red-500/50 text-red-200 rounded-md transition-colors font-bold">
        離開房間
      </button>
    </div>
  );
};

/* ───────────── 側欄外殼：桌機直欄 / 窄屏（陣營右上 + 分頁視窗右下） ───────────── */

interface InfoSidebarProps {
  stats: ReactNode;
  activeTab: InfoTab;
  onTabChange: (tab: InfoTab) => void;
  /** 依序：惡魔偽裝、傳奇、房間卡（內部自行依 activeTab 顯示） */
  children: ReactNode;
}

const TABS: [InfoTab, string][] = [["bluffs", "偽裝"], ["fabled", "傳奇"], ["room", "房間"]];

export const InfoSidebar = ({ stats, activeTab, onTabChange, children }: InfoSidebarProps) => (
  <div className="contents lg:absolute lg:z-20 lg:pointer-events-none lg:flex lg:flex-col lg:items-stretch lg:gap-4 lg:right-4 lg:top-4 lg:bottom-4 lg:w-64 2xl:w-72">
    {stats}
    {/* 惡魔偽裝 / 傳奇 / 房間：桌機各自獨立卡；窄屏合併為右下角分頁視窗 */}
    <div className="absolute z-20 bottom-7 right-0.5 w-[236px] flex flex-col lg:static lg:w-auto lg:contents">
      <div className="flex lg:hidden rounded-t-xl overflow-hidden border-2 border-b-0 border-white/30 text-sm font-bold pointer-events-auto shadow-lg">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => onTabChange(k)} className={`flex-1 py-1.5 transition-colors ${activeTab === k ? "bg-stone-700 text-white" : "bg-stone-900/85 text-white/45"}`}>{label}</button>
        ))}
      </div>
      {children}
    </div>
  </div>
);

/** 偽裝卡外框（內容為 3 個 RoleSlot） */
export const BluffsCard = ({ activeTab, children }: { activeTab: InfoTab; children: ReactNode }) => (
  <div className={`${activeTab === "bluffs" ? "flex" : "hidden"} lg:flex flex-col items-center space-y-2 pointer-events-auto bg-stone-800/80 border-2 border-rose-900/80 p-3 pb-2 rounded-b-xl lg:rounded-xl shadow-lg backdrop-blur-md`}>
    <h3 className="hidden lg:block text-lg font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>
    <div className="grid grid-cols-3 gap-2 w-full">{children}</div>
  </div>
);

/** 直欄模式下把房間卡推到底 */
export const InfoSpacer = () => <div className="hidden lg:block flex-1 min-h-[1rem]" />;
