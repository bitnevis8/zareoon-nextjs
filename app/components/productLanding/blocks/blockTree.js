/**
 * جستجو و به‌روزرسانی بلوک‌ها — از جمله بلوک‌های تو در تو داخل columnLayout
 */

export function findBlockById(blocks, blockId) {
  if (!blockId) return null;
  for (const b of blocks || []) {
    if (b?.id === blockId) return b;
    if (b?.type === "columnLayout") {
      for (const col of b.props?.columns || []) {
        const hit = findBlockById(col.blocks || [], blockId);
        if (hit) return hit;
      }
    }
  }
  return null;
}

/** patchFn(block) => nextBlock */
export function patchBlockById(blocks, blockId, patchFn) {
  let found = false;
  const walk = (list) =>
    (list || []).map((b) => {
      if (b?.id === blockId) {
        found = true;
        return patchFn(b);
      }
      if (b?.type === "columnLayout" && Array.isArray(b.props?.columns)) {
        return {
          ...b,
          props: {
            ...b.props,
            columns: b.props.columns.map((col) => ({
              ...col,
              blocks: walk(col.blocks || []),
            })),
          },
        };
      }
      return b;
    });
  return { blocks: walk(blocks), found };
}

export function emptyColumn() {
  return {
    id: `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    blocks: [],
  };
}

export function makeColumns(count) {
  return Array.from({ length: Math.max(1, count) }, () => emptyColumn());
}

/** تعداد ستون بر اساس واریانت */
export function columnCountForVariant(variant, existingLen = 2) {
  if (variant === "three") return 3;
  if (variant === "two" || variant === "aside" || variant === "aside-start") return 2;
  return Math.min(3, Math.max(2, existingLen || 2));
}

/** هم‌تراز کردن آرایهٔ ستون‌ها با واریانت (حفظ بلوک‌های قبلی) */
export function syncColumnsToVariant(columns, variant) {
  const target = columnCountForVariant(variant, columns?.length);
  const list = Array.isArray(columns) ? columns.map((c) => ({ ...c, blocks: [...(c.blocks || [])] })) : [];
  while (list.length < target) list.push(emptyColumn());
  if (list.length > target) {
    const overflow = list.slice(target).flatMap((c) => c.blocks || []);
    list.length = target;
    if (overflow.length) {
      list[list.length - 1].blocks = [...(list[list.length - 1].blocks || []), ...overflow].slice(0, 12);
    }
  }
  return list;
}
