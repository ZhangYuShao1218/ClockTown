import { useEffect } from "react";
import { createPortal } from "react-dom";

export type GuideTab = "intro" | "tips";

interface LobbyGuideModalProps {
  open: GuideTab | null;
  onClose: () => void;
}

const Good = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-sky-300">{children}</span>
);
const Evil = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-rose-400">{children}</span>
);
const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-amber-300">{children}</span>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 text-lg font-bold tracking-wide text-amber-300">{children}</h3>
);

/** 區塊之間的短分隔線（不到底） */
const Divider = () => <div className="mx-auto my-6 h-px w-2/5 bg-white/15" />;

const Row = ({
  label,
  num,
  children,
}: {
  label: React.ReactNode;
  num?: number;
  children: React.ReactNode;
}) => (
  <li className="flex gap-2.5 py-1 leading-relaxed">
    {num != null ? (
      <span className="mt-[2px] shrink-0 font-bold text-amber-300">{num}.</span>
    ) : (
      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
    )}
    <span>
      <span className="font-semibold text-white/90">{label}</span>
      <span className="text-white/65"> — {children}</span>
    </span>
  </li>
);

const IntroContent = () => (
  <div className="text-[16px]">
    <p className="leading-relaxed text-white/75">
      《血染鐘樓》是一款多人<Key>社交推理</Key>遊戲，由一位<Key>說書人</Key>主持流程、掌握所有真相，其餘玩家分屬兩大陣營，靠對話與投票找出真相。
    </p>

    <Divider />

    <SectionTitle>兩大陣營</SectionTitle>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
        <div className="mb-1 font-bold text-sky-300">善良陣營</div>
        <p className="text-[15px] leading-relaxed text-white/70">分為 <Good>鎮民</Good> 與 <Good>外來者</Good>。</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">目標：<Key>找出並處決惡魔</Key></p>
      </div>
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
        <div className="mb-1 font-bold text-rose-400">邪惡陣營</div>
        <p className="text-[15px] leading-relaxed text-white/70">分為 <Evil>爪牙</Evil> 與 <Evil>惡魔</Evil>。</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">目標：<Key>活到只剩兩人</Key></p>
      </div>
    </div>

    <Divider />

    <SectionTitle>遊戲流程</SectionTitle>
    <ul>
      <Row num={1} label="夜晚">
        所有人閉眼，說書人依<Key>角色順序</Key>逐一喚醒角色、執行能力。
        資訊型角色獲得線索——但你可能<Evil>被下毒或被酒醉</Evil>而收到<Evil>假消息</Evil>。
      </Row>
      <Row num={2} label="白天（私聊）">
        眾人睜眼、得知昨夜死者。玩家分頭私下交談，交換資訊、拉近距離。
      </Row>
      <Row num={3} label="白天（公聊）">
        回到桌面公開討論，攤開各自的說法，尋找<Key>互相矛盾</Key>之處。
      </Row>
      <Row num={4} label="提名與處決">
        每位存活玩家每天可<Key>提名</Key>一人；票數<Key>過半</Key>且為當日最高者被處決。
        處決到<Evil>惡魔</Evil>，<Good>善良陣營</Good>立刻獲勝。
      </Row>
    </ul>

    <Divider />

    <SectionTitle>如何獲勝</SectionTitle>
    <ul>
      <Row label="善良陣營勝"><Evil>惡魔</Evil>死亡。</Row>
      <Row label="邪惡陣營勝">惡魔存活，且場上只剩 <Key>2</Key> 名存活玩家。</Row>
      <Row label="特殊條件">部分角色有專屬的勝利／落敗條件，例如聖徒、隱士。</Row>
    </ul>
  </div>
);

const TipsContent = () => (
  <div className="text-[16px]">
    <SectionTitle>給善良陣營</SectionTitle>
    <ul>
      <Row label="好人死於沉默">盡早、清楚地公開你的角色與資訊，讓大家能<Key>交叉驗證</Key>。</Row>
      <Row label="懷疑你的資訊">你可能<Evil>中毒</Evil>或被<Evil>酒鬼</Evil>影響，資訊未必為真；也要提防惡魔的偽裝。</Row>
      <Row label="串起資訊網">把所有人的說法排在一起，專找<Key>互相矛盾</Key>之處。</Row>
    </ul>

    <Divider />

    <SectionTitle>給邪惡陣營</SectionTitle>
    <ul>
      <Row label="善用惡魔的偽裝">惡魔開局會拿到數個「不在場角色」當偽裝，挑一個貼合你的座位與敘事去演。</Row>
      <Row label="融入好人">積極參與推理，提供「看似有用」的資訊建立信任。</Row>
      <Row label="保護惡魔">爪牙要適時<Key>吸引火力</Key>，必要時為惡魔擋刀。</Row>
    </ul>

    <Divider />

    <SectionTitle>血染鐘樓技巧</SectionTitle>
    <ul>
      <Row label="死亡並不可怕">死後可以發言、仍有一張<Key>遺言票</Key>，有時候死亡才能讓邪惡無所遁形。</Row>
      <Row label="說書人">這是一場被精心安排的劇本，說書人會依照<Key>遊戲樂趣</Key>與<Key>局勢平衡</Key>來安排訊息與劇情。只要<Key>機率不為 0</Key>，就很有機會發生。</Row>
      <Row label="展現演技">你可以宣稱自己是任何人，說書人會配合你演戲；縱使你不是獵手，也可以公開宣稱惡魔是誰，說書人總會回應你。</Row>
    </ul>
  </div>
);

export const LobbyGuideModal = ({ open, onClose }: LobbyGuideModalProps) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/25 bg-[#12100f]/95 shadow-[0_0_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
          <h2 className="font-serif text-xl font-bold tracking-widest text-[#ff6b6b]">
            {open === "intro" ? "遊戲介紹" : "新手技巧"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto px-6 py-5">
          {open === "intro" ? <IntroContent /> : <TipsContent />}
        </div>
      </div>
    </div>,
    document.body
  );
};
