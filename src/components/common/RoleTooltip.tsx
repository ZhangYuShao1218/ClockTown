import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { highlightAbility } from "../../lib/highlightAbility";

interface RoleTooltipProps {
  hoveredRole: { role: any, x: number, y: number } | null;
}

export const RoleTooltip = ({ hoveredRole }: RoleTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (hoveredRole && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 16;
      let newX = hoveredRole.x;
      let newY = hoveredRole.y + 10;

      // Clamp X
      const halfWidth = rect.width / 2;
      if (newX - halfWidth < padding) {
        newX = halfWidth + padding;
      } else if (newX + halfWidth > window.innerWidth - padding) {
        newX = window.innerWidth - halfWidth - padding;
      }

      // Clamp Y
      if (newY + rect.height > window.innerHeight - padding) {
        // Place above the element (approx 80px element height + 20px gap)
        newY = hoveredRole.y - rect.height - 80;
        // If it goes off top, just stick it to bottom of window
        if (newY < padding) {
          newY = window.innerHeight - rect.height - padding;
        }
      }

      setPos({ x: newX, y: newY });
    }
  }, [hoveredRole]);

  if (!hoveredRole || typeof window === 'undefined' || !document.body) return null;

  return createPortal(
    <div 
      ref={tooltipRef}
      className="fixed z-[99999] w-max max-w-[19rem] bg-slate-900/95 p-4 text-base border-2 border-slate-500 rounded-xl shadow-2xl pointer-events-none text-left"
      style={{ 
        left: pos.x || hoveredRole.x, 
        top: pos.y || hoveredRole.y + 10, 
        transform: 'translateX(-50%)',
        visibility: pos.x === 0 ? 'hidden' : 'visible' // Hide until measured
      }}
    >
      <div
        className="text-white/90 font-bold leading-relaxed text-justify"
        style={{ wordBreak: 'normal', wordWrap: 'break-word' }}
      >
        {highlightAbility(hoveredRole.role.ability)}
      </div>
    </div>,
    document.body
  );
};
