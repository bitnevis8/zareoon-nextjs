"use client";

export default function AttributeFields({ defs = [], values = {}, onChange, className = "" }) {
  if (!defs.length) return null;

  return (
    <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {defs.map((def) => (
        <div key={def.id} className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">{def.name}</label>
          {def.type === "number" ? (
            <input
              type="number"
              className="rounded-lg border border-gray-300 p-2.5 text-sm"
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          ) : def.type === "boolean" ? (
            <select
              className="rounded-lg border border-gray-300 p-2.5 text-sm"
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            >
              <option value="">—</option>
              <option value="true">بلی</option>
              <option value="false">خیر</option>
            </select>
          ) : def.type === "date" ? (
            <input
              type="date"
              className="rounded-lg border border-gray-300 p-2.5 text-sm"
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          ) : def.type === "select" && Array.isArray(def.options) ? (
            <select
              className="rounded-lg border border-gray-300 p-2.5 text-sm"
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            >
              <option value="">—</option>
              {def.options.map((opt) => (
                <option key={String(opt?.value ?? opt)} value={String(opt?.value ?? opt)}>
                  {String(opt?.label ?? opt)}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="rounded-lg border border-gray-300 p-2.5 text-sm"
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
