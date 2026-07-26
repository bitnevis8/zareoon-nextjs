/** Escrow i18n helpers — workflow + guides */

export function workflowStepIndex(status) {
  if (status === "draft") return 0;
  if (status === "awaiting_signatures") return 1;
  if (status === "awaiting_payment") return 2;
  if (status === "funds_locked") return 3;
  if (["in_progress", "partially_released", "disputed"].includes(status)) return 4;
  if (["completed", "fully_released", "refunded", "cancelled", "expired"].includes(status)) return 5;
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
  if (role === "admin" && guide.bodyAdmin) body = guide.bodyAdmin;
  else if (role === "buyer" && guide.bodyBuyer) body = guide.bodyBuyer;
  else if (role === "seller" && guide.bodySeller) body = guide.bodySeller;
  else if (guide.bodyDefault) body = String(guide.bodyDefault).replace("{role}", roleLabel);

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
  "awaiting_signatures",
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
