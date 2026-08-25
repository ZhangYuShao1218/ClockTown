import { createPortal } from "react-dom";
import { useEffect } from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
}

export const AlertDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message, 
  confirmText = "確定", 
}: AlertDialogProps) => {
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-transparent"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-lg border border-red-900/50 bg-gradient-to-b from-slate-900 to-black p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-700/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="text-slate-200 text-lg text-center leading-relaxed tracking-wide font-medium">
            {message}
          </div>
          
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-10 py-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-600 hover:to-slate-700 text-red-500 hover:text-red-400 border border-red-900/50 rounded transition-all font-bold tracking-widest shadow-lg hover:shadow-red-900/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
