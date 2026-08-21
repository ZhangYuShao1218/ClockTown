import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  noOverlay?: boolean;
  contentClass?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg", noOverlay = false, contentClass = "bg-black/95" }: ModalProps) => {
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

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${noOverlay ? "" : "bg-black/80 backdrop-blur-sm"}`}
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidth} rounded-md border-2 border-white/30 ${contentClass} backdrop-blur-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white/90 tracking-widest">{title}</h2>
        </div>
        <div className="text-sm text-white/80 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
