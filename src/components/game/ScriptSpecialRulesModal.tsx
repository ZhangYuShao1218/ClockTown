import { Modal } from "../common/Modal";
import type { Script } from "../../data/types";
import { highlightAbility } from "../../lib/highlightAbility";

interface ScriptSpecialRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const ScriptSpecialRulesModal = ({ isOpen, onClose, script }: ScriptSpecialRulesModalProps) => {
  const rules = script?.specialRules;
  if (!rules || rules.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-[640px]">
      <div className="space-y-10">
        {rules.map((rule, i) => (
          <div key={i}>
            <h3 className="text-amber-400 font-bold text-[26px] flex items-center gap-2">
              <img src="/assets/ui/SpecialDramaRule.png" className="w-8 h-8 object-contain shrink-0" alt="" />
              {rule.title}
            </h3>
            <div className="mt-3 mb-5 h-px bg-amber-500/30" />
            <p className="text-white/85 leading-loose text-[20px] whitespace-pre-line">{highlightAbility(rule.description)}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};
