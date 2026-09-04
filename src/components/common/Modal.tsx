import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  noOverlay?: boolean;
  contentClass?: string;
  /** 手機（<640）改為滿版無圓角，適合大型內容（夜晚順序、角色資訊等） */
  fullBleedOnMobile?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg", noOverlay = false, contentClass = "bg-slate-900/95", fullBleedOnMobile = false }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${fullBleedOnMobile ? "p-0 sm:p-4" : "p-3 sm:p-4"} ${noOverlay ? "" : "bg-black/80 backdrop-blur-sm"}`}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} mx-auto ${fullBleedOnMobile ? "h-full rounded-none sm:h-auto sm:rounded-xl max-h-[100svh] sm:max-h-[92svh]" : "rounded-xl max-h-[92svh]"} overflow-y-auto custom-scrollbar border-2 border-slate-500 ${contentClass} backdrop-blur-2xl p-5 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white/90 tracking-widest">{title}</h2>
        </div>
        <div className="text-sm text-white/80 space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
