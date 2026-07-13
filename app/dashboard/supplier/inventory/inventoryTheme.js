/** Design tokens for inventory dashboard — aligned with Zareoon catalog green palette */

export const inv = {
  page: "mx-auto w-full max-w-7xl space-y-4 pb-6 sm:space-y-6",
  card: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHeader: "border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-4",
  cardBody: "p-4 sm:p-5",
  label: "mb-1.5 block text-sm font-medium text-slate-700",
  labelCompact: "mb-1 block text-xs font-medium text-slate-600",
  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100",
  inputCompact:
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100",
  select: "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100",
  selectCompact:
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100",
  textarea:
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100",
  textareaCompact:
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100",
  createPage: "mx-auto w-full max-w-2xl space-y-3 pb-4 sm:max-w-3xl sm:space-y-4 sm:pb-6",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  btnPrimaryBlock: "w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
  btnGhost: "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
  btnDanger: "text-rose-600 hover:bg-rose-50",
  btnEdit: "text-emerald-700 hover:bg-emerald-50",
  btnMedia: "text-sky-700 hover:bg-sky-50",
  btnView: "text-slate-700 hover:bg-slate-100",
  statCard: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  sectionTitle: "text-lg font-bold text-slate-900 sm:text-xl",
  sectionDesc: "mt-0.5 text-sm text-slate-500",
  badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  overlay: "fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4",
  modal:
    "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl lg:max-w-3xl",
  modalLg: "sm:max-w-3xl lg:max-w-4xl",
  modalHeader: "flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5",
  modalBody: "flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5",
  modalFooter: "flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5",
  tabBar: "sticky top-0 z-10 -mx-1 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:hidden",
  tab: (active) =>
    `flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
      active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
    }`,
  empty: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center",
};

export function statusBadgeClass(status) {
  if (status === "harvested") return `${inv.badge} bg-emerald-100 text-emerald-800`;
  if (status === "on_field") return `${inv.badge} bg-lime-100 text-lime-800`;
  if (status === "reserved") return `${inv.badge} bg-amber-100 text-amber-800`;
  if (status === "sold") return `${inv.badge} bg-sky-100 text-sky-800`;
  return `${inv.badge} bg-slate-100 text-slate-700`;
}

export function gradeBadgeClass() {
  return `${inv.badge} bg-indigo-100 text-indigo-800`;
}

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#10b981" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.2)" : "none",
    minHeight: "42px",
    fontSize: "0.875rem",
  }),
  menu: (base) => ({ ...base, borderRadius: "0.75rem", overflow: "hidden", zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "#ecfdf5" : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
};
