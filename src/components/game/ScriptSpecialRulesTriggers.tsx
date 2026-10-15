import type { Script } from "../../data/types";

interface SpecialRulesTriggerProps {
  script: Script | undefined;
  onOpen: () => void;
}

/** 窄屏：劇本特殊規則徽章（右上角，陣營資訊卡下方；桌機改用左下角常駐卡） */
export const SpecialRulesBadge = ({ script, onOpen }: SpecialRulesTriggerProps) => {
  if (!script?.specialRules?.length) return null;
  return (
    <button
      onClick={onOpen}
      className="absolute z-20 top-32 right-2.5 lg:hidden w-12 h-12 flex items-center justify-center pointer-events-auto animate-pulse"
      title="劇本特殊規則"
    >
      <img src="/assets/ui/SpecialDramaRule.png" className="w-12 h-12 object-contain drop-shadow-md" alt="特殊規則" />
    </button>
  );
};

/** 桌機：左下角說書人資訊上方的劇本特殊規則卡 */
export const SpecialRulesCard = ({ script, onOpen }: SpecialRulesTriggerProps) => {
  const rules = script?.specialRules;
  if (!rules?.length) return null;
  return (
    <button
      onClick={onOpen}
      className="w-full bg-amber-950/70 border-2 border-amber-500/50 rounded-xl py-3 pr-3 pl-1 shadow-lg pointer-events-auto backdrop-blur-md flex items-center space-x-1 shrink-0 text-left hover:bg-amber-950/90 hover:border-amber-400/70 transition-colors group"
    >
      <img src="/assets/ui/SpecialDramaRule.png" className="w-16 h-16 -my-2 object-contain shrink-0 drop-shadow-md group-hover:scale-105 transition-transform" alt="特殊規則" />
      <div className="flex flex-col items-start overflow-hidden w-full min-w-0">
        <span className="text-base text-amber-300 font-bold tracking-widest uppercase">特殊規則</span>
        <span className="text-base font-bold text-amber-100 truncate w-full">{rules[0].title}{rules.length > 1 ? ` 等${rules.length}項` : ''}</span>
      </div>
    </button>
  );
};
