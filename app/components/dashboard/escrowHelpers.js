/** Escrow i18n helpers — all UI text from messages/fa/escrow.json */

export function workflowStepIndex(status) {
  if (status === "draft") return 0;
  if (status === "awaiting_payment") return 1;
  if (status === "funds_locked") return 2;
  if (["in_progress", "partially_released", "disputed"].includes(status)) return 3;
  if (["completed", "fully_released", "refunded", "cancelled", "expired"].includes(status)) return 4;
  return 0;
}

export function getStatusGuide(t, agreement, role) {
  const s = agreement?.status;
  const roleLabel = t(`roles.${role}`, { defaultMessage: role });
  const guide = t.raw(`statusGuides.${s}`);

  if (!guide || typeof guide !== "object") {
    return { title: t("defaultStatusTitle"), body: t("genericHint") };
  }

  let body = guide.bodyDefault || "";
  if (s === "draft") {
    if (role === "admin") body = guide.bodyAdmin || body;
    else if (role === "buyer") body = guide.bodyBuyer || body;
    else if (role === "seller") body = guide.bodySeller || body;
    else body = t("statusGuides.draft.bodyDefault", { role: roleLabel });
  } else if (s === "awaiting_payment") {
    if (role === "buyer" || role === "admin") body = guide.bodyBuyer || body;
  }

  return { title: guide.title || t("defaultStatusTitle"), body: body || t("genericHint") };
}

export function getEscrowAction(t, actionId) {
  const raw = t.raw(`actions.${actionId}`);
  if (!raw || typeof raw !== "object") return null;
  return { id: actionId, ...raw };
}

export function labelMap(t, prefix) {
  const raw = t.raw(prefix);
  if (!raw || typeof raw !== "object") return {};
  return raw;
}

const WORKFLOW_STEP_ORDER = [
  "draft",
  "awaiting_payment",
  "funds_locked",
  "in_progress",
  "completed",
];

export function getWorkflowSteps(t) {
  const raw = t.raw("workflowSteps");
  if (!raw || typeof raw !== "object") return [];
  return WORKFLOW_STEP_ORDER.map((key) => ({ key, ...(raw[key] || {}) }));
}
