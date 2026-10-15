import { createPortal } from "react-dom";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: ReactNode;
  confirmText?: string;
  /** 提供時顯示取消按鈕（按下只關閉、不執行 onConfirm），用於需要二次確認的操作 */
  cancelText?: string;
  /** 提供時於頂端顯示紅色標題，視窗也會加寬以容納較多內容 */
  title?: string;
}

export const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText = "確定",
  cancelText,
  title,
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
        className={`w-full ${title ? "max-w-md" : "max-w-sm"} rounded-lg border border-red-900/50 bg-gradient-to-b from-slate-900 to-black p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-700/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-5 relative z-10">
          {title && (
            <h2 className="text-red-500 text-xl font-bold tracking-widest text-center">{title}</h2>
          )}
          <div className="w-full text-slate-200 text-lg text-center leading-relaxed tracking-wide font-medium whitespace-pre-line">
            {message}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-10 py-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-600 hover:to-slate-700 text-red-500 hover:text-red-400 border border-red-900/50 rounded transition-all font-bold tracking-widest shadow-lg hover:shadow-red-900/20"
            >
              {confirmText}
            </button>
            {cancelText && (
              <button
                onClick={onClose}
                className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-600/60 rounded transition-colors duration-200 font-bold tracking-widest shadow-lg"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
