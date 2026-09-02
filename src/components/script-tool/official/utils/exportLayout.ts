/**
 * 匯出（列印 PDF / 匯出圖片）用的版面工具。
 *
 * 劇本預覽的角色清單是雙欄響應式版面，寬度一變就重排。
 * 匯出時若讓它以 A4 的窄寬度重排會變得又高又醜；固定成「桌面版面寬度」
 * 就能得到與畫面一致的結果，再視需要整頁縮放到一張 A4。
 */

/** 列印時各預覽頁強制使用的桌面版面寬度（px） */
export const EXPORT_REF_WIDTH = 1200;

/** A4 直式在 96dpi 下的 CSS 像素（210mm × 297mm），SAFETY 留邊界避免多印一張空白頁 */
const A4_W = 794;
const A4_H = 1122;
const SAFETY = 0.94; // 稍微縮小，四周留一圈「畫框」邊距，看起來更像成品 PDF

/** 列印頁的底色（與劇本紙張同色系），讓縮放後的留白偽裝成畫框 */
export const PRINT_MAT_COLOR = '#F6F1DC';

const CHILD_PROPS = ['transform', 'transformOrigin', 'width', 'height', 'flex', 'alignSelf'] as const;

export const EXPORT_PAGE_IDS = [
  'script-preview',
  'script-preview-2',
  'script-preview-3',
  'script-preview-4',
] as const;

/**
 * 把預覽頁固定成桌面寬度、高度隨內容自然撐開（不受 flex 拉伸）。
 * 回傳量測到的自然尺寸（以桌面寬度重排後）。
 */
export function pinToDesktopWidth(el: HTMLElement): { width: number; height: number } {
  const child = el.firstElementChild as HTMLElement | null;
  el.style.setProperty('width', `${EXPORT_REF_WIDTH}px`, 'important');
  el.style.setProperty('height', 'auto', 'important');
  if (child) {
    child.style.setProperty('width', `${EXPORT_REF_WIDTH}px`, 'important');
    child.style.setProperty('height', 'auto', 'important');
    child.style.setProperty('flex', 'none', 'important');
    child.style.setProperty('align-self', 'flex-start', 'important');
  }
  return { width: EXPORT_REF_WIDTH, height: child ? child.offsetHeight : el.offsetHeight };
}

/** 清掉 pin / scale 期間加上的行內樣式 */
export function resetExportLayout(el: HTMLElement): void {
  const child = el.firstElementChild as HTMLElement | null;
  el.style.removeProperty('width');
  el.style.removeProperty('height');
  el.style.removeProperty('overflow');
  el.style.removeProperty('margin');
  el.style.removeProperty('margin-top');
  el.style.removeProperty('margin-bottom');
  el.style.removeProperty('box-shadow');
  el.style.removeProperty('border-radius');
  if (child) {
    for (const prop of CHILD_PROPS) {
      child.style[prop] = '';
    }
  }
}

/**
 * 列印前：把每個預覽頁固定成桌面寬度後整頁縮放到剛好一張 A4，
 * 外層縮成縮放後尺寸並裁掉溢出 → 瀏覽器以「一頁盒子」分頁，不裁切、不多頁。
 */
export function applyPrintLayout(): void {
  for (const id of EXPORT_PAGE_IDS) {
    const el = document.getElementById(id);
    if (!el || !el.firstElementChild) continue;
    const child = el.firstElementChild as HTMLElement;

    const { width, height } = pinToDesktopWidth(el);
    if (height < 1) continue;

    const scale = Math.min(A4_W / width, A4_H / height) * SAFETY;
    const finalScale = scale < 1 ? scale : 1;
    const scaledW = width * finalScale;
    const scaledH = height * finalScale;

    child.style.transformOrigin = 'top left';
    child.style.transform = finalScale < 1 ? `scale(${finalScale})` : 'none';

    el.style.setProperty('width', `${scaledW}px`, 'important');
    el.style.setProperty('height', `${scaledH}px`, 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    // 在 A4 版面上置中：水平 margin auto，垂直用剩餘空間的一半
    const topMargin = Math.max(0, (A4_H - scaledH) / 2);
    el.style.setProperty('margin', `${topMargin}px auto`, 'important');
    // 一點陰影 + 圓角，讓縮放後的劇本像是貼在畫框上的成品
    el.style.setProperty('box-shadow', '0 2px 14px rgba(0,0,0,0.18)', 'important');
    el.style.setProperty('border-radius', '4px', 'important');
  }
}

/** 列印後：還原全部預覽頁 */
export function resetPrintLayout(): void {
  for (const id of EXPORT_PAGE_IDS) {
    const el = document.getElementById(id);
    if (el) resetExportLayout(el);
  }
}
