import { Modal } from "./Modal";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const AlertDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message, 
  confirmText = "確定", 
  cancelText = "取消",
  showCancel = false 
}: AlertDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="提示" maxWidth="max-w-sm" noOverlay={true} contentClass="bg-slate-900/95 border-2 border-slate-700">
      <div className="p-4 flex flex-col gap-6">
        <div className="text-white text-base text-center leading-relaxed">
          {message}
        </div>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors font-bold"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-bold shadow-md shadow-blue-900/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
