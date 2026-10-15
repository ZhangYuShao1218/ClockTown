import { AlertDialog } from "../common/AlertDialog";
import { DIST_LABELS } from "../../lib/boardDistribution";
import type { DistributionComparison } from "../../lib/boardDistribution";

interface DistributeConfirmDialogProps {
  comparison: DistributionComparison | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** 分配角色前的確認視窗：列出版面與資訊配置數量，不相符時於底部醒目提醒（不阻止分配） */
export const DistributeConfirmDialog = ({ comparison, onClose, onConfirm }: DistributeConfirmDialogProps) => {
  const cols = comparison ? DIST_LABELS.map((label, i) => ({ label, i })).filter(c => c.i < 4 || comparison.showTraveler) : [];

  return (
    <AlertDialog
      isOpen={!!comparison}
      onClose={onClose}
      onConfirm={onConfirm}
      title="確認分配角色"
      confirmText={comparison?.matches ? "分配" : "仍要分配"}
      cancelText="取消"
      message={comparison && (
        <div className="flex flex-col gap-4 text-base">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="text-slate-400 text-sm">
                <th className="py-1" />
                {cols.map(c => <th key={c.label} className="py-1 font-medium">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {([['當前版面', comparison.board], ['設置數量', comparison.expected]] as const).map(([name, row]) => (
                <tr key={name} className="border-t border-slate-700/60">
                  <td className="py-2 pr-2 text-left text-slate-300 whitespace-nowrap">{name}</td>
                  {cols.map(c => (
                    <td
                      key={c.label}
                      className={`py-2 font-bold ${comparison.board[c.i] !== comparison.expected[c.i] ? 'text-amber-300' : 'text-slate-100'}`}
                    >
                      {row[c.i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {comparison.emptySeats > 0 && (
            <p className="text-slate-300 text-sm">另有 {comparison.emptySeats} 個座位尚未放置角色。</p>
          )}
          {!comparison.matches && (
            <p className="text-red-400 font-black text-lg tracking-wider border border-red-700/70 bg-red-950/50 rounded px-4 py-2">
              ⚠ 當前版面數量與設置數量不相同！
            </p>
          )}
        </div>
      )}
    />
  );
};
